import { Transaction } from "sequelize";
import sequelize from "../../../config/database.config";
import { transaccionRepository } from "./transaccion.repository";
import { cuentaCobrarRepository } from "../cuentaCobrar/cuentaCobrar.repository";
import { cuentaBancariaRepository } from "../cuentaBancaria/cuentaBancaria.repository";
import { conceptoRepository } from "../concepto/concepto.repository";
import { metodoPagoService } from "../metodoPago/metodoPago.service";
import { WebpayAdapter } from "../../../pasarela/webpay.adapter";
import { KhipuAdapter } from "../../../pasarela/khipu.adapter";
import { TransferenciaAdapter } from "../../../pasarela/transferencia.adapter";
import { IPasarelaPago } from "../../../pasarela/pasarela.interface";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";
import Transaccion from "../../../models/transaccion.model";
import CuentaCobrarModel from "../../../models/cuentaCobrar.model";

const METODO_WEBPAY = "WEBPAY";
const METODO_KHIPU = "KHIPU";
const METODO_TRANSFERENCIA = "TRANSFERENCIA";

const obtenerAdaptadorPasarela = (metodoPago: string): IPasarelaPago => {
  switch (metodoPago.toUpperCase()) {
    case METODO_WEBPAY:
      return new WebpayAdapter();
    case METODO_KHIPU:
      return new KhipuAdapter();
    case METODO_TRANSFERENCIA:
      return new TransferenciaAdapter();
    default:
      throw new ApiError(400, `Método de pago "${metodoPago}" no soportado`);
  }
};

const procesarCobrosPagados = async (
  cobrosIds: number[],
  colegioId: number,
  t: Transaction,
): Promise<void> => {
  for (const cobroId of cobrosIds) {
    const cobro = await CuentaCobrarModel.findOne({
      where: { COBRO_ID: cobroId },
      transaction: t,
    });

    if (!cobro) continue;

    const montoPorCobro = Number(cobro.MONTO_ORIGINAL) - Number(cobro.DESCUENTO);

    await CuentaCobrarModel.update(
      { ESTADO: "PAGADO", MONTO_PAGADO: montoPorCobro },
      { where: { COBRO_ID: cobroId }, transaction: t },
    );

    const concepto = await conceptoRepository.findById(cobro.CONCEPTO_ID, colegioId);
    if (concepto) {
      await cuentaBancariaRepository.actualizarSaldo(
        concepto.CUENTA_DESTINO_ID,
        colegioId,
        montoPorCobro,
      );
    }
  }
};

export const transaccionService = {
  obtenerTransaccion: async (transaccionId: number, colegioId: number): Promise<Transaccion> => {
    const transaccion = await transaccionRepository.findById(transaccionId, colegioId);
    if (!transaccion) throw new ApiError(404, `Transacción con ID ${transaccionId} no encontrada`);
    return transaccion;
  },

  iniciarPago: async (data: {
    colegioId: number;
    cobrosIds: number[];
    metodoId: number;
    metodoPagoNombre: string;
  }): Promise<{ urlPago: string; transaccionId: number; cotizacion: object }> => {
    const cobros = await cuentaCobrarRepository.findByIds(data.cobrosIds, data.colegioId);

    if (cobros.length !== data.cobrosIds.length) {
      throw new ApiError(400, "Uno o más cobros no fueron encontrados");
    }

    const cobrosPendientes = cobros.filter((c) => c.ESTADO === "PENDIENTE");
    if (cobrosPendientes.length !== cobros.length) {
      throw new ApiError(409, "Todos los cobros deben estar en estado PENDIENTE");
    }

    const montoOriginal = cobrosPendientes.reduce(
      (acc, c) => acc + (Number(c.MONTO_ORIGINAL) - Number(c.DESCUENTO)),
      0,
    );
    const cotizacion = await metodoPagoService.cotizarPago(
      montoOriginal,
      data.metodoId,
      data.colegioId,
    );

    const transaccion = await transaccionRepository.create({
      COLEGIO_ID: data.colegioId,
      COBRO_IDS: data.cobrosIds.join(","),
      MONTO_PAGO: cotizacion.montoTotal,
      METODO_PAGO: data.metodoPagoNombre.toUpperCase(),
    });

    const pasarela = obtenerAdaptadorPasarela(data.metodoPagoNombre);
    const returnUrl = `${process.env.WEBPAY_RETURN_URL || "http://localhost:3005/api/v1/pagos/transacciones"}/retorno`;

    const resultado = await pasarela.iniciarPago({
      monto: cotizacion.montoTotal,
      descripcion: `Pago de ${cobrosPendientes.length} cuota(s)`,
      transaccionId: transaccion.TRANSACCION_ID!,
      returnUrl,
    });

    await transaccionRepository.update(transaccion.TRANSACCION_ID!, {
      TOKEN_PASARELA: resultado.tokenPasarela,
      URL_PAGO: resultado.urlPago,
    });

    logger.info("[ms-pagos] Pago iniciado", {
      transaccionId: transaccion.TRANSACCION_ID,
      monto: cotizacion.montoTotal,
      metodo: data.metodoPagoNombre,
    });

    return { urlPago: resultado.urlPago, transaccionId: transaccion.TRANSACCION_ID!, cotizacion };
  },

  confirmarPago: async (token: string): Promise<{ aprobado: boolean; mensaje: string }> => {
    const transaccion = await transaccionRepository.findByToken(token);
    if (!transaccion)
      throw new ApiError(404, "Transacción no encontrada para el token proporcionado");
    if (transaccion.ESTADO !== "PENDIENTE")
      throw new ApiError(409, "Esta transacción ya fue procesada");

    const pasarela = obtenerAdaptadorPasarela(transaccion.METODO_PAGO);
    const resultado = await pasarela.confirmarPago({ tokenPasarela: token });

    await sequelize.transaction(async (t: Transaction) => {
      if (resultado.aprobado) {
        await Transaccion.update(
          { ESTADO: "APROBADA", FECHA_PAGO: new Date() },
          { where: { TRANSACCION_ID: transaccion.TRANSACCION_ID }, transaction: t },
        );
        const cobrosIds = transaccion.COBRO_IDS.split(",").map(Number);
        await procesarCobrosPagados(cobrosIds, transaccion.COLEGIO_ID, t);
      } else {
        await Transaccion.update(
          { ESTADO: "RECHAZADA" },
          { where: { TRANSACCION_ID: transaccion.TRANSACCION_ID }, transaction: t },
        );
      }
    });

    logger.info("[ms-pagos] Pago confirmado", {
      transaccionId: transaccion.TRANSACCION_ID,
      aprobado: resultado.aprobado,
    });

    return { aprobado: resultado.aprobado, mensaje: resultado.mensaje };
  },

  confirmarTransferenciaManual: async (
    transaccionId: number,
    colegioId: number,
  ): Promise<Transaccion> => {
    const transaccion = await transaccionService.obtenerTransaccion(transaccionId, colegioId);
    if (transaccion.METODO_PAGO !== METODO_TRANSFERENCIA) {
      throw new ApiError(
        409,
        "Solo se pueden confirmar manualmente transacciones de tipo TRANSFERENCIA",
      );
    }
    if (transaccion.ESTADO !== "PENDIENTE") {
      throw new ApiError(409, "Esta transacción ya fue procesada");
    }

    await sequelize.transaction(async (t: Transaction) => {
      await Transaccion.update(
        { ESTADO: "APROBADA", FECHA_PAGO: new Date() },
        { where: { TRANSACCION_ID: transaccionId }, transaction: t },
      );
      const cobrosIds = transaccion.COBRO_IDS.split(",").map(Number);
      await procesarCobrosPagados(cobrosIds, colegioId, t);
    });

    return transaccionService.obtenerTransaccion(transaccionId, colegioId);
  },
};
