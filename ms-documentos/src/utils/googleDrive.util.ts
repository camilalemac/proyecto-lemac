import { google } from "googleapis";
import { Readable } from "stream";
import { logger } from "./logger";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
  key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

export const subirPDFADrive = async (
  pdfBuffer: Buffer,
  nombreArchivo: string,
): Promise<string | null> => {
  try {
    // Creamos el stream de forma más robusta
    const stream = new Readable();
    stream.push(pdfBuffer);
    stream.push(null);

    const fileMetadata = {
      name: `${nombreArchivo}-${Date.now()}.pdf`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    };

    const media = {
      mimeType: "application/pdf",
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
      // Estas banderas ayudan a evitar problemas de permisos en carpetas compartidas
      supportsAllDrives: true,
      keepRevisionForever: true,
    } as any);

    // Inmediatamente después de crear, damos permiso de lectura a todos
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    logger.info(`[Google Drive] Archivo subido con ID: ${response.data.id}`);
    return response.data.webViewLink!;
  } catch (error: any) {
    // Esto nos dirá exactamente qué dice Google ahora
    const errorMsg = error.response?.data?.error?.message || error.message;
    logger.error(`[Google Drive] Error detallado: ${errorMsg}`);
    return null;
  }
};
