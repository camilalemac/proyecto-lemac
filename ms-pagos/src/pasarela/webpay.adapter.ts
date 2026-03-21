import { WebpayPlus, IntegrationCommerceCodes, IntegrationApiKeys } from "transbank-sdk";
import {
  IPasarelaPago,
  IniciarPagoParams,
  IniciarPagoResult,
  ConfirmarPagoParams,
  ConfirmarPagoResult,
} from "./pasarela.interface";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

export class WebpayAdapter implements IPasarelaPago {
  private readonly tx: InstanceType<typeof WebpayPlus.Transaction>;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      const commerceCode = process.env.WEBPAY_COMMERCE_CODE;
      const apiKey = process.env.WEBPAY_API_KEY;
      if (!commerceCode || !apiKey) {
        throw new ApiError(
          500,
          "[ms-pagos] WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY son requeridos en producción",
        );
      }
      this.tx = WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey);
    } else {
      this.tx = WebpayPlus.Transaction.buildForIntegration(
        IntegrationCommerceCodes.WEBPAY_PLUS,
        IntegrationApiKeys.WEBPAY,
      );
    }
  }

  async iniciarPago(params: IniciarPagoParams): Promise<IniciarPagoResult> {
    const buyOrder = `TXN-${params.transaccionId}-${Date.now()}`;
    const sessionId = `SES-${params.transaccionId}`;

    logger.info("[ms-pagos][webpay] Iniciando pago", {
      transaccionId: params.transaccionId,
      monto: params.monto,
    });

    const response = await this.tx.create(buyOrder, sessionId, params.monto, params.returnUrl);

    return {
      urlPago: `${response.url}?token_ws=${response.token}`,
      tokenPasarela: response.token,
    };
  }

  async confirmarPago(params: ConfirmarPagoParams): Promise<ConfirmarPagoResult> {
    logger.info("[ms-pagos][webpay] Confirmando pago", { token: params.tokenPasarela });

    const response = await this.tx.commit(params.tokenPasarela);
    const aprobado = response.status === "AUTHORIZED" && response.response_code === 0;

    return {
      aprobado,
      codigoRespuesta: String(response.response_code),
      mensaje: aprobado ? "Pago autorizado" : "Pago rechazado",
      montoPagado: aprobado ? response.amount : 0,
    };
  }
}
