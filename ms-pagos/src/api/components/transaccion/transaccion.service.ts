import { Transaction } from "sequelize";
import sequelize from "../../../config/database.config";
import { transaccionRepository } from "./transaccion.repository";
import { cuentaCobrarRepository } from "../cuentaCobrar/cuentaCobrar.repository";
import { metodoPagoService } from "../metodoPago/metodoPago.service";
import { IPasarelaPago } from "../../../pasarela/pasarela.interface";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";
import CuentaCobrarModel from "../../../models/cuentaCobrar.model";

// ÚNICA PASARELA DIGITAL: MercadoPago
import { MercadoPagoAdapter } from "../../../pasarela/mercadopago.adapter";

const METODO_MERCADOPAGO = "MERCADOPAGO";

const obtenerAdaptadorPasarela = (metodoPago: string): IPasarelaPago => {
  if (metodoPago.toUpperCase() === METODO_MERCADOPAGO) {
    return new MercadoPagoAdapter();
  }
  throw new ApiError(
    400,
    `Método de pago "${metodoPago}" no soportado. Actualmente solo utilizamos MercadoPago.`,
  );
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
    await transaccionRepository.registrar(
      {
        COLEGIO_ID: colegioId,
        COBRO_ID: cobroId,
        MONTO_PAGO: montoPorCobro,
        METODO_PAGO: metodoPago,
      },
      t,
    );
  }
};

export interface ResultadoInicioPago {
  urlPago: string;
  token: string;
  cotizacion: object;
}

export const transaccionService = {
  /**
   * Inicia el proceso de pago con MercadoPago.
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

    // Usamos una URL de retorno general para tu Frontend
    const returnUrl = process.env.FRONTEND_RETURN_URL || "http://localhost:5173/pago-exitoso";

    const resultado = await pasarela.iniciarPago({
      monto: cotizacion.montoTotal,
      descripcion: `Pago de ${cobrosPendientes.length} cuota(s)`,
      returnUrl,
      cobrosIds: data.cobrosIds,
      colegioId: data.colegioId,
    });

    logger.info("[ms-pagos] Pago iniciado en MercadoPago", {
      monto: cotizacion.montoTotal,
      cobros: data.cobrosIds,
    });

    return {
      urlPago: resultado.urlPago,
      token: resultado.tokenPasarela, // Es el PreferenceID de MercadoPago
      cotizacion,
    };
  },

  /**
   * Con MercadoPago, la confirmación real la hace el Webhook.
   * Bloqueamos este método para evitar que el frontend intente confirmar pagos digitales.
   */
  confirmarPago: async (_data: {
    token: string;
    cobrosIds: number[];
    colegioId: number;
    metodoPago: string;
  }): Promise<{ aprobado: boolean; mensaje: string }> => {
    throw new ApiError(
      400,
      "La confirmación de pagos de MercadoPago se procesa automáticamente vía Webhook. No se debe llamar a este método.",
    );
  },

  /**
   * Confirmación manual (Efectivo / Transferencia Bancaria directa) — ejecutada por el tesorero.
   */
  confirmarPagoManual: async (data: {
    cobrosIds: number[];
    colegioId: number;
    metodo: string;
  }): Promise<void> => {
    await sequelize.transaction(async (t: Transaction) => {
      await procesarCobrosPagados(data.cobrosIds, data.colegioId, data.metodo, t);
    });
    logger.info("[ms-pagos] Pago manual confirmado por tesorería", {
      cobros: data.cobrosIds,
      metodo: data.metodo,
    });
  },
};
