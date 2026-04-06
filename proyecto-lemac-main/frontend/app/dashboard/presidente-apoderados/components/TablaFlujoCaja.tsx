"use client"
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"

export default function TablaFlujoCaja({ movimientos = [] }: { movimientos: any[] }) {
  // Estado vacío: Si el microservicio no retorna datos
  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="bg-white rounded-[3rem] border border-slate-100 p-12 flex flex-col items-center justify-center h-full shadow-sm">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Clock size={24} className="text-slate-300" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Sin movimientos recientes en el historial
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm h-full animate-in fade-in slide-in-from-right-4 duration-1000">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <span className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em]">
          Flujo de Caja Reciente
        </span>
        <span className="text-[9px] font-black uppercase px-4 py-2 bg-white rounded-full border border-slate-100 text-slate-400">
          Últimos 6 registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-50">
            {movimientos.slice(0, 6).map((mov: any) => (
              <tr 
                key={mov.MOVIMIENTO_ID} 
                className="hover:bg-slate-50/80 transition-all duration-300 group"
              >
                <td className="p-7">
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#FF8FAB] transition-colors">
                      {mov.DESCRIPCION}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                      {new Date(mov.FECHA_MOVIMIENTO).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </td>

                <td className="p-7">
                  <div className="flex items-center gap-2">
                    {mov.TIPO_MOVIMIENTO === 'INGRESO' ? (
                      <div className="bg-[#FDF2F5] p-1.5 rounded-lg text-[#FF8FAB]">
                        <ArrowUpRight size={14} />
                      </div>
                    ) : (
                      <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400">
                        <ArrowDownRight size={14} />
                      </div>
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      mov.TIPO_MOVIMIENTO === 'INGRESO' ? 'text-[#FF8FAB]' : 'text-slate-400'
                    }`}>
                      {mov.TIPO_MOVIMIENTO}
                    </span>
                  </div>
                </td>

                <td className={`p-7 text-right font-black text-xs tracking-tighter ${
                  mov.TIPO_MOVIMIENTO === 'INGRESO' ? 'text-[#0F172A]' : 'text-slate-500'
                }`}>
                  <span className="opacity-40 mr-1">
                    {mov.TIPO_MOVIMIENTO === 'EGRESO' ? '−' : '+'}
                  </span>
                  ${Number(mov.MONTO).toLocaleString("es-CL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}