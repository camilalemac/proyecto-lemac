"use client"
import { useState, useEffect } from "react"
import { TrendingUp, Users, Wallet, PieChart, ArrowUpRight, Loader2, ServerOff, ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { pagosService } from "../../../../services/pagosService"

export default function PresidenteDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  
  const [stats, setStats] = useState({ cuotasRecaudadas: 0, cuentasPorCobrar: 0, fondoTesoreria: 0, balanceProyectado: 0, totalEgresos: 0 })
  const [gastosCategorias, setGastosCategorias] = useState<any[]>([])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 1. Validar Identidad y Curso
      const perfil = await authService.getMe()
      
      // Validar si tiene el rol de Presidente de Curso (Alumno) o Presidente del Centro de Alumnos
      const rolesPermitidos = ['DIR_PRES_ALU', 'CEN_PRES_CAL']
      const esPresidente = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

      if (!esPresidente) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      const colId = perfil.COLEGIO_ID || 1
      const cursoId = (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1;// Idealmente el contexto_id del rol te dice el curso

      // 2. Obtener movimientos financieros del colegio
      const movsData = await pagosService.getMovimientosPorColegio(colId)
      
      // Filtrar solo los movimientos que pertenezcan al curso del presidente
      const movsCurso = movsData.filter((m: any) => Number(m.CURSO_ID || m.curso_id) === Number(cursoId))
      
      const ingresos = movsCurso.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'INGRESO')
        .reduce((acc: number, m: any) => acc + Number(m.MONTO || m.monto), 0)
      
      const egresos = movsCurso.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'EGRESO')
        .reduce((acc: number, m: any) => acc + Number(m.MONTO || m.monto), 0)

      // 3. Obtener cuentas por cobrar del colegio (deudas)
      const cobrosData = await pagosService.getCuentasPorCobrar(colId)
      
      // Filtrar deudas pendientes que pertenezcan a este curso
      const pendiente = cobrosData.filter((c: any) => 
        (c.ESTADO || c.estado) === 'PENDIENTE' && Number(c.CURSO_ID || c.curso_id) === Number(cursoId)
      ).reduce((acc: number, c: any) => acc + (Number(c.MONTO_ORIGINAL || c.monto_original) - Number(c.MONTO_PAGADO || c.monto_pagado || 0)), 0)

      setStats({
        cuotasRecaudadas: ingresos,
        cuentasPorCobrar: pendiente,
        fondoTesoreria: ingresos - egresos,
        balanceProyectado: (ingresos - egresos) + pendiente,
        totalEgresos: egresos
      })

      // 4. Agrupar gastos por categoría para la barra de progreso
      const categoriasMap: any = {}
      movsCurso.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'EGRESO').forEach((m: any) => {
        const catName = m.categoria?.NOMBRE || m.categoria?.nombre || `Categoría ${m.CATEGORIA_ID || m.categoria_id}`
        categoriasMap[catName] = (categoriasMap[catName] || 0) + Number(m.MONTO || m.monto)
      })
      
      setGastosCategorias(Object.keys(categoriasMap).map(nombre => ({ label: nombre, monto: categoriasMap[nombre] })))

    } catch (e: any) {
      console.error("Error al cargar dashboard de presidente:", e)
      setErrorGlobal(e.message || "No se pudo sincronizar la información del curso con Oracle DB.")
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-sky-500" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autenticando Ledger Estudiantil...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#F8FAFC]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">Este panel es exclusivo para los Presidentes de Curso de la Directiva de Alumnos.</p>
        <button onClick={() => router.push('/login')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Ir al Login
        </button>
      </div>
    </div>
  )

  if (errorGlobal) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-8 bg-[#F8FAFC]">
      <ServerOff size={80} className="mb-6 text-rose-400 opacity-20" />
      <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Falla de Sincronización</h2>
      <p className="text-sm font-bold text-rose-500 mt-2 max-w-md">{errorGlobal}</p>
      <button onClick={loadData} className="mt-8 px-8 py-3 bg-[#1A1A2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
        Reintentar Conexión
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 pb-10">
      
      {/* 1. CUOTAS TOTALES, NETO Y BALANCE FINAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Recaudación Efectiva" value={stats.cuotasRecaudadas} icon={<TrendingUp />} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard title="Deuda Estudiantil" value={stats.cuentasPorCobrar} icon={<Users />} color="text-rose-500" bg="bg-rose-50" />
        <StatCard title="Fondo de Curso" value={stats.fondoTesoreria} icon={<Wallet />} color="text-sky-500" bg="bg-sky-50" />
        
        <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border-b-8 border-sky-400">
          <p className="text-[10px] font-black text-sky-400 uppercase mb-1 tracking-widest">Proyección Anual</p>
          <h3 className="text-3xl font-black tracking-tighter">${stats.balanceProyectado.toLocaleString('es-CL')}</h3>
          <ArrowUpRight size={100} className="absolute right-0 bottom-0 -mb-6 -mr-6 text-white/5 group-hover:text-sky-400/20 transition-colors duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. DASHBOARD Y GASTOS POR CATEGORÍA */}
        <section className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
          <header className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-4 uppercase tracking-tighter italic">
                <PieChart className="text-sky-400" size={28} /> Dashboard de Gastos
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Distribución del presupuesto del curso</p>
            </div>
            
            <Link href="/dashboard/alumno/curso-alumno/movimientos" className="hidden sm:flex text-[10px] font-black uppercase text-sky-500 hover:text-[#1A1A2E] tracking-widest items-center gap-2 transition-colors bg-sky-50 px-4 py-2 rounded-xl">
              Ver Detalle <ArrowUpRight size={14} />
            </Link>
          </header>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {gastosCategorias.length > 0 ? gastosCategorias.map((g, i) => (
              <ProgressBar key={i} label={g.label} amount={g.monto} percentage={(g.monto / (stats.totalEgresos || 1)) * 100} />
            )) : (
              <div className="py-16 text-center flex flex-col items-center opacity-30">
                <PieChart size={64} className="text-slate-400 mb-4" />
                <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter">Sin Egresos Registrados</h3>
                <p className="text-xs font-medium mt-2 max-w-sm text-slate-500 italic">El Tesorero de su curso aún no ha rendido gastos en el libro de caja.</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. VISUALIZACIÓN INGRESOS Y EGRESOS */}
        <aside className="lg:col-span-4 bg-[#F8FAFC] p-10 rounded-[3rem] border border-slate-100 shadow-inner flex flex-col justify-center">
           <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-widest mb-8 flex items-center gap-2">
             <div className="w-1.5 h-6 bg-sky-400 rounded-full" />
             Resumen de Flujo
           </h3>
           <div className="space-y-8">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ingresos</p>
               <p className="text-3xl font-black text-emerald-500 tracking-tight">+${stats.cuotasRecaudadas.toLocaleString('es-CL')}</p>
             </div>
             
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Egresos</p>
               <p className="text-3xl font-black text-rose-500 tracking-tight">-${stats.totalEgresos.toLocaleString('es-CL')}</p>
             </div>

             <div className="pt-6 border-t-2 border-dashed border-slate-200 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Liquidez Disponible</p>
               <p className="text-4xl font-black text-[#1A1A2E] tracking-tighter">${stats.fondoTesoreria.toLocaleString('es-CL')}</p>
             </div>
           </div>
        </aside>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:border-slate-200 transition-all">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tighter">${value.toLocaleString('es-CL')}</h3>
    </div>
  )
}

function ProgressBar({ label, amount, percentage }: any) {
  return (
    <div className="group">
      <div className="flex justify-between items-end text-[11px] font-black mb-3 uppercase tracking-widest">
        <span className="text-slate-500 group-hover:text-sky-500 transition-colors">{label}</span>
        <span className="text-[#1A1A2E] text-sm">${amount.toLocaleString('es-CL')}</span>
      </div>
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
        <div 
          className="bg-sky-400 h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
          style={{ width: `${Math.min(percentage, 100)}%` }} 
        />
      </div>
      <p className="text-right text-[9px] font-bold text-slate-400 mt-1 tracking-wider">{percentage.toFixed(1)}% del presupuesto</p>
    </div>
  )
}