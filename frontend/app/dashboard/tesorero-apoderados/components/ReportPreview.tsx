"use client"
import { useState } from "react"
import { FileText, Download, Printer, Mail, CheckCircle, Loader2, ShieldCheck } from "lucide-react"
import Cookies from "js-cookie"

interface ReportPreviewProps {
  data: {
    cuenta: any;
    movimientos: any[];
    cobros: any[];
  };
  period: string;
}

export default function ReportPreview({ data, period }: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const token = Cookies.get("auth-token");

  // URL del microservicio de documentos del Proyecto Lemac
  const API_DOCUMENTOS = process.env.NEXT_PUBLIC_API_DOCS || "http://127.0.0.1:3005/api/v1/documentos";

  const totalIngresos = data.movimientos
    .filter(m => m.TIPO_MOVIMIENTO === 'INGRESO')
    .reduce((a, b) => a + Number(b.MONTO), 0);

  const totalEgresos = data.movimientos
    .filter(m => m.TIPO_MOVIMIENTO === 'EGRESO')
    .reduce((a, b) => a + Number(b.MONTO), 0);

  const handleDownloadPDF = async () => {
    if (!data.cuenta) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch(`${API_DOCUMENTOS}/generar-balance-pdf`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          curso_id: data.cuenta?.CURSO_ID,
          periodo: period,
          movimientos: data.movimientos,
          resumen: {
            saldo_final: data.cuenta?.SALDO_ACTUAL,
            total_ingresos: totalIngresos,
            total_egresos: totalEgresos
          },
          metadatos: {
            generado_por: "Sistema Lemac Core",
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LEMAC_Balance_${period.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error crítico en ms-documentos:", error);
      alert("Error al conectar con el servicio de generación de documentos.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCLP = (monto: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* TOOLBAR DE ACCIONES */}
      <div className="bg-white p-5 rounded-4xl border border-slate-100 shadow-sm flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="bg-[#FDF2F5] p-3 rounded-2xl text-[#FF8FAB]">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Preview Mode</span>
            <span className="text-xs font-black text-[#0F172A] uppercase">Documento de Auditoría</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="p-4 text-slate-300 hover:text-[#FF8FAB] transition-colors bg-slate-50 rounded-2xl">
            <Printer size={20} />
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating || !data.cuenta}
            className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#1e293b] transition-all shadow-lg shadow-slate-200 disabled:opacity-30 active:scale-95"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} className="text-[#FF8FAB]" />}
            {isGenerating ? "Procesando en OCI..." : "Exportar PDF Oficial"}
          </button>
        </div>
      </div>

      {/* HOJA DE REPORTE (A4 VIRTUAL) */}
      <div className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] rounded-[3rem] border border-slate-50 p-20 min-h-250 relative overflow-hidden">
        
        {/* Marca de Agua Lemac */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none -rotate-12 text-[15rem] font-black select-none">
          LEMAC
        </div>

        {/* Encabezado Institucional */}
        <div className="flex justify-between items-start border-b-8 border-[#FDF2F5] pb-12 mb-16 relative z-10">
          <div>
            <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter italic">LEMAC<span className="text-[#FF8FAB]">.</span></h1>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mt-2">Informatics Thesis Project 2026</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase text-[#0F172A] tracking-tighter italic">Balance Consolidado</h2>
            <div className="bg-[#0F172A] text-white px-4 py-1 inline-block rounded-full mt-2">
               <p className="text-[9px] font-black uppercase tracking-widest">{period}</p>
            </div>
          </div>
        </div>

        {/* Información de la Cuenta en Oracle */}
        <div className="grid grid-cols-2 gap-16 mb-16 relative z-10">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-widest border-l-4 border-[#FF8FAB] pl-4">Entidad Responsable</h4>
            <div>
              <p className="text-md font-black text-[#0F172A] uppercase leading-none">{data.cuenta?.NOMBRE_CUENTA || 'Cargando Entidad...'}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ID DE CUENTA: {data.cuenta?.CUENTA_ID || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right space-y-4">
            <h4 className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-widest border-r-4 border-[#FF8FAB] pr-4">Certificación de Emisión</h4>
            <div>
              <p className="text-md font-black text-[#0F172A]">{new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Sincronizado con OCI Oracle Database</p>
            </div>
          </div>
        </div>

        {/* Tabla de Movimientos Filtrados */}
        <div className="mb-16 relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="text-left py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción Operativa</th>
                <th className="text-right py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Transacción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.movimientos.length > 0 ? (
                data.movimientos.map((mov, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-6 text-[11px] font-bold text-slate-500">
                      {new Date(mov.FECHA_MOVIMIENTO).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-6 text-[11px] font-black text-[#0F172A] uppercase tracking-tight">
                      {mov.GLOSA}
                    </td>
                    <td className={`py-6 text-right text-sm font-black italic ${mov.TIPO_MOVIMIENTO === 'INGRESO' ? 'text-green-500' : 'text-[#0F172A]'}`}>
                      {mov.TIPO_MOVIMIENTO === 'INGRESO' ? '+' : '-'} {formatCLP(mov.MONTO)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sin movimientos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bloque de Cierre Contable */}
        <div className="flex justify-end relative z-10">
          <div className="bg-slate-50 p-10 rounded-[2.5rem] w-full max-w-sm space-y-4 border border-slate-100 shadow-inner">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <span>Flujo de Ingresos:</span>
              <span className="text-green-500">{formatCLP(totalIngresos)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <span>Flujo de Egresos:</span>
              <span className="text-[#0F172A] opacity-60">{formatCLP(totalEgresos)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-6 mt-2">
              <span className="text-xs font-black text-[#0F172A] uppercase tracking-widest">Saldo Final Neto:</span>
              <span className="text-lg font-black text-[#0F172A]">{formatCLP(data.cuenta?.SALDO_ACTUAL || 0)}</span>
            </div>
          </div>
        </div>

        {/* Footer de Seguridad Documental */}
        <div className="mt-24 border-t border-slate-100 pt-10 flex flex-col items-center relative z-10">
          <div className="bg-[#FDF2F5] p-4 rounded-full mb-4">
            <ShieldCheck size={32} className="text-[#FF8FAB]" />
          </div>
          <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] mb-1 italic">Documento Generado vía Microservicio</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">© 2026 LEMAC - Módulo de Tesorería Académica</p>
        </div>

      </div>
    </div>
  );
}