"use client"
import { Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap } from "lucide-react"

export default function ResumenFinancieroCard({ stats }: any) {
  // Datos reales mapeados desde tus microservicios (Puertos 3002/3005)
  const saldo = stats?.SALDO_ACTUAL || 0;
  const banco = stats?.BANCO || "Sin cuenta vinculada";
  const porcentajePagado = stats?.PORCENTAJE_RECAUDACION || 0;
  const egresosMes = stats?.EGRESOS_TOTALES || 0;
  const transacciones = stats?.CANTIDAD_TRANSACCIONES || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* CARD 1: BALANCE REAL (Azul Marino Profundo) - Identidad de Marca */}
      <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8FAB]/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#FF8FAB]/20"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/5">
            <Wallet size={24} className="text-[#FF8FAB]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest bg-[#FF8FAB] text-[#0F172A] px-4 py-2 rounded-full shadow-lg">
            Balance Real
          </span>
        </div>
        <h3 className="text-4xl font-black tracking-tighter mb-2 relative z-10">
          ${saldo.toLocaleString("es-CL")}
        </h3>
        <div className="flex items-center gap-2 relative z-10">
          <ShieldCheck size={12} className="text-[#FF8FAB]" />
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            {banco}
          </p>
        </div>
      </div>

      {/* CARD 2: RECAUDACIÓN (Rosa Pastel Aesthetic) - Progreso Real */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-[#FF8FAB]/30 transition-all duration-500">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#FDF2F5] p-3 rounded-2xl text-[#FF8FAB] group-hover:scale-110 transition-transform">
              <ArrowUpRight size={20}/>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recaudación Cuotas</span>
          </div>
          <h4 className="text-2xl font-black text-[#0F172A] tracking-tight">{porcentajePagado}% Pagado</h4>
        </div>
        <div className="mt-6">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-[#FF8FAB] h-full rounded-full shadow-[0_0_15px_rgba(255,143,171,0.4)] transition-all duration-1000 ease-out" 
              style={{ width: `${porcentajePagado}%` }}
            ></div>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase mt-3 tracking-widest text-right">Meta Institucional</p>
        </div>
      </div>

      {/* CARD 3: EGRESOS (Minimalista) - Control de Gastos */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-all duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white transition-all">
            <ArrowDownRight size={20}/>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Egresos del Mes</span>
        </div>
        <div>
          <h4 className="text-2xl font-black text-[#0F172A] tracking-tight">
            ${egresosMes.toLocaleString("es-CL")}
          </h4>
          <div className="flex items-center gap-2 mt-2 text-[#FF8FAB]">
            <Zap size={12} fill="currentColor" />
            <p className="text-[10px] font-black uppercase tracking-wider">
              {transacciones} Movimientos registrados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}