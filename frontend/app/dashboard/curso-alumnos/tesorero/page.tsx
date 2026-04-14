"use client"
import { useState, useEffect } from "react"
import { 
  BarChart3, PieChart, ArrowUpCircle, ArrowDownCircle, 
  FileSpreadsheet, PlusCircle, Download, Loader2, 
  Wallet, Users, TrendingUp, CalendarDays, Receipt
} from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"

export default function TesoreroPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState({
    ingresos: 0,
    egresos: 0,
    pendientesCount: 0,
    cuotasTotales: 0,
    cuotasPagadas: 0,
    categorias: [] as any[]
  })

  // Conexión real al Microservicio de Pagos
  useEffect(() => {
    const fetchFinanzas = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return setLoading(false)
        const headers = { 'Authorization': `Bearer ${token}` }

        const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
        const dataMe = await resMe.json()
        
        if (dataMe.success) {
          setUser(dataMe.data)
          const colegioId = dataMe.data.colegioId
          const cursoId = dataMe.data.cursoId

          // Traer Movimientos (Ingresos y Egresos)
          const resMov = await fetch(`http://127.0.0.1:3007/api/v1/pagos/movimientos/colegio/${colegioId}`, { headers })
          const dataMov = await resMov.json()

          // Traer Cuentas por Cobrar (Deudas)
          const resCobros = await fetch(`http://127.0.0.1:3007/api/v1/pagos/cobros/colegio/${colegioId}`, { headers })
          const dataCobros = await resCobros.json()

          if (dataMov.success && dataCobros.success) {
            // Filtramos todo por el curso que el tesorero administra
            const movsCurso = dataMov.data.filter((m: any) => Number(m.CURSO_ID) === Number(cursoId))
            const cobrosCurso = dataCobros.data.filter((c: any) => Number(c.CURSO_ID) === Number(cursoId))

            const ingresos = movsCurso.filter((m: any) => m.TIPO_MOVIMIENTO === 'INGRESO').reduce((acc: number, m: any) => acc + Number(m.MONTO), 0)
            const egresos = movsCurso.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO').reduce((acc: number, m: any) => acc + Number(m.MONTO), 0)

            const pendientesCount = cobrosCurso.filter((c: any) => c.ESTADO === 'PENDIENTE').length
            const cuotasTotales = cobrosCurso.length
            const cuotasPagadas = cobrosCurso.filter((c: any) => c.ESTADO === 'PAGADO').length

            // Agrupar gastos por categoría para el Dashboard
            const categoriasMap: any = {}
            movsCurso.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO').forEach((m: any) => {
              const catId = m.CATEGORIA_ID || 'General'
              categoriasMap[catId] = (categoriasMap[catId] || 0) + Number(m.MONTO)
            })

            const catArray = Object.keys(categoriasMap).map(id => {
              const monto = categoriasMap[id]
              const porcentaje = egresos > 0 ? (monto / egresos) * 100 : 0
              return { nombre: `Área ID: ${id}`, monto, porcentaje }
            })

            setData({
              ingresos,
              egresos,
              pendientesCount,
              cuotasTotales,
              cuotasPagadas,
              categorias: catArray
            })
          }
        }
      } catch (error) {
        console.error("Error cargando finanzas:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFinanzas()
  }, [])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Sincronizando Tesorería...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. VISUALIZACIÓN DE CUOTAS Y BALANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Ingresos Curso" 
          value={`$${data.ingresos.toLocaleString('es-CL')}`} 
          color="text-emerald-500" 
          bg="bg-emerald-50"
          icon={<ArrowUpCircle />} 
        />
        <StatCard 
          title="Egresos Totales" 
          value={`$${data.egresos.toLocaleString('es-CL')}`} 
          color="text-rose-500" 
          bg="bg-rose-50"
          icon={<ArrowDownCircle />} 
        />
        <StatCard 
          title="Cuotas Pagadas" 
          value={`${data.cuotasPagadas} / ${data.cuotasTotales}`} 
          color="text-[#FF8FAB]" 
          bg="bg-[#FAF5FF]"
          icon={<Users />} 
          subtitle="Proporción recaudada"
        />
        <div className="bg-[#1A1A2E] p-7 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="bg-[#FF8FAB] text-[#1A1A2E] w-fit p-3 rounded-2xl mb-4 shadow-sm"><Wallet size={20}/></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Balance Disponible</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">${(data.ingresos - data.egresos).toLocaleString('es-CL')}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. DASHBOARD DE GASTOS Y CATEGORÍAS */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FAF5FF] rounded-2xl text-[#FF8FAB]">
                  <PieChart size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Análisis de Gastos</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribución por categoría</p>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-100">
                <TrendingUp size={14} className="text-[#1A1A2E]" />
                <span className="text-[10px] font-black text-slate-600 uppercase">Período 2026</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Lista de Categorías */}
              <div className="space-y-6">
                {data.categorias.length > 0 ? (
                  data.categorias.map((cat: any, idx: number) => (
                    <CategoryRow 
                      key={idx}
                      label={cat.nombre} 
                      amount={`$${cat.monto.toLocaleString('es-CL')}`} 
                      percent={cat.porcentaje} 
                      color={idx % 2 === 0 ? "bg-[#1A1A2E]" : "bg-[#FF8FAB]"} 
                    />
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic text-center">Sin egresos registrados</p>
                )}
              </div>
              
              {/* Visualización Donut Chart */}
              <div className="bg-[#FAF5FF] aspect-square rounded-full border-12 border-white shadow-inner flex flex-col items-center justify-center relative">
                <div className="text-center z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Gastado</p>
                  <p className="text-3xl font-black text-[#1A1A2E] mt-1">${data.egresos.toLocaleString('es-CL')}</p>
                </div>
                <div className="absolute inset-0 border-10 border-[#FF8FAB]/20 rounded-full border-t-[#FF8FAB]"></div>
              </div>
            </div>
          </section>

          {/* TABLA RÁPIDA DE CUOTAS POR PAGAR */}
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
               <div className="bg-[#FAF5FF] p-4 rounded-2xl text-[#FF8FAB]"><Receipt size={24} /></div>
               <div>
                 <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Cuotas por Cobrar</h3>
                 <p className="text-[11px] font-bold text-slate-400">Hay {data.pendientesCount} alumnos con mensualidad pendiente</p>
               </div>
             </div>
             <Link href="/dashboard/alumno/tesorero/cobranza" className="bg-[#1A1A2E] text-[#FF8FAB] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all w-full md:w-auto text-center">
               Ir a Cobranza
             </Link>
          </section>
        </div>

        {/* 3. GENERACIÓN DE REPORTES Y ACCIONES */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#1A1A2E] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-[#FF8FAB] text-[#1A1A2E] w-fit p-4 rounded-2xl mb-6 shadow-sm">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-xl font-black mb-2">Emisión de Reportes</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed mb-8">
                Genera el balance oficial financiero para las reuniones de apoderados.
              </p>
              
              <div className="space-y-3">
                <ReportButton label="Reporte Mensual (Abril)" />
                <ReportButton label="Balance Trimestral" />
                <ReportButton label="Estado Anual 2026" isMain />
              </div>
            </div>
            <CalendarDays size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
          </div>

          <button className="w-full bg-[#FAF5FF] p-8 rounded-[3.5rem] border border-[#FF8FAB]/20 hover:border-[#FF8FAB] hover:bg-white transition-all group shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-[#1A1A2E] rounded-full text-[#FF8FAB] group-hover:scale-110 transition-transform">
                  <PlusCircle size={28} />
                </div>
                <span className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">Ingresar Nuevo Gasto</span>
              </div>
          </button>
        </aside>

      </div>
    </div>
  )
}

// Componentes Auxiliares
function StatCard({ title, value, color, bg, icon, subtitle }: any) {
  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:-translate-y-1 transition-all duration-300`}>
      <div className={`${bg} ${color} w-fit p-3 rounded-2xl mb-5 shadow-sm`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
      <p className={`text-2xl font-black text-[#1A1A2E] tracking-tight`}>{value}</p>
      {subtitle && <p className="text-[9px] font-bold text-slate-400 mt-1 italic">{subtitle}</p>}
    </div>
  )
}

function CategoryRow({ label, amount, percent, color }: any) {
  return (
    <div className="group">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-2.5">
        <span className="text-slate-500 group-hover:text-[#1A1A2E] transition-colors">{label}</span>
        <span className="text-[#1A1A2E]">{amount}</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  )
}

function ReportButton({ label, isMain = false }: { label: string, isMain?: boolean }) {
  return (
    <button 
      onClick={() => alert(`Generando ${label}... Conectando a MS_REPORTES.`)}
      className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      isMain 
      ? "bg-white text-[#1A1A2E] shadow-lg mt-4 hover:bg-[#FF8FAB]" 
      : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
    }`}>
      {label}
      <Download size={14} strokeWidth={3} />
    </button>
  )
}