"use client"
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"

// Tipado para guiar a TypeScript
interface MovimientoCaja {
  MOVIMIENTO_ID?: number;
  movimiento_id?: number;
  DESCRIPCION?: string;
  descripcion?: string;
  FECHA_MOVIMIENTO?: string;
  fecha_movimiento?: string;
  TIPO_MOVIMIENTO?: string;
  tipo_movimiento?: string;
  MONTO?: number;
  monto?: number;
  GLOSA?: string;
  glosa?: string;
}

export default function TablaFlujoCaja({ movimientos = [] }: { movimientos: MovimientoCaja[] }) {
  // Estado vacío: Si el microservicio no retorna datos (o si la prop viene vacía)
  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="bg-white rounded-[3.5rem] border border-slate-100 p-12 flex flex-col items-center justify-center h-full shadow-sm animate-in fade-in min-h-87.5">
        <div className="bg-slate-50 p-5 rounded-full mb-4 shadow-inner">
          <Clock size={32} className="text-slate-300" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center max-w-50">
          Sin movimientos recientes en el historial de Oracle
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-1000">
      
      {/* HEADER DE LA TABLA */}
      <div className="p-8 lg:p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/30">
        <span className="text-xs font-black uppercase text-[#0F172A] tracking-[0.2em] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FF8FAB] animate-pulse" />
          Flujo de Caja Reciente
        </span>
        <span className="text-[9px] font-black uppercase px-4 py-2 bg-white rounded-xl border border-slate-100 text-slate-400 shadow-sm w-fit">
          Últimos {Math.min(movimientos.length, 6)} registros
        </span>
      </div>

      {/* CONTENIDO DE LA TABLA */}
      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-left min-w-125">
          <tbody className="divide-y divide-slate-50">
            {movimientos.slice(0, 6).map((mov, idx) => {
              // Mapeo tolerante a Case Sensitivity de Oracle
              const id = mov.MOVIMIENTO_ID || mov.movimiento_id || idx;
              // A veces la descripción en Oracle está en la columna GLOSA
              const descripcion = mov.DESCRIPCION || mov.descripcion || mov.GLOSA || mov.glosa || "Movimiento Registrado";
              const fechaStr = mov.FECHA_MOVIMIENTO || mov.fecha_movimiento;
              const tipo = (mov.TIPO_MOVIMIENTO || mov.tipo_movimiento || "").toUpperCase();
              const monto = Number(mov.MONTO || mov.monto || 0);

              const esIngreso = tipo === 'INGRESO';

              return (
                <tr 
                  key={id} 
                  className="hover:bg-slate-50/50 transition-all duration-300 group"
                >
                  <td className="p-6 lg:p-8 w-1/2">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#FF8FAB] transition-colors line-clamp-1">
                        {descripcion}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        {fechaStr ? new Date(fechaStr).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Fecha no registrada'}
                      </p>
                    </div>
                  </td>

                  <td className="p-6 lg:p-8">
                    <div className="flex items-center gap-3">
                      {esIngreso ? (
                        <div className="bg-[#FDF2F5] p-2 rounded-xl text-[#FF8FAB] shadow-sm">
                          <ArrowUpRight size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="bg-slate-100 p-2 rounded-xl text-slate-400 shadow-sm">
                          <ArrowDownRight size={14} strokeWidth={3} />
                        </div>
                      )}
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        esIngreso ? 'text-[#FF8FAB]' : 'text-slate-400'
                      }`}>
                        {tipo || 'EGRESO'}
                      </span>
                    </div>
                  </td>

                  <td className={`p-6 lg:p-8 text-right font-black text-sm lg:text-base tracking-tighter ${
                    esIngreso ? 'text-[#0F172A]' : 'text-slate-400'
                  }`}>
                    <span className="opacity-40 mr-1 text-xs">
                      {!esIngreso ? '−' : '+'}
                    </span>
                    ${monto.toLocaleString("es-CL")}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}