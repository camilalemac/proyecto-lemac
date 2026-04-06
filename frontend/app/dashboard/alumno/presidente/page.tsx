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
    resumen: { pagado: 0, porCobrar: 0, total: 0 },
    gastosCategorias: [],
    balanceProyectado: 0,
    reportes: []
  })

  useEffect(() => {
    const fetchDatosPresidente = async () => {
      try {
        const token = Cookies.get("auth-token")
        // Aquí conectarías con tu Gateway (Puerto 3007)
        // const res = await fetch('http://127.0.0.1:3007/api/v1/finanzas/resumen-general', { ... })
        // const result = await res.json()
        
        // Simulación de carga para ver la UI
        setTimeout(() => setLoading(false), 800)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }
    fetchDatosPresidente()
  }, [])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )

  return (
    <div className="max-w-400 mx-auto p-6 space-y-10">
      
      {/* 1. HEADER ESTRATÉGICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Panel de Control Presidencial</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión Financiera 2026</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} /> Filtrar Período
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            <FileText size={16} /> Generar Reporte Mensual
          </button>
        </div>
      </header>

      {/* 2. DASHBOARD DE INGRESOS Y EGRESOS (APODERADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Cuotas Recaudadas", value: data.resumen.pagado, icon: <TrendingUp />, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Ingresos confirmados" },
          { title: "Cuentas por Cobrar", value: data.resumen.porCobrar, icon: <Users />, color: "text-rose-500", bg: "bg-rose-50", desc: "Pendiente apoderados" },
          { title: "Fondo de Tesorería", value: data.resumen.total, icon: <Wallet />, color: "text-indigo-500", bg: "bg-indigo-50", desc: "Capital actual" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 group hover:scale-[1.02] transition-transform">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-6`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">${s.value.toLocaleString('es-CL')}</h3>
              <span className="text-[10px] font-bold text-slate-400">CLP</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1 font-medium italic">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 3. GASTOS POR CATEGORÍA & DASHBOARD */}
        <section className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <PieChart className="text-indigo-500" size={24} />
                Análisis de Gastos
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Distribución del presupuesto por categoría</p>
            </div>
            <BarChart3 className="text-slate-200" size={32} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Aquí mapearías data.gastosCategorias */}
              <ProgressBar label="Paseo de Final de Año" amount="$0" percentage={0} color="bg-indigo-500" />
              <ProgressBar label="Eventos y Celebraciones" amount="$0" percentage={0} color="bg-rose-400" />
              <ProgressBar label="Regalos y Materiales" amount="$0" percentage={0} color="bg-amber-400" />
              <ProgressBar label="Fondo de Emergencia" amount="$0" percentage={0} color="bg-emerald-400" />
            </div>
            <div className="bg-slate-50 rounded-4xl p-8 flex flex-col justify-center items-center text-center border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-slate-300">
                <TrendingDown size={28} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Gasto más alto</p>
              <h4 className="text-lg font-bold text-slate-700 mt-1">Sin registros aún</h4>
            </div>
          </div>
        </section>

        {/* 4. BALANCE FINAL & REPORTES */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Balance Proyectado */}
          <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md mb-6">
                <Calendar size={24} />
              </div>
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Balance Proyectado (Diciembre)</p>
              <h3 className="text-4xl font-black mt-2 tracking-tight">${data.balanceProyectado.toLocaleString('es-CL')}</h3>
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Estado: Saludable</span>
                <ArrowUpRight size={20} className="text-emerald-400" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          {/* Reportes Generados */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText size={18} className="text-rose-500" /> Reportes Recientes
            </h3>
            <div className="space-y-4">
              {data.reportes.length > 0 ? (
                data.reportes.map((rep: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg group-hover:text-indigo-600 transition-colors">
                        <Download size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{rep.nombre}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{rep.fecha}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-slate-300 text-center py-6 italic uppercase tracking-widest">No hay reportes generados</p>
              )}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}

function ProgressBar({ label, amount, percentage, color }: any) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest">
        <span className="text-slate-400 group-hover:text-slate-900 transition-colors">{label}</span>
        <span className="text-slate-900">{amount}</span>
      </div>
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}