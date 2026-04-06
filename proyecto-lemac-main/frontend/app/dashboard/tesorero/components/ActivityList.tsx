"use client"
import { History, Plus, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

interface ActivityListProps {
  cobros: any[];
  onOpenModal: () => void; 
}

export default function ActivityList({ cobros, onOpenModal }: ActivityListProps) {
  return (
    <section className="bg-white p-8 rounded-[3.5rem] border border-slate-50 shadow-sm h-full flex flex-col">
      {/* Encabezado de la Sección */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-tighter flex items-center gap-3">
          <div className="bg-[#FDF2F5] p-2.5 rounded-xl text-[#FF8FAB]">
            <History size={18} />
          </div>
          Historial de Movimientos
        </h2>
      </div>

      {/* Lista de Movimientos Reales */}
      <div className="space-y-3 grow overflow-y-auto pr-2 custom-scrollbar">
        {cobros.length > 0 ? (
          cobros.slice(0, 6).map((cobro) => (
            <div 
              key={cobro.COBRO_ID} 
              className="flex justify-between items-center p-5 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Icono de estado dinámico */}
                <div className={`p-2 rounded-lg ${cobro.ESTADO === 'PAGADO' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                  {cobro.ESTADO === 'PAGADO' ? <ArrowUpRight size={14} /> : <Clock size={14} />}
                </div>
                
                <div>
                  <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#FF8FAB] transition-colors">
                    {cobro.DESCRIPCION || 'Cobro de Cuota'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    Ref: #{cobro.COBRO_ID} • Vence: {new Date(cobro.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[11px] font-black ${cobro.ESTADO === 'PAGADO' ? 'text-green-600' : 'text-amber-600'}`}>
                  ${Number(cobro.MONTO_ORIGINAL).toLocaleString('es-CL')}
                </span>
                <p className="text-[8px] font-black text-slate-300 uppercase leading-none">CLP</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 opacity-40">
            <History size={40} className="text-slate-200 mb-4" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Sin registros en Oracle DB
            </p>
          </div>
        )}
      </div>

      {/* ACCIONES DE TESORERÍA */}
      <div className="grid grid-cols-1 gap-3 mt-8">
        <button 
          onClick={onOpenModal}
          className="group w-full py-4 bg-white border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#FF8FAB] hover:text-[#FF8FAB] hover:bg-[#FDF2F5] transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <div className="bg-slate-50 group-hover:bg-[#FF8FAB] group-hover:text-white p-1 rounded transition-colors">
            <Plus size={12} />
          </div>
          Registro Manual
        </button>

        <button className="w-full py-4 bg-[#0F172A] rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-[#1e293b] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 active:scale-95">
          <Plus size={14} className="text-[#FF8FAB]" /> Generar Cobro Masivo
        </button>
      </div>
    </section>
  )
}