"use client"
import { useState, useEffect } from "react"
import { 
  PieChart, ArrowUpCircle, ArrowDownCircle, 
  FileSpreadsheet, PlusCircle, Download, Loader2, 
  Wallet, Users, TrendingUp, CalendarDays, Receipt, ShieldAlert, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { pagosService } from "../../../../services/pagosService"
import { reporteService } from "../../../../services/reporteService"

export default function TesoreroCursoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState({
    ingresos: 0,
    egresos: 0,
    pendientesCount: 0,
    cuotasTotales: 0,
    cuotasPagadas: 0,
    categorias: [] as any[]
  })

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 1. Validar Identidad y Curso
      const perfil = await authService.getMe()
      const rolesPermitidos = ['DIR_TES_ALU', 'CEN_TES_CAL']
      const esTesorero = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

      if (!esTesorero) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      const colId = perfil.COLEGIO_ID || 1
      const cursoId = (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1
      
      setUser({ ...perfil, cursoId })

      // 2. Obtener movimientos financieros del colegio
      const movsData = await pagosService.getMovimientosPorColegio(colId)
      const movsCurso = movsData.filter((m: any) => Number(m.CURSO_ID || m.curso_id) === Number(cursoId))
      
      const ingresos = movsCurso.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'INGRESO')
        .reduce((acc: number, m: any) => acc + Number(m.MONTO || m.monto), 0)
      
      const egresos = movsCurso.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'EGRESO')
        .reduce((acc: number, m: any) => acc + Number(m.MONTO || m.monto), 0)

      // 3. Obtener cuentas por cobrar del colegio (deudas)
      const cobrosData = await pagosService.getCuentasPorCobrar(colId)
      const cobrosCurso = cobrosData.filter((c: any) => Number(c.CURSO_ID || c.curso_id) === Number(cursoId))

      const pendientesCount = cobrosCurso.filter((c: any) => (c.ESTADO || c.estado) === 'PENDIENTE').length
      const cuotasPagadas = cobrosCurso.filter((c: any) => (c.ESTADO || c.estado) === 'PAGADO').length
      const cuotasTotales = cobrosCurso.length

      // 4. Agrupar gastos por categoría para el Dashboard
      const categoriasMap: any = {}
      movsCurso.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'EGRESO').forEach((m: any) => {
        const catName = m.categoria?.NOMBRE || m.categoria?.nombre || `Categoría ID: ${m.CATEGORIA_ID || m.categoria_id}`
        categoriasMap[catName] = (categoriasMap[catName] || 0) + Number(m.MONTO || m.monto)
      })

      const catArray = Object.keys(categoriasMap).map(nombre => {
        const monto = categoriasMap[nombre]
        const porcentaje = egresos > 0 ? (monto / egresos) * 100 : 0
        return { nombre, monto, porcentaje }
      }).sort((a, b) => b.monto - a.monto) // Ordenar de mayor a menor gasto

      setData({
        ingresos,
        egresos,
        pendientesCount,
        cuotasTotales,
        cuotasPagadas,
        categorias: catArray
      })

    } catch (e) {
      console.error("Error al cargar finanzas:", e)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEmitirReporte = async (tipo: string) => {
    try {
      alert(`Iniciando generación de Balance ${tipo}...`)
      const payload = {
        titulo: `Balance Financiero de Curso - ${tipo.toUpperCase()}`,
        periodo: new Date().getFullYear().toString(),
        tipo: 'REPORTE_FINANCIERO_MENSUAL',
        cursoId: user.cursoId,
        ingresos: data.ingresos,
        egresos: data.egresos,
        saldoFinal: data.ingresos - data.egresos
      }
      await reporteService.createActa(payload)
      alert("Balance generado y guardado en Oracle exitosamente.")
    } catch (e: any) {
      alert(`Error al generar reporte: ${e.message}`)
    }
  }

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Tesorería de Curso...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#F8FAFC]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">Este panel financiero es exclusivo para el Tesorero de Curso.</p>
        <button onClick={() => router.push('/dashboard/alumno/curso-alumno')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
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
          bg="bg-pink-50"
          icon={<Users />} 
          subtitle="Proporción recaudada"
        />
        <div className="bg-[#1A1A2E] p-7 rounded-[2.5rem] shadow-xl relative overflow-hidden group border-b-4 border-[#FF8FAB]">
          <div className="relative z-10">
            <div className="bg-[#FF8FAB] text-[#1A1A2E] w-fit p-3 rounded-2xl mb-4 shadow-sm"><Wallet size={20}/></div>
            <p className="text-[9px] font-black text-pink-300 uppercase tracking-widest mb-1">Balance Disponible</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">${(data.ingresos - data.egresos).toLocaleString('es-CL')}</h3>
          </div>
          <Wallet size={100} className="absolute -right-6 -bottom-6 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. DASHBOARD DE GASTOS Y CATEGORÍAS */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-pink-50 rounded-2xl text-[#FF8FAB]">
                  <PieChart size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight italic">Análisis de Gastos</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribución por área</p>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-100 shadow-inner">
                <TrendingUp size={14} className="text-[#1A1A2E]" />
                <span className="text-[10px] font-black text-slate-600 uppercase">Período 2026</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
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
                  <div className="text-center py-10 opacity-40">
                    <PieChart size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sin egresos registrados</p>
                  </div>
                )}
              </div>
              
              {/* Visualización Donut Chart (Simulada) */}
              <div className="bg-[#FAF5FF] aspect-square rounded-full border-16 border-white shadow-inner flex flex-col items-center justify-center relative">
                <div className="text-center z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Gastado</p>
                  <p className="text-3xl font-black text-[#1A1A2E] mt-1">${data.egresos.toLocaleString('es-CL')}</p>
                </div>
                {/* Un pequeño hack de CSS para simular un gráfico cuando hay datos */}
                {data.egresos > 0 && (
                   <div className="absolute inset-0 border-12 border-[#FF8FAB]/20 rounded-full border-t-[#FF8FAB] animate-[spin_3s_ease-out_forwards]"></div>
                )}
              </div>
            </div>
          </section>

          {/* TABLA RÁPIDA DE CUOTAS POR PAGAR */}
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
               <div className="bg-pink-50 p-4 rounded-2xl text-[#FF8FAB]"><Receipt size={24} /></div>
               <div>
                 <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Cuotas por Cobrar</h3>
                 <p className="text-[11px] font-bold text-slate-400">Hay {data.pendientesCount} alumnos con mensualidad pendiente</p>
               </div>
             </div>
             <Link href="/dashboard/alumno/curso-alumno/tesorero/cobranza" className="bg-[#1A1A2E] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all w-full md:w-auto text-center shadow-lg">
               Ir a Gestión de Cobranza
             </Link>
          </section>
        </div>

        {/* 3. GENERACIÓN DE REPORTES Y ACCIONES */}
        <aside className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-[#1A1A2E] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group flex-1 flex flex-col">
            <div className="relative z-10">
              <div className="bg-[#FF8FAB] text-[#1A1A2E] w-fit p-4 rounded-2xl mb-6 shadow-sm">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter">Emisión Oficial</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed mb-8">
                Genera el balance oficial financiero para presentar en las reuniones de apoderados.
              </p>
              
              <div className="space-y-3 mt-auto">
                <ReportButton label="Reporte Mensual" onClick={() => handleEmitirReporte('Mensual')} />
                <ReportButton label="Balance Trimestral" onClick={() => handleEmitirReporte('Trimestral')} />
                <ReportButton label="Estado Anual 2026" onClick={() => handleEmitirReporte('Anual')} isMain />
              </div>
            </div>
            <CalendarDays size={180} className="absolute -bottom-16 -right-16 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <Link href="/dashboard/alumno/curso-alumno/tesorero/gastos" className="w-full bg-[#FDF2F5] p-8 rounded-[3.5rem] border border-pink-100 hover:border-[#FF8FAB] hover:bg-white transition-all group shadow-sm flex flex-col items-center justify-center min-h-40">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-[#1A1A2E] rounded-full text-[#FF8FAB] group-hover:scale-110 transition-transform shadow-lg">
                  <PlusCircle size={28} />
                </div>
                <span className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mt-2">Registrar Movimiento</span>
              </div>
          </Link>
        </aside>

      </div>
    </div>
  )
}

// Componentes Auxiliares
function StatCard({ title, value, color, bg, icon, subtitle }: any) {
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:-translate-y-1 transition-all duration-300 group`}>
      <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
      <p className={`text-2xl font-black text-[#1A1A2E] tracking-tight`}>{value}</p>
      {subtitle && <p className="text-[9px] font-bold text-slate-400 mt-1 italic">{subtitle}</p>}
    </div>
  )
}

function CategoryRow({ label, amount, percent, color }: any) {
  return (
    <div className="group">
      <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-wider mb-2.5">
        <span className="text-slate-500 group-hover:text-[#1A1A2E] transition-colors">{label}</span>
        <span className="text-[#1A1A2E]">{amount}</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`} 
          style={{ width: `${Math.min(percent, 100)}%` }}
        ></div>
      </div>
    </div>
  )
}

function ReportButton({ label, isMain = false, onClick }: { label: string, isMain?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      isMain 
      ? "bg-white text-[#1A1A2E] shadow-xl mt-6 hover:bg-[#FF8FAB]" 
      : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
    }`}>
      {label}
      <Download size={16} strokeWidth={2.5} />
    </button>
  )
}