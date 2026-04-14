"use client"
import { PieChart, TrendingDown, ArrowLeft, Filter, Calendar } from "lucide-react"
import Link from "next/link"

export default function GastosDashboardPage() {
  return (
    <div className="p-8 space-y-8 bg-[#FDF2F5] min-h-screen">
      <Link href="/dashboard/directora" className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-colors font-black text-[10px] uppercase tracking-widest">
        <ArrowLeft size={16} /> Volver al Inicio
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Torta (Representación Visual) */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-64 h-64 rounded-full border-20 border-slate-50 border-t-[#FF8FAB] border-r-sky-400 border-b-emerald-400 flex items-center justify-center relative">
            <div className="text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Gastado</p>
              <h4 className="text-3xl font-black text-[#0F172A]">$1.1M</h4>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12 w-full">
            <LegendItem color="bg-[#FF8FAB]" label="Infraestructura" percent="45%" />
            <LegendItem color="bg-sky-400" label="Eventos Ceal" percent="30%" />
            <LegendItem color="bg-emerald-400" label="Ayuda Social" percent="25%" />
          </div>
        </div>

        {/* Filtros de Auditoría */}
        <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white space-y-8">
          <h3 className="text-xl font-black uppercase tracking-tighter">Filtros de Auditoría</h3>
          <div className="space-y-4">
             <FilterItem icon={<Calendar size={16}/>} label="Año 2026" />
             <FilterItem icon={<Filter size={16}/>} label="Todos los Centros" />
          </div>
          <div className="pt-8 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF8FAB] mb-4">Métrica de Control</p>
            <p className="text-sm font-medium leading-relaxed opacity-70">
              "La directora tiene visibilidad total de los egresos, pero solo el Tesorero puede ejecutar movimientos en Oracle."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label, percent }: any) {
  return (
    <div className="text-center">
      <div className={`w-3 h-3 ${color} rounded-full mx-auto mb-2`}></div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-[#0F172A]">{percent}</p>
    </div>
  )
}

function FilterItem({ icon, label }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
      <span className="text-xs font-bold">{label}</span>
      <div className="text-[#FF8FAB]">{icon}</div>
    </div>
  )
}