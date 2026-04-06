import { generarPDFReporte, DatoReporte } from "../../../utils/pdf.util";
import { subirPDFADrive } from "../../../utils/googleDrive.util";
import DocumentoModel, { TipoDocumento, Documento } from "../../../models/documento.model";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";

export type TipoPeriodo = "mensual" | "trimestral" | "anual";

const mapTipoPeriodo = (tipo: TipoPeriodo): TipoDocumento => {
  const mapa: Record<TipoPeriodo, TipoDocumento> = {
    mensual: "REPORTE_FINANCIERO_MENSUAL",
    trimestral: "REPORTE_FINANCIERO_TRIMESTRAL",
    anual: "REPORTE_FINANCIERO_ANUAL",
  };
  return mapa[tipo] as TipoDocumento;
};

export interface SolicitudReporte {
  titulo: string;
  colegio: string;
  colegioId: number;
  cursoId?: number;
  autorId: number;
  curso?: string;
  periodo: string;
  tipoPeriodo: TipoPeriodo;
  generadoPor: string;
  ingresos: { descripcion: string; monto: number; fecha: string }[];
  egresos: { descripcion: string; monto: number; fecha: string }[];
  cuotasPagadas: { alumno: string; concepto: string; monto: number; fecha: string }[];
  cuotasPendientes: { alumno: string; concepto: string; monto: number; vencimiento: string }[];
  saldoInicial: number;
  saldoFinal: number;
}

export const reporteService = {
  generarReporte: async (
    data: SolicitudReporte,
  ): Promise<{ urlReporte: string; documentoId: number }> => {
    logger.info("[ms-documentos] Generando reporte", { tipo: data.tipoPeriodo, curso: data.curso });

    const datosPDF: DatoReporte = {
      titulo: data.titulo,
      colegio: data.colegio,
      curso: data.curso,
      periodo: data.periodo,
      generadoPor: data.generadoPor,
      fechaGeneracion: new Date(),
      ingresos: data.ingresos,
      egresos: data.egresos,
      cuotasPagadas: data.cuotasPagadas,
      cuotasPendientes: data.cuotasPendientes,
      saldoInicial: data.saldoInicial,
      saldoFinal: data.saldoFinal,
    };

    const pdfBuffer = await generarPDFReporte(datosPDF);
    const nombreArchivo = `reporte-${data.tipoPeriodo}-${data.curso ?? "general"}-${Date.now()}`;
    const urlReporte = await subirPDFADrive(pdfBuffer, nombreArchivo);

    if (!urlReporte) throw new ApiError(502, "Error al subir el reporte a la nube");

    const documento = await DocumentoModel.create({
      COLEGIO_ID: data.colegioId,
      CURSO_ID: data.cursoId ?? null,
      AUTOR_ID: data.autorId,
      TIPO_DOCUMENTO: mapTipoPeriodo(data.tipoPeriodo),
      TITULO: data.titulo.substring(0, 150),
      DESCRIPCION: `Reporte ${data.tipoPeriodo} — ${data.periodo}`,
      URL_ARCHIVO: urlReporte,
    });

    logger.info("[ms-documentos] Reporte guardado", {
      documentoId: documento.DOCUMENTO_ID,
      url: urlReporte,
    });

    return { urlReporte, documentoId: documento.DOCUMENTO_ID! };
  },

  listarReportes: async (colegioId: number, cursoId?: number): Promise<Documento[]> => {
    const where: Record<string, unknown> = {
      COLEGIO_ID: colegioId,
      TIPO_DOCUMENTO: [
        "REPORTE_FINANCIERO_MENSUAL",
        "REPORTE_FINANCIERO_TRIMESTRAL",
        "REPORTE_FINANCIERO_ANUAL",
      ],
    };
    if (cursoId) where.CURSO_ID = cursoId;
    return DocumentoModel.findAll({ where, order: [["FECHA_DE_CREACION", "DESC"]] });
  },
};
