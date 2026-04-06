"use client"
import { Printer, FileText, Download, Share2, ChevronLeft, ShieldCheck, Landmark } from "lucide-react"

interface ReportPreviewProps {
  data: {
    cuenta: any;
    cobros: any[];
    movimientos?: any[]; // Datos del ms-tesoreria
  };
  period: string;
}

export default function ReportPreview({ data, period }: ReportPreviewProps) {
  
  // Cálculo de Ingresos Reales basados en estados de la DB Oracle
  const totalRecaudado = data.cobros
    ?.filter((c: any) => c.ESTADO === "PAGADO")
    .reduce((acc: number, curr: any) => acc + Number(curr.MONTO_PAGADO || 0), 0) || 0

  // Cálculo de Egresos si existen en los movimientos
  const totalEgresos = data.movimientos
    ?.filter((m: any) => m.TIPO_MOVIMIENTO === "EGRESO")
    .reduce((acc: number, curr: any) => acc + Number(curr.MONTO || 0), 0) || 0

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 print:p-0">
      
      {/* TOOLBAR SUPERIOR - Oculto al imprimir */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100/50 print:hidden gap-4">
        <button className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase hover:text-[#FF8FAB] transition-all px-6 py-2 bg-slate-50 rounded-2xl">
          <ChevronLeft size={16} /> Panel de Control
        </button>
        
        <div className="flex items-center gap-3">
          <button className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all active:scale-90" title="Compartir">
            <Share2 size={20} />
          </button>
          <button 
            onClick={handlePrint}
            className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all active:scale-90" 
            title="Imprimir"
          >
            <Printer size={20} />
          </button>
          <button className="bg-[#0F172A] text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#FF8FAB] transition-all shadow-lg active:scale-95">
            <Download size={18} /> Generar PDF
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL REPORTE (Simulación de Hoja A4) */}
      <div className="bg-slate-100/50 rounded-[4rem] p-4 md:p-16 flex justify-center border border-slate-100 print:bg-white print:p-0 print:border-none">
        <div className="bg-white w-full max-w-212.5 min-h-275 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] rounded-xl p-12 md:p-24 relative overflow-hidden print:shadow-none print:rounded-none">
          
          {/* DECORACIÓN CORPORATIVA LEMAC */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <FileText size={350} />
          </div>
          <div className="absolute top-0 left-0 w-full h-2 bg-[#0F172A]" />

          {/* ENCABEZADO DEL REPORTE */}
          <header className="border-b-2 border-slate-100 pb-12 mb-16 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-[#FF8FAB] font-black text-xl italic">L</div>
                <h1 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic">LEMAC <span className="text-[#FF8FAB]">DOCS</span></h1>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">
                Servicio de Auditoría Tesorería
              </p>
            </div>
            
            <div className="text-right space-y-1">
              <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-tighter">Reporte ID: {data.cuenta?.CUENTA_ID || '000'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{period}</p>
              <div className="inline-block bg-[#FDF2F5] px-3 py-1 rounded-full">
                <p className="text-[8px] font-black text-[#FF8FAB] uppercase">{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </header>

          {/* CUERPO DEL REPORTE */}
          <main className="space-y-16">
            
            {/* RESUMEN FINANCIERO */}
            <section>
              <h2 className="text-[11px] font-black text-[#0F172A] uppercase mb-8 flex items-center gap-3 tracking-[0.2em]">
                <div className="w-1.5 h-4 bg-[#FF8FAB] rounded-full" /> Resumen de Estado de Cuenta
              </h2>
              <div className="grid grid-cols-2 gap-10">
                <div className="border-l border-slate-100 pl-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Recaudado (Ingresos)</p>
                  <p className="text-3xl font-black text-green-600 tracking-tighter">${totalRecaudado.toLocaleString('es-CL')}</p>
                </div>
                <div className="border-l border-slate-100 pl-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Balance Actual</p>
                  <p className="text-3xl font-black text-[#0F172A] tracking-tighter">${Number(data.cuenta?.SALDO_ACTUAL || 0).toLocaleString('es-CL')}</p>
                </div>
              </div>
            </section>

            {/* TABLA DE MOVIMIENTOS REALES */}
            <section>
              <h2 className="text-[11px] font-black text-[#0F172A] uppercase mb-8 flex items-center gap-3 tracking-[0.2em]">
                <div className="w-1.5 h-4 bg-[#FF8FAB] rounded-full" /> Detalle de Transacciones Recientes
              </h2>
              <div className="overflow-hidden rounded-2xl border border-slate-50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Glosa / Concepto</th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                      <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cobros?.length > 0 ? (
                      data.cobros.slice(0, 10).map((c: any) => (
                        <tr key={c.COBRO_ID} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                          <td className="p-5">
                            <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-tight">{c.DESCRIPCION || 'Cobro de Cuota Base'}</p>
                            <p className="text-[8px] font-bold text-slate-300 uppercase">Ref: #{c.COBRO_ID}</p>
                          </td>
                          <td className="p-5 text-[10px] font-bold text-slate-400">
                            {new Date(c.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}
                          </td>
                          <td className="p-5 text-[11px] font-black text-[#0F172A] text-right">
                            ${Number(c.MONTO_ORIGINAL).toLocaleString('es-CL')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-10 text-center text-[10px] font-bold text-slate-300 uppercase italic">No se registran movimientos para este periodo</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECCIÓN DE VALIDACIÓN */}
            <section className="bg-slate-50 rounded-[2.5rem] p-10 flex items-center justify-between border border-slate-100/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm border border-slate-100">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-tighter">Documento Verificado</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Este reporte ha sido generado desde Oracle Cloud OCI</p>
                </div>
              </div>
              <div className="text-right">
                <Landmark size={24} className="text-slate-200 ml-auto mb-2" />
                <p className="text-[8px] font-black text-slate-300 uppercase italic">Certificación Lemac v3.0</p>
              </div>
            </section>

            {/* FIRMAS DIGITALES */}
            <section className="pt-12 grid grid-cols-2 gap-24">
              <div className="border-t-2 border-slate-100 pt-6 text-center">
                <div className="h-12 flex items-center justify-center">
                   <p className="text-[12px] font-black text-[#0F172A] italic opacity-20">Firma Digital</p>
                </div>
                <p className="text-[9px] font-black text-[#0F172A] uppercase tracking-widest">{data.cuenta?.TITULAR || 'Tesorero General'}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Responsable de Finanzas</p>
              </div>
              <div className="border-t-2 border-slate-100 pt-6 text-center">
                 <div className="h-12 flex items-center justify-center">
                    <p className="text-[12px] font-black text-[#0F172A] opacity-20 italic">Certificado</p>
                </div>
                <p className="text-[9px] font-black text-[#0F172A] uppercase tracking-widest">Sello Institucional</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">EDUCA+ Blockchain Verified</p>
              </div>
            </section>
          </main>

          {/* PIE DE PÁGINA (A4) */}
          <footer className="mt-20 flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] border-t border-slate-50 pt-8">
            <span>Generado por: {data.cuenta?.NOMBRE_CUENTA || 'Sistema Lemac'}</span>
            <span>Ref: {data.cuenta?.RUT_TITULAR || '20.XXX.XXX-X'}</span>
            <span className="text-[#FF8FAB]">Página 1 / 1</span>
          </footer>
        </div>
      </div>
    </section>
  )
}