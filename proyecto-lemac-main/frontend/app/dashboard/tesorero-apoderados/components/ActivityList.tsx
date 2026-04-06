"use client"
import { ArrowUpCircle, ArrowDownCircle, FileText, Calendar, History, ExternalLink } from "lucide-react"

interface Movimiento {
  MOVIMIENTO_ID: number;
  TIPO_MOVIMIENTO: "INGRESO" | "EGRESO";
  GLOSA: string;
  MONTO: number;
  FECHA_MOVIMIENTO: string;
  COMPROBANTE_URL?: string;
}

export default function ActivityList({ movimientos = [] }: { movimientos: Movimiento[] }) {
  
  // Formateador de moneda CLP (sin datos falsos, usando estándar internacional)
  const formatCLP = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(monto);
  };

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm h-full flex flex-col group transition-all hover:shadow-xl hover:shadow-slate-100">
      
      {/* HEADER DE ACTIVIDAD */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FDF2F5] rounded-xl text-[#FF8FAB]">
            <History size={18} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0F172A]">
            Historial de Caja
          </h3>
        </div>
        <span className="bg-slate-50 text-[9px] font-black px-4 py-2 rounded-full text-slate-400 uppercase tracking-widest border border-slate-100">
          {movimientos.length} Movimientos
        </span>
      </div>

      {/* LISTADO DE MOVIMIENTOS */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-125">
        {movimientos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-12 h-12 bg-slate-100 rounded-full mb-4 flex items-center justify-center">
              <Calendar size={20} className="text-slate-400" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
              Sincronizando con Oracle...
            </p>
          </div>
        ) : (
          movimientos.map((mov) => (
            <div 
              key={mov.MOVIMIENTO_ID}
              className="flex items-center justify-between p-5 rounded-4xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                {/* ICONO DE DIRECCIÓN */}
                <div className={`p-4 rounded-2xl shadow-sm ${
                  mov.TIPO_MOVIMIENTO === 'INGRESO' 
                  ? 'bg-green-50 text-green-500' 
                  : 'bg-[#FDF2F5] text-[#FF8FAB]'
                }`}>
                  {mov.TIPO_MOVIMIENTO === 'INGRESO' 
                    ? <ArrowUpCircle size={22} strokeWidth={2.5} /> 
                    : <ArrowDownCircle size={22} strokeWidth={2.5} />
                  }
                </div>
                
                <div className="flex flex-col">
                  <p className="text-[12px] font-black text-[#0F172A] uppercase leading-tight mb-1.5 tracking-tight">
                    {mov.GLOSA || "Sin glosa especificada"}
                  </p>
                  <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                       <Calendar size={12} className="text-[#FF8FAB]" /> 
                       {new Date(mov.FECHA_MOVIMIENTO).toLocaleDateString('es-CL', {
                         day: '2-digit',
                         month: 'short',
                         year: 'numeric'
                       })}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span className="text-[8px]">ID: #{mov.MOVIMIENTO_ID}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-sm font-black italic ${
                  mov.TIPO_MOVIMIENTO === 'INGRESO' ? 'text-green-500' : 'text-[#0F172A]'
                }`}>
                  {mov.TIPO_MOVIMIENTO === 'INGRESO' ? '+' : '-'} {formatCLP(mov.MONTO)}
                </p>
                
                {mov.COMPROBANTE_URL && (
                  <a 
                    href={mov.COMPROBANTE_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[8px] font-black text-[#FF8FAB] uppercase mt-2 hover:text-[#0F172A] transition-colors bg-[#FDF2F5] px-3 py-1 rounded-full border border-[#FF8FAB]/10"
                  >
                    <FileText size={10} /> Recibo <ExternalLink size={8} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACCIÓN DE HISTORIAL COMPLETO */}
      <button className="w-full mt-8 py-5 border-2 border-dashed border-slate-100 rounded-4xl text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:border-[#FF8FAB]/30 hover:text-[#FF8FAB] hover:bg-[#FDF2F5]/30 transition-all active:scale-95 flex items-center justify-center gap-3">
        Auditoría Completa <FileText size={14} />
      </button>
    </div>
  )
}