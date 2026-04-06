import { resend, FROM_EMAIL } from "../../../config/resend.config";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";

export interface CorreoPagosPendientes {
  destinatario: string;
  nombreApoderado: string;
  nombreAlumno: string;
  cuotas: { concepto: string; monto: number; vencimiento: string }[];
  totalPendiente: number;
}

export interface CorreoConfirmacionPago {
  destinatario: string;
  nombreApoderado: string;
  monto: number;
  metodoPago: string;
  fecha: string;
  cobros: { concepto: string; monto: number }[];
}

export interface CorreoRecuperacionClave {
  destinatario: string;
  nombreUsuario: string;
  enlaceRecuperacion: string;
}

export const correoService = {
  enviarPagosPendientes: async (data: CorreoPagosPendientes): Promise<void> => {
    const listaCuotas = data.cuotas
      .map(
        (c) =>
          `<li>${c.concepto} — $${c.monto.toLocaleString("es-CL")} (vence: ${c.vencimiento})</li>`,
      )
      .join("");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.destinatario,
      subject: `Aviso de pagos pendientes — ${data.nombreAlumno}`,
      html: `
        <h2>Estimado/a ${data.nombreApoderado}</h2>
        <p>Le informamos que el/la alumno/a <strong>${data.nombreAlumno}</strong> tiene los siguientes pagos pendientes:</p>
        <ul>${listaCuotas}</ul>
        <p><strong>Total pendiente: $${data.totalPendiente.toLocaleString("es-CL")}</strong></p>
        <p>Por favor, realice el pago a la brevedad a través del sistema.</p>
        <br/>
        <p><em>Sistema de Gestión Escolar</em></p>
      `,
    });

    if (error) {
      logger.error("[ms-documentos] Error al enviar correo pagos pendientes", { error });
      throw new ApiError(502, "Error al enviar el correo de notificación");
    }

    logger.info("[ms-documentos] Correo pagos pendientes enviado", {
      destinatario: data.destinatario,
    });
  },

  enviarConfirmacionPago: async (data: CorreoConfirmacionPago): Promise<void> => {
    const listaCobros = data.cobros
      .map((c) => `<li>${c.concepto}: $${c.monto.toLocaleString("es-CL")}</li>`)
      .join("");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.destinatario,
      subject: "Confirmación de pago recibido",
      html: `
        <h2>Estimado/a ${data.nombreApoderado}</h2>
        <p>Su pago ha sido procesado exitosamente.</p>
        <p><strong>Detalle del pago:</strong></p>
        <ul>${listaCobros}</ul>
        <p><strong>Monto total pagado: $${data.monto.toLocaleString("es-CL")}</strong></p>
        <p>Método de pago: ${data.metodoPago}</p>
        <p>Fecha: ${data.fecha}</p>
        <br/>
        <p><em>Sistema de Gestión Escolar</em></p>
      `,
    });

    if (error) {
      logger.error("[ms-documentos] Error al enviar confirmación de pago", { error });
      throw new ApiError(502, "Error al enviar el correo de confirmación");
    }

    logger.info("[ms-documentos] Confirmación de pago enviada", {
      destinatario: data.destinatario,
    });
  },

  enviarRecuperacionClave: async (data: CorreoRecuperacionClave): Promise<void> => {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.destinatario,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Estimado/a ${data.nombreUsuario}</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de su cuenta.</p>
        <p>Haga clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p><a href="${data.enlaceRecuperacion}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 30 minutos. Si no solicitó este cambio, ignore este correo.</p>
        <br/>
        <p><em>Sistema de Gestión Escolar</em></p>
      `,
    });

    if (error) {
      logger.error("[ms-documentos] Error al enviar correo recuperación clave", { error });
      throw new ApiError(502, "Error al enviar el correo de recuperación");
    }

    logger.info("[ms-documentos] Correo recuperación clave enviado", {
      destinatario: data.destinatario,
    });
  },
};
