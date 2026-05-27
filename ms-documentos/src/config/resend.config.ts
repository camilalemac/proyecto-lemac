import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("[ms-documentos] RESEND_API_KEY no está definida en las variables de entorno");
}

export const resend = new Resend(apiKey);

export const FROM_EMAIL = `${process.env.RESEND_FROM_NAME || "Sistema Escolar"} <${process.env.RESEND_FROM_EMAIL || "notificaciones@tudominio.cl"}>`;
