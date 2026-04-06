import {
  IPasarelaPago,
  IniciarPagoParams,
  IniciarPagoResult,
  ConfirmarPagoParams,
  ConfirmarPagoResult,
} from "./pasarela.interface";
import { logger } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

export class KhipuAdapter implements IPasarelaPago {
  private readonly receiverId: string;
  private readonly secret: string;
  private readonly apiBase: string;

  constructor() {
    const receiverId = process.env.KHIPU_RECEIVER_ID;
    const secret = process.env.KHIPU_SECRET;

    if (!receiverId || !secret) {
      throw new Error("[ms-pagos] KHIPU_RECEIVER_ID y KHIPU_SECRET son requeridos");
    }

    this.receiverId = receiverId;
    this.secret = secret;
    this.apiBase = "https://khipu.com/api/2.0";
  }

  async iniciarPago(params: IniciarPagoParams): Promise<IniciarPagoResult> {
    logger.info("[ms-pagos][khipu] Iniciando pago", {
      transaccionId: params.transaccionId,
      monto: params.monto,
    });

    const body = new URLSearchParams({
      receiver_id: this.receiverId,
      subject: params.descripcion,
      currency: "CLP",
      amount: String(Math.round(params.monto)),
      transaction_id: String(params.transaccionId),
      return_url: params.returnUrl,
      cancel_url: process.env.KHIPU_CANCEL_URL || params.returnUrl,
      notify_url: `${process.env.KHIPU_RETURN_URL || params.returnUrl}/webhook`,
    });

    const response = await fetch(`${this.apiBase}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.receiverId}:${this.secret}`).toString("base64")}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("[ms-pagos][khipu] Error al crear pago", { error });
      throw new ApiError(502, "Error al conectar con Khipu");
    }

    const data = (await response.json()) as { payment_id: string; payment_url: string };

    return {
      urlPago: data.payment_url,
      tokenPasarela: data.payment_id,
    };
  }

  async confirmarPago(params: ConfirmarPagoParams): Promise<ConfirmarPagoResult> {
    logger.info("[ms-pagos][khipu] Confirmando pago", { paymentId: params.tokenPasarela });

    const response = await fetch(`${this.apiBase}/payments/${params.tokenPasarela}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.receiverId}:${this.secret}`).toString("base64")}`,
      },
    });

    if (!response.ok) {
      throw new ApiError(502, "Error al verificar pago con Khipu");
    }

    const data = (await response.json()) as { status: string; amount: number };
    const aprobado = data.status === "done";

    return {
      aprobado,
      codigoRespuesta: data.status,
      mensaje: aprobado ? "Pago completado" : "Pago no completado",
      montoPagado: aprobado ? data.amount : 0,
    };
  }
}
