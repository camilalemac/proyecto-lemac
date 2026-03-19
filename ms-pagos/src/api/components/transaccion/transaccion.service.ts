import { Transaction } from "sequelize";
import sequelize from "../../../config/database.config";
import { transaccionRepository } from "./transaccion.repository";
import { cuentaCobrarRepository } from "../cuentaCobrar/cuentaCobrar.repository";
import { metodoPagoService } from "../metodoPago/metodoPago.service";
import { WebpayAdapter } from "../../../pasarela/webpay.adapter";
import { KhipuAdapter } from "../../../pasarela/khipu.adapter";
import { TransferenciaAdapter } from "../../../pasarela/transferencia.adapter";
import { IPasarelaPago } from "../../../pasarela/pasarela.interface";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";
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

/**
 * Marca los cobros como PAGADO y registra cada uno en PAG_TRANSACCIONES (Blockchain).
 * Un registro por cobro — la tabla no acepta COBROS_IDS múltiples.
 */
const procesarCobrosPagados = async (
  cobrosIds: number[],
  colegioId: number,
  metodoPago: string,
  t: Transaction,
): Promise<void> => {
  for (const cobroId of cobrosIds) {
    const cobro = await CuentaCobrarModel.findOne({ where: { COBRO_ID: cobroId }, transaction: t });
    if (!cobro) continue;

    const montoPorCobro = Number(cobro.MONTO_ORIGINAL) - Number(cobro.DESCUENTO);

    await CuentaCobrarModel.update(
      { ESTADO: "PAGADO", MONTO_PAGADO: montoPorCobro },
      { where: { COBRO_ID: cobroId }, transaction: t },
    );

    // Registrar evidencia inmutable en tabla Blockchain — un INSERT por cobro
    await transaccionRepository.registrar({
      COLEGIO_ID: colegioId,
      COBRO_ID: cobroId,
      MONTO_PAGO: montoPorCobro,
      METODO_PAGO: metodoPago,
    });
  }
};

export interface ResultadoInicioPago {
  urlPago: string;
  token: string;
  cotizacion: object;
}

export const transaccionService = {
  /**
   * Inicia el proceso de pago.
   * Retorna la URL de redirección al banco y el token para confirmar después.
   * El token se retorna al frontend para que lo guarde temporalmente.
   */
  iniciarPago: async (data: {
    colegioId: number;
    cobrosIds: number[];
    metodoId: number;
    metodoPagoNombre: string;
  }): Promise<ResultadoInicioPago> => {
    const cobros = await cuentaCobrarRepository.findByIds(data.cobrosIds, data.colegioId);
    if (cobros.length !== data.cobrosIds.length)
      throw new ApiError(400, "Uno o más cobros no fueron encontrados");

    const cobrosPendientes = cobros.filter((c) => c.ESTADO === "PENDIENTE");
    if (cobrosPendientes.length !== cobros.length)
      throw new ApiError(409, "Todos los cobros deben estar en estado PENDIENTE");

    const montoOriginal = cobrosPendientes.reduce(
      (acc, c) => acc + (Number(c.MONTO_ORIGINAL) - Number(c.DESCUENTO)),
      0,
    );
    const cotizacion = await metodoPagoService.cotizarPago(
      montoOriginal,
      data.metodoId,
      data.colegioId,
    );

    const pasarela = obtenerAdaptadorPasarela(data.metodoPagoNombre);
    const returnUrl = `${process.env.WEBPAY_RETURN_URL || "http://localhost:3005/api/v1/pagos/transacciones"}/retorno`;

    const resultado = await pasarela.iniciarPago({
      monto: cotizacion.montoTotal,
      descripcion: `Pago de ${cobrosPendientes.length} cuota(s)`,
      transaccionId: Date.now(),
      returnUrl,
    });

    logger.info("[ms-pagos] Pago iniciado", {
      monto: cotizacion.montoTotal,
      metodo: data.metodoPagoNombre,
      cobros: data.cobrosIds,
    });

    return {
      urlPago: resultado.urlPago,
      token: resultado.tokenPasarela,
      cotizacion,
    };
  },

  /**
   * Confirma el pago retornado por la pasarela.
   * cobrosIds y colegioId vienen del frontend junto al token de retorno.
   */
  confirmarPago: async (data: {
    token: string;
    cobrosIds: number[];
    colegioId: number;
    metodoPago: string;
  }): Promise<{ aprobado: boolean; mensaje: string }> => {
    const pasarela = obtenerAdaptadorPasarela(data.metodoPago);
    const resultado = await pasarela.confirmarPago({ tokenPasarela: data.token });

    if (resultado.aprobado) {
      await sequelize.transaction(async (t: Transaction) => {
        await procesarCobrosPagados(data.cobrosIds, data.colegioId, data.metodoPago, t);
      });
    }

    logger.info("[ms-pagos] Pago confirmado", {
      aprobado: resultado.aprobado,
      cobros: data.cobrosIds,
    });
    return { aprobado: resultado.aprobado, mensaje: resultado.mensaje };
  },

  /**
   * Confirmación manual de transferencia bancaria — ejecutada por el tesorero.
   */
  confirmarTransferenciaManual: async (data: {
    cobrosIds: number[];
    colegioId: number;
  }): Promise<void> => {
    await sequelize.transaction(async (t: Transaction) => {
      await procesarCobrosPagados(data.cobrosIds, data.colegioId, METODO_TRANSFERENCIA, t);
    });
    logger.info("[ms-pagos] Transferencia manual confirmada", { cobros: data.cobrosIds });
  },
};
