import PDFDocument from "pdfkit";

export interface DatoReporte {
  titulo: string;
  colegio: string;
  curso?: string;
  periodo: string;
  generadoPor: string;
  fechaGeneracion: Date;
  ingresos: { descripcion: string; monto: number; fecha: string }[];
  egresos: { descripcion: string; monto: number; fecha: string }[];
  cuotasPagadas: { alumno: string; concepto: string; monto: number; fecha: string }[];
  cuotasPendientes: { alumno: string; concepto: string; monto: number; vencimiento: string }[];
  saldoInicial: number;
  saldoFinal: number;
}

export interface DatoActa {
  titulo: string;
  colegio: string;
  fecha: Date;
  lugar: string;
  asistentes: string[];
  contenido: string;
  generadoPor: string;
}

const formatMonto = (monto: number): string =>
  `$${monto.toLocaleString("es-CL", { minimumFractionDigits: 0 })}`;

const formatFecha = (fecha: Date): string =>
  fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });

export const generarPDFReporte = (datos: DatoReporte): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Encabezado ───────────────────────────────────────────────────────────
    doc.fontSize(18).font("Helvetica-Bold").text(datos.titulo, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica").text(datos.colegio, { align: "center" });
    if (datos.curso) doc.text(`Curso: ${datos.curso}`, { align: "center" });
    doc.text(`Período: ${datos.periodo}`, { align: "center" });
    doc.text(`Generado por: ${datos.generadoPor}`, { align: "center" });
    doc.text(`Fecha de generación: ${formatFecha(datos.fechaGeneracion)}`, { align: "center" });
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ─── Resumen financiero ───────────────────────────────────────────────────
    doc.fontSize(14).font("Helvetica-Bold").text("Resumen Financiero");
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica");

    const totalIngresos = datos.ingresos.reduce((acc, i) => acc + i.monto, 0);
    const totalEgresos = datos.egresos.reduce((acc, e) => acc + e.monto, 0);
    const totalCuotasPagadas = datos.cuotasPagadas.reduce((acc, c) => acc + c.monto, 0);
    const totalCuotasPendientes = datos.cuotasPendientes.reduce((acc, c) => acc + c.monto, 0);

    doc.text(`Saldo Inicial: ${formatMonto(datos.saldoInicial)}`);
    doc.text(`Total Ingresos: ${formatMonto(totalIngresos)}`);
    doc.text(`Total Egresos: ${formatMonto(totalEgresos)}`);
    doc.text(`Cuotas Recaudadas: ${formatMonto(totalCuotasPagadas)}`);
    doc.text(`Cuotas Pendientes: ${formatMonto(totalCuotasPendientes)}`);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Saldo Final: ${formatMonto(datos.saldoFinal)}`);
    doc.moveDown();

    // ─── Ingresos ─────────────────────────────────────────────────────────────
    if (datos.ingresos.length > 0) {
      doc.fontSize(13).font("Helvetica-Bold").text("Ingresos");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      datos.ingresos.forEach((ing) => {
        doc.text(`• ${ing.fecha} — ${ing.descripcion}: ${formatMonto(ing.monto)}`);
      });
      doc.moveDown();
    }

    // ─── Egresos ──────────────────────────────────────────────────────────────
    if (datos.egresos.length > 0) {
      doc.fontSize(13).font("Helvetica-Bold").text("Egresos");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      datos.egresos.forEach((eg) => {
        doc.text(`• ${eg.fecha} — ${eg.descripcion}: ${formatMonto(eg.monto)}`);
      });
      doc.moveDown();
    }

    // ─── Cuotas pagadas ───────────────────────────────────────────────────────
    if (datos.cuotasPagadas.length > 0) {
      doc.fontSize(13).font("Helvetica-Bold").text("Cuotas Pagadas");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      datos.cuotasPagadas.forEach((c) => {
        doc.text(`• ${c.fecha} — ${c.alumno} | ${c.concepto}: ${formatMonto(c.monto)}`);
      });
      doc.moveDown();
    }

    // ─── Cuotas pendientes ────────────────────────────────────────────────────
    if (datos.cuotasPendientes.length > 0) {
      doc.fontSize(13).font("Helvetica-Bold").text("Cuotas Pendientes");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      datos.cuotasPendientes.forEach((c) => {
        doc.text(
          `• Vence: ${c.vencimiento} — ${c.alumno} | ${c.concepto}: ${formatMonto(c.monto)}`,
        );
      });
      doc.moveDown();
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("grey")
      .text("Documento generado automáticamente por el Sistema de Gestión Escolar.", {
        align: "center",
      });

    doc.end();
  });
};

export const generarPDFActa = (datos: DatoActa): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Encabezado ───────────────────────────────────────────────────────────
    doc.fontSize(18).font("Helvetica-Bold").text("ACTA DE REUNIÓN", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(13).font("Helvetica-Bold").text(datos.titulo, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Establecimiento: ${datos.colegio}`);
    doc.text(`Fecha: ${formatFecha(datos.fecha)}`);
    doc.text(`Lugar: ${datos.lugar}`);
    doc.text(`Secretario/a: ${datos.generadoPor}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ─── Asistentes ───────────────────────────────────────────────────────────
    doc.fontSize(13).font("Helvetica-Bold").text("Asistentes");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    datos.asistentes.forEach((a) => doc.text(`• ${a}`));
    doc.moveDown();

    // ─── Contenido ────────────────────────────────────────────────────────────
    doc.fontSize(13).font("Helvetica-Bold").text("Desarrollo de la Reunión");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica").text(datos.contenido, { align: "justify" });
    doc.moveDown(2);

    // ─── Firma ────────────────────────────────────────────────────────────────
    doc.text("_______________________________", { align: "right" });
    doc.text(`${datos.generadoPor}`, { align: "right" });
    doc.text("Secretario/a de Actas", { align: "right" });

    doc.end();
  });
};
