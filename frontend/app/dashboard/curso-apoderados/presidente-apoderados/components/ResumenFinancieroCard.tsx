"use client"
import { Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap } from "lucide-react"

// Tipado para ayudar a TypeScript
interface StatsFinancieros {
  SALDO_ACTUAL?: number;
  saldo_actual?: number;
  BANCO?: string;
  banco?: string;
  PORCENTAJE_RECAUDACION?: number;
  porcentaje_recaudacion?: number;
  EGRESOS_TOTALES?: number;
  egresos_totales?: number;
  CANTIDAD_TRANSACCIONES?: number;
  cantidad_transacciones?: number;
}

export default function ResumenFinancieroCard({ stats }: { stats: StatsFinancieros }) {
  // Datos reales mapeados de forma segura (tolerante a mayúsculas/minúsculas de Oracle)
  const saldo = Number(stats?.SALDO_ACTUAL || stats?.saldo_actual || 0);
  const banco = stats?.BANCO || stats?.banco || "Cuenta del Curso";
  const porcentajePagado = Number(stats?.PORCENTAJE_RECAUDACION || stats?.porcentaje_recaudacion || 0);
  const egresosMes = Number(stats?.EGRESOS_TOTALES || stats?.egresos_totales || 0);
  const transacciones = Number(stats?.CANTIDAD_TRANSACCIONES || stats?.cantidad_transacciones || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700 w-full">
      
      {/* CARD 1: BALANCE REAL (Azul Marino Profundo) - Identidad de Marca */}
      <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8FAB]/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#FF8FAB]/20"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
            <Wallet size={24} className="text-[#FF8FAB]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest bg-[#FF8FAB] text-[#0F172A] px-4 py-2 rounded-full shadow-lg">
            Balance Actual
          </span>
        </div>
        <h3 className="text-4xl font-black tracking-tighter mb-2 relative z-10">
          ${saldo.toLocaleString("es-CL")}
        </h3>
        <div className="flex items-center gap-2 relative z-10 mt-4">
          <ShieldCheck size={14} className="text-[#FF8FAB]" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {banco}
          </p>
        </div>
      </div>

      {/* CARD 2: RECAUDACIÓN (Rosa Pastel Aesthetic) - Progreso Real */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-[#FF8FAB]/30 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-500">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#FDF2F5] p-4 rounded-2xl text-[#FF8FAB] group-hover:scale-110 transition-transform shadow-sm">
              <ArrowUpRight size={20}/>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recaudación Cuotas</span>
          </div>
          <h4 className="text-3xl font-black text-[#0F172A] tracking-tight">{porcentajePagado}% <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Pagado</span></h4>
        </div>
        <div className="mt-8">
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-50">
            <div 
              className="bg-[#FF8FAB] h-full rounded-full shadow-[0_0_15px_rgba(255,143,171,0.4)] transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            ></div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase mt-3 tracking-widest text-right">Progreso Anual</p>
        </div>
      </div>

      {/* CARD 3: EGRESOS (Minimalista) - Control de Gastos */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-[#0F172A] group-hover:text-[#FF8FAB] transition-all shadow-sm">
            <ArrowDownRight size={20}/>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Salidas del Fondo</span>
        </div>
        <div className="mt-auto">
          <h4 className="text-3xl font-black text-[#0F172A] tracking-tight">
            ${egresosMes.toLocaleString("es-CL")}
          </h4>
          <div className="flex items-center gap-2 mt-4 text-slate-400 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
            <Zap size={12} className="text-[#FF8FAB] fill-current" />
            <p className="text-[9px] font-black uppercase tracking-widest">
              {transacciones} Egresos Registrados
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}