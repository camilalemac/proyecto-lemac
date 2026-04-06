"use client"
import { useState, useEffect } from "react"
import { 
  Wallet, TrendingUp, TrendingDown, PieChart, 
  BarChart3, FileText, Users, ArrowUpRight, 
  Download, Filter, Calendar
} from "lucide-react"
import Cookies from "js-cookie"

export default function PresidentePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: { recaudado: 0, porCobrar: 0, fondoActual: 0 },
    balanceProyectado: 0
  })

  useEffect(() => {
    // Simulación de carga
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) return null // O un skeleton breve

  return (
    <div className="space-y-10">
      
      {/* 1. HEADER: Título y Botones de Acción */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Panel de Control Presidencial</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión Financiera 2026</h1>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} /> Filtrar Período
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl text-xs font-black text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <FileText size={16} /> Generar Reporte Mensual
          </button>
        </div>
      </header>

      {/* 2. TARJETAS DE ESTADÍSTICAS (Iguales a la imagen) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Cuotas Recaudadas" 
          value={data.stats.recaudado} 
          icon={<TrendingUp size={24}/>} 
          color="text-emerald-500" 
          bg="bg-emerald-50"
          desc="Ingresos confirmados"
        />
        <StatCard 
          title="Cuentas por Cobrar" 
          value={data.stats.porCobrar} 
          icon={<Users size={24}/>} 
          color="text-rose-500" 
          bg="bg-rose-50"
          desc="Pendiente apoderados"
        />
        <StatCard 
          title="Fondo de Tesorería" 
          value={data.stats.fondoActual} 
          icon={<Wallet size={24}/>} 
          color="text-indigo-500" 
          bg="bg-indigo-50"
          desc="Capital actual"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 3. ANÁLISIS DE GASTOS */}
        <section className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-indigo-100/20">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500">
                 <PieChart size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-black text-slate-900">Análisis de Gastos</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Distribución del presupuesto por categoría</p>
               </div>
            </div>
            <BarChart3 className="text-slate-200" size={32} />
          </div>

          <div className="space-y-8">
            <ProgressBar label="Paseo de Final de Año" amount={0} percentage={0} color="bg-indigo-500" />
            <ProgressBar label="Eventos y Celebraciones" amount={0} percentage={0} color="bg-indigo-400" />
            <ProgressBar label="Regalos y Materiales" amount={0} percentage={0} color="bg-indigo-300" />
          </div>
        </section>

        {/* 4. BALANCE PROYECTADO (Tarjeta Azul Grande) */}
        <aside className="lg:col-span-4">
          <div className="bg-indigo-600 p-10 rounded-[3rem] text-white h-full relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
              <div className="bg-white/10 w-fit p-4 rounded-3xl backdrop-blur-md mb-8">
                <Calendar size={28} />
              </div>
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Balance Proyectado</p>
              <p className="text-indigo-200 text-xs font-bold uppercase opacity-60 mb-2">(Diciembre)</p>
              <h3 className="text-5xl font-black tracking-tighter">${data.balanceProyectado}</h3>
            </div>
            
            <div className="relative z-10 mt-12 flex items-center justify-between group cursor-pointer">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Ver detalle proyectado</span>
              <ArrowUpRight size={20} className="text-white/40 group-hover:text-white transition-all" />
            </div>

            {/* Círculo decorativo de fondo */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </aside>

      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, bg, desc }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm shadow-indigo-100/50 border border-slate-50 flex flex-col items-start hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-500 group">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">${value}</h3>
        <span className="text-[10px] font-black text-slate-300 uppercase">clp</span>
      </div>
      <p className="text-[11px] text-slate-400 mt-6 font-medium italic opacity-0 group-hover:opacity-100 transition-opacity">{desc}</p>
    </div>
  )
}

function ProgressBar({ label, amount, percentage, color }: any) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] font-black mb-4 uppercase tracking-widest">
        <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-slate-900 text-sm">${amount}</span>
        </div>
      </div>
      <div className="w-full bg-slate-50 h-4 rounded-full overflow-hidden p-1 border border-slate-100">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}