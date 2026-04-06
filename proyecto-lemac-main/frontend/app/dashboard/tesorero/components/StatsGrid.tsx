"use client"
import { Wallet, ArrowUpCircle, ArrowDownCircle, PieChart, Activity } from "lucide-react"

export default function StatsGrid({ cuenta, cobros = [] }: { cuenta: any, cobros: any[] }) {
  
  // Cálculo de Ingresos Reales: Suma solo lo que ya entró a caja
  const ingresosReales = cobros
    .filter(c => c.ESTADO === "PAGADO")
    .reduce((acc, curr) => acc + Number(curr.MONTO_PAGADO || 0), 0)

  // Cálculo de Cuentas por Cobrar: La diferencia entre lo original y lo ya pagado en ítems pendientes
  const porCobrar = cobros
    .filter(c => c.ESTADO === "PENDIENTE")
    .reduce((acc, curr) => {
      const original = Number(curr.MONTO_ORIGINAL || 0);
      const pagado = Number(curr.MONTO_PAGADO || 0);
      return acc + (original - pagado);
    }, 0)

  // Porcentaje de recaudación para el mini-badge
  const totalEsperado = ingresosReales + porCobrar;
  const porcentajeRecaudado = totalEsperado > 0 
    ? Math.round((ingresosReales / totalEsperado) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* CARD PRINCIPAL: SALDO DISPONIBLE */}
      <div className="md:col-span-2 bg-[#0F172A] p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200 flex flex-col justify-between relative overflow-hidden group">
        {/* Decoración de fondo interactiva */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FF8FAB] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-20 w-20 bg-white/5 rounded-4xl border border-white/10 flex items-center justify-center text-[#FF8FAB] shadow-inner">
            <Wallet size={36} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Saldo Disponible</p>
            <h3 className="text-5xl font-black text-white italic tracking-tighter">
              ${Number(cuenta?.SALDO_ACTUAL || 0).toLocaleString('es-CL')}
            </h3>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
          <p className="text-[9px] font-bold text-[#FF8FAB] uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> {cuenta?.BANCO || "BANCO NO VINCULADO"}
          </p>
          <span className="text-[8px] font-black text-slate-500 uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5">
            {cuenta?.NOMBRE_CUENTA || "CUENTA_PRINCIPAL"}
          </span>
        </div>
      </div>

      {/* CARD: RECAUDADO */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col justify-between group hover:border-green-100 transition-all">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-green-50 rounded-2xl text-green-500">
              <ArrowUpCircle size={24} />
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full">
               <p className="text-[9px] font-black text-green-600">+{porcentajeRecaudado}%</p>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Recaudado</p>
          <p className="text-3xl font-black text-[#0F172A] tracking-tighter">
            ${ingresosReales.toLocaleString('es-CL')}
          </p>
        </div>
        <p className="text-[8px] font-bold text-slate-300 uppercase mt-4">Sincronizado con Pagos</p>
      </div>

      {/* CARD: PENDIENTE */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col justify-between group hover:border-[#FF8FAB]/20 transition-all">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-[#FDF2F5] rounded-2xl text-[#FF8FAB]">
              <ArrowDownCircle size={24} />
            </div>
            <PieChart size={20} className="text-slate-100" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Por Cobrar</p>
          <p className="text-3xl font-black text-[#0F172A] tracking-tighter">
            ${porCobrar.toLocaleString('es-CL')}
          </p>
        </div>
        <p className="text-[8px] font-bold text-slate-300 uppercase mt-4">Cuentas por Regularizar</p>
      </div>

    </div>
  )
}