import {
  IPasarelaPago,
  IniciarPagoParams,
  IniciarPagoResult,
  ConfirmarPagoParams,
  ConfirmarPagoResult,
} from "./pasarela.interface";
import { logger } from "../utils/logger";

/**
 * Adaptador para transferencia bancaria manual.
 * No redirige a ninguna pasarela externa.
 * El flujo es: sistema genera instrucciones de pago → apoderado transfiere →
 * tesorero confirma manualmente el pago en el sistema.
 */
export class TransferenciaAdapter implements IPasarelaPago {
  async iniciarPago(params: IniciarPagoParams): Promise<IniciarPagoResult> {
    logger.info("[ms-pagos][transferencia] Iniciando pago por transferencia manual", {
      transaccionId: params.transaccionId,
      monto: params.monto,
    });

    // Para transferencia manual no hay redirección externa.
    // Se genera un token interno y se devuelve una URL informativa.
    const tokenInterno = `TRF-${params.transaccionId}-${Date.now()}`;

    return {
      urlPago: `${params.returnUrl}?transaccion=${params.transaccionId}&metodo=transferencia`,
      tokenPasarela: tokenInterno,
    };
  }

  /**
   * La confirmación de transferencia es manual — la ejecuta el tesorero.
   * Este método no se usa en el flujo normal de transferencias,
   * pero se implementa para cumplir la interfaz.
   */
  async confirmarPago(params: ConfirmarPagoParams): Promise<ConfirmarPagoResult> {
    logger.info("[ms-pagos][transferencia] Confirmación manual registrada", {
      token: params.tokenPasarela,
    });

    return {
      aprobado: true,
      codigoRespuesta: "MANUAL",
      mensaje: "Transferencia confirmada manualmente por tesorero",
      montoPagado: 0,
    };
  }
}
