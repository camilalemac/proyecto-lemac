import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube un buffer PDF a Cloudinary y retorna la URL pública de descarga.
 */
export const subirPDF = async (buffer: Buffer, nombreArchivo: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || "documentos-escolares";
    const publicId = `${folder}/${nombreArchivo}-${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        format: "pdf",
        access_mode: "public",
      },
      (error, result) => {
        if (error) {
          logger.error("[ms-documentos][cloudinary] Error al subir PDF", { error });
          reject(error);
          return;
        }
        logger.info("[ms-documentos][cloudinary] PDF subido correctamente", {
          url: result?.secure_url,
        });
        resolve(result?.secure_url ?? "");
      },
    );

    uploadStream.end(buffer);
  });
};
