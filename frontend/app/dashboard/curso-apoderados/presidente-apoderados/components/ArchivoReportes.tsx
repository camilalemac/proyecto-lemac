"use client"
import { FileText, ExternalLink, ShieldCheck, Download, AlertCircle, Loader2 } from "lucide-react"

interface Reporte {
  DOCUMENTO_ID: number;
  TITULO: string;
  DESCRIPCION?: string;
  URL_ARCHIVO: string;
}

export default function ArchivoReportes({ 
  reportes = [], 
  isLoading = false, 
  error = null 
}: { 
  reportes: Reporte[], 
  isLoading?: boolean, 
  error?: string | null 
}) {

  // Estado de carga interno
  if (isLoading) {
    return (
      <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-75">
        <Loader2 size={40} className="animate-spin text-[#FF8FAB] mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Consultando Microservicio 3005...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-700">
      
      {/* HEADER DEL COMPONENTE */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#0F172A] p-3 rounded-2xl text-white shadow-lg shadow-slate-900/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF8FAB]">Gestión de Presidencia</span>
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Reportes Financieros Firmados</h3>
          </div>
        </div>
        {!error && (
          <span className="px-4 py-2 bg-[#FDF2F5] rounded-full text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest border border-pink-100">
            {reportes.length} Archivos Disponibles
          </span>
        )}
      </div>

      {/* MANEJO DE ERRORES DE MICROSERVICIO (Reflejando el error 3005 de tu consola) */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-[2.5rem] border-2 border-dashed border-red-100">
          <AlertCircle className="text-red-400 mb-2" size={40} />
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center px-6">
            Error: El microservicio de documentos (Puerto 3005) no responde
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-[9px] font-black text-white bg-red-400 px-4 py-2 rounded-xl uppercase tracking-tighter hover:bg-red-500 transition-colors"
          >
            Reintentar Conexión
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reportes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <FileText className="text-slate-200 mb-2" size={40} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay reportes en la base de datos</p>
            </div>
          ) : (
            reportes.map((rep) => (
              <div 
                key={rep.DOCUMENTO_ID} 
                className="group flex justify-between items-center p-6 bg-white border border-slate-50 rounded-[2.5rem] hover:border-[#FF8FAB]/30 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:text-white group-hover:bg-[#0F172A] transition-all duration-300 shadow-sm">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#FF8FAB] transition-colors">
                      {rep.TITULO}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                      {rep.DESCRIPCION || "Verificado por auditoría interna"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={rep.URL_ARCHIVO} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-[#0F172A] hover:text-white rounded-2xl transition-all"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button 
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-[#FF8FAB] hover:text-white rounded-2xl transition-all shadow-sm"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FOOTER - Identidad Visual */}
      <div className="mt-8 p-6 bg-[#0F172A] rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8FAB]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed text-center relative z-10">
          Certificación Digital <span className="text-[#FF8FAB]">EDUCA+</span> 2026
        </p>
      </div>
    </div>
  )
}