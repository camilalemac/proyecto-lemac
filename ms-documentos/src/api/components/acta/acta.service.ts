import { generarPDFActa, DatoActa } from "../../../utils/pdf.util";
import { subirPDFADrive } from "../../../utils/googleDrive.util";
import { Documento } from "../../../models/documento.model";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";

export interface SolicitudActa {
  titulo: string;
  colegio: string;
  colegioId: number;
  cursoId?: number;
  autorId: number;
  fecha: Date;
  lugar: string;
  asistentes: string[];
  contenido: string;
  generadoPor: string;
}

export const actaService = {
  generarActa: async (data: SolicitudActa): Promise<{ urlActa: string; documentoId: number }> => {
    logger.info("[ms-documentos] Generando acta", { titulo: data.titulo });

    const datosPDF: DatoActa = {
      titulo: data.titulo,
      colegio: data.colegio,
      fecha: new Date(data.fecha),
      lugar: data.lugar,
      asistentes: data.asistentes,
      contenido: data.contenido,
      generadoPor: data.generadoPor,
    };

    const pdfBuffer = await generarPDFActa(datosPDF);
    const nombreArchivo = `acta-${data.titulo.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const urlActa = await subirPDFADrive(pdfBuffer, nombreArchivo); // Cambia el nombre de la función

    if (!urlActa) throw new ApiError(502, "Error al subir el acta a la nube");

    const documento = await Documento.create({
      COLEGIO_ID: data.colegioId,
      CURSO_ID: data.cursoId ?? null,
      AUTOR_ID: data.autorId,
      TIPO_DOCUMENTO: "ACTA_REUNION",
      TITULO: data.titulo,
      DESCRIPCION: `Acta de reunión — ${new Date(data.fecha).toLocaleDateString("es-CL")}`,
      URL_ARCHIVO: urlActa,
    });

    logger.info("[ms-documentos] Acta guardada", {
      documentoId: documento.DOCUMENTO_ID,
      url: urlActa,
    });

    return { urlActa, documentoId: documento.DOCUMENTO_ID! };
  },

  listarActas: async (colegioId: number, cursoId?: number): Promise<Documento[]> => {
    const where: Record<string, unknown> = {
      COLEGIO_ID: colegioId,
      TIPO_DOCUMENTO: "ACTA_REUNION",
    };
    if (cursoId) where.CURSO_ID = cursoId;
    return Documento.findAll({ where, order: [["FECHA_DE_CREACION", "DESC"]] });
  },
};
