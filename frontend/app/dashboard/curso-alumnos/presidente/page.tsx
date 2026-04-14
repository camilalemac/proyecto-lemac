"use client"
import { useState, useEffect } from "react"
import { TrendingUp, Users, Wallet, BarChart3, PieChart, TrendingDown, ArrowUpRight } from "lucide-react"
import Cookies from "js-cookie"

export default function PresidenteDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ cuotasRecaudadas: 0, cuentasPorCobrar: 0, fondoTesoreria: 0, balanceProyectado: 0, totalEgresos: 0 })
  const [gastosCategorias, setGastosCategorias] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return setLoading(false)
        const headers = { 'Authorization': `Bearer ${token}` }

        const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
        const dataMe = await resMe.json()

        if (dataMe.success) {
          const resMov = await fetch(`http://127.0.0.1:3007/api/v1/pagos/movimientos/colegio/${dataMe.data.colegioId}`, { headers })
          const dataMov = await resMov.json()

          const resCobros = await fetch(`http://127.0.0.1:3007/api/v1/pagos/cobros/colegio/${dataMe.data.colegioId}`, { headers })
          const dataCobros = await resCobros.json()

          if (dataMov.success) {
            const movs = dataMov.data.filter((m:any) => Number(m.CURSO_ID) === Number(dataMe.data.cursoId))
            const ingresos = movs.filter((m: any) => m.TIPO_MOVIMIENTO === 'INGRESO').reduce((acc: number, m: any) => acc + Number(m.MONTO), 0)
            const egresos = movs.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO').reduce((acc: number, m: any) => acc + Number(m.MONTO), 0)
            
            const pendiente = dataCobros.success 
              ? dataCobros.data.filter((c: any) => c.ESTADO === 'PENDIENTE' && Number(c.CURSO_ID) === Number(dataMe.data.cursoId))
                               .reduce((acc: number, c: any) => acc + (Number(c.MONTO_ORIGINAL) - Number(c.MONTO_PAGADO)), 0)
              : 0

            setStats({
              cuotasRecaudadas: ingresos,
              cuentasPorCobrar: pendiente,
              fondoTesoreria: ingresos - egresos,
              balanceProyectado: (ingresos - egresos) + pendiente,
              totalEgresos: egresos // Guardamos los egresos para mostrarlos en el flujo
            })

            const categoriasMap: any = {}
            movs.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO').forEach((m: any) => {
              const catId = m.CATEGORIA_ID || 'General'
              categoriasMap[catId] = (categoriasMap[catId] || 0) + Number(m.MONTO)
            })
            setGastosCategorias(Object.keys(categoriasMap).map(id => ({ label: `Área ID: ${id}`, monto: categoriasMap[id] })))
          }
        }
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    fetchDashboardData()
  }, [])

  if (loading) return null

  return (
    <div className="space-y-10 animate-in zoom-in-95 duration-500">
      {/* 1. CUOTAS TOTALES, NETO Y BALANCE FINAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Cuotas Pagadas" value={stats.cuotasRecaudadas} icon={<TrendingUp />} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard title="Cuotas por Pagar" value={stats.cuentasPorCobrar} icon={<Users />} color="text-rose-500" bg="bg-rose-50" />
        <StatCard title="Fondo en Caja" value={stats.fondoTesoreria} icon={<Wallet />} color="text-indigo-500" bg="bg-indigo-50" />
        <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <p className="text-[10px] font-black text-[#FF8FAB] uppercase mb-1 tracking-widest">Balance Final Año</p>
          <h3 className="text-3xl font-black">${stats.balanceProyectado.toLocaleString('es-CL')}</h3>
          <ArrowUpRight size={80} className="absolute right-0 bottom-0 -mb-4 -mr-4 text-white/5 group-hover:text-[#FF8FAB]/10 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2 Y 5. DASHBOARD Y GASTOS POR CATEGORÍA */}
        <section className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-[#1A1A2E] mb-12 flex items-center gap-4 uppercase tracking-tight">
            <PieChart className="text-[#FF8FAB]" size={28} /> Dashboard de Gastos
          </h2>
          <div className="space-y-8">
            {gastosCategorias.length > 0 ? gastosCategorias.map((g, i) => (
              <ProgressBar key={i} label={g.label} amount={g.monto} percentage={(g.monto / (stats.cuotasRecaudadas || 1)) * 100} />
            )) : (
              <div className="py-10 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic border-2 border-dashed border-slate-100 rounded-3xl">
                Aún no se registran gastos en Oracle
              </div>
            )}
          </div>
        </section>

        {/* 3. VISUALIZACIÓN INGRESOS Y EGRESOS APODERADOS */}
        <aside className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
             Flujo de Dinero
           </h3>
           <div className="space-y-6">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ingresos</p>
               <p className="text-2xl font-black text-emerald-500">+${stats.cuotasRecaudadas.toLocaleString('es-CL')}</p>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Egresos</p>
               <p className="text-2xl font-black text-rose-500">-${stats.totalEgresos.toLocaleString('es-CL')}</p>
             </div>
             <div className="pt-6 border-t border-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Neto Actual</p>
               <p className="text-xl font-black text-[#1A1A2E]">${stats.fondoTesoreria.toLocaleString('es-CL')}</p>
             </div>
           </div>
        </aside>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 group hover:shadow-xl transition-all">
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tighter">${value.toLocaleString('es-CL')}</h3>
    </div>
  )
}

function ProgressBar({ label, amount, percentage }: any) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-black mb-3 uppercase tracking-widest">
        <span className="text-slate-500">{label}</span>
        <span className="text-[#1A1A2E]">${amount.toLocaleString('es-CL')}</span>
      </div>
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-50">
        <div className="bg-linear-to-r from-[#1A1A2E] to-[#FF8FAB] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  )
}