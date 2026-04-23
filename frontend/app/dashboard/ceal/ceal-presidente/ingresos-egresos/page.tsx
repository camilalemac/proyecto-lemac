"use client"
import { useState, useEffect } from "react"
import { ArrowRightLeft, TrendingUp, TrendingDown, Filter, Loader2, Calendar, AlertCircle, Home } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { pagosService } from "../../../../../services/pagosService"
import { IMovimientoCaja } from "../../../../../types/admin.types"
import { formatCurrencyCLP } from "../../../../../utils/formatters"

export default function IngresosEgresosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [movimientos, setMovimientos] = useState<IMovimientoCaja[]>([])
  const [filtroActivo, setFiltroActivo] = useState("TODOS")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [finanzas, setFinanzas] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0
  })

  useEffect(() => {
    const fetchDataReal = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { router.push("/login"); return; }

        // 1. Obtener movimientos de la cuenta operativa (ID 1) desde el Ledger Oracle
        const data = await pagosService.getMovimientosByCuenta(1)

        // 2. Ordenar por fecha (Más reciente primero)
        const sortedMovs = data.sort((a, b) => 
          new Date(b.FECHA_MOVIMIENTO).getTime() - new Date(a.FECHA_MOVIMIENTO).getTime()
        )
        
        setMovimientos(sortedMovs)

        // 3. Calcular totales para métricas
        let ingresos = 0
        let egresos = 0
        
        sortedMovs.forEach((mov) => {
          if (mov.TIPO_MOVIMIENTO === 'INGRESO') ingresos += Number(mov.MONTO)
          if (mov.TIPO_MOVIMIENTO === 'EGRESO') egresos += Number(mov.MONTO)
        })

        setFinanzas({
          totalIngresos: ingresos,
          totalEgresos: egresos,
          balance: ingresos - egresos
        })

      } catch (err: any) {
        console.error("Error auditando libro de caja:", err)
        setErrorMsg(err.message || "No se pudo sincronizar con el nodo financiero.")
      } finally {
        setLoading(false)
      }
    }
    fetchDataReal()
  }, [router])

  const movimientosFiltrados = movimientos.filter(mov => {
    if (filtroActivo === "TODOS") return true
    return mov.TIPO_MOVIMIENTO === filtroActivo
  })

  const totalFlujo = finanzas.totalIngresos + finanzas.totalEgresos;
  const porcentajeIngresos = totalFlujo > 0 ? (finanzas.totalIngresos / totalFlujo) * 100 : 50;

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 italic">Sincronizando Ledger Oracle...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      <nav className="flex items-center gap-4">
        <Link href="/dashboard/alumno/ceal-presidente" className="text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Home size={14} /> Panel Central
        </Link>
      </nav>

      {/* HEADER */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <ArrowRightLeft size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Libro de Caja</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Auditoría de Movimientos CEAL</p>
          </div>
        </div>

        <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-100 z-10">
          {["TODOS", "INGRESO", "EGRESO"].map((f) => (
            <button 
              key={f}
              onClick={() => setFiltroActivo(f)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filtroActivo === f ? "bg-[#1A1A2E] text-[#FF8FAB] shadow-lg" : "text-slate-400 hover:text-[#1A1A2E]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-4xl flex items-center gap-4 text-rose-600 shadow-sm">
          <AlertCircle size={28} />
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Fallo en Auditoría</p>
            <p className="text-xs font-bold opacity-80">{errorMsg}</p>
          </div>
        </div>
      ) : (
        <>
          {/* MÉTRICAS DE FLUJO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricBox title="Total Ingresos" amount={finanzas.totalIngresos} type="INGRESO" />
            <MetricBox title="Total Egresos" amount={finanzas.totalEgresos} type="EGRESO" />
            
            <div className="bg-[#1A1A2E] text-white p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden">
              <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-widest">Balance Operacional</p>
              <p className="text-5xl font-black mt-4 tracking-tighter">{formatCurrencyCLP(finanzas.balance)}</p>
              <div className="w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-[#FF8FAB] transition-all duration-1000" style={{ width: `${porcentajeIngresos}%` }} />
              </div>
            </div>
          </div>

          {/* LISTADO DE TRANSACCIONES */}
          <section className="bg-white rounded-[4rem] shadow-sm border border-pink-50 overflow-hidden">
            <div className="p-10">
              {movimientosFiltrados.length > 0 ? (
                <div className="grid gap-4">
                  {movimientosFiltrados.map((mov, i) => (
                    <div key={i} className="flex flex-col md:flex-row justify-between items-center p-8 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-pink-200 transition-all group">
                      <div className="flex items-center gap-8">
                        <div className={`p-5 rounded-2xl shadow-sm ${mov.TIPO_MOVIMIENTO === 'INGRESO' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                          {mov.TIPO_MOVIMIENTO === 'INGRESO' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                        </div>
                        <div>
                          <p className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight">{mov.GLOSA}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Calendar size={12} /> {new Date(mov.FECHA_MOVIMIENTO).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right mt-6 md:mt-0">
                        <p className={`text-3xl font-black tracking-tighter ${mov.TIPO_MOVIMIENTO === 'INGRESO' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {mov.TIPO_MOVIMIENTO === 'INGRESO' ? '+' : '-'}{formatCurrencyCLP(mov.MONTO)}
                        </p>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Nodo Verificado</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center opacity-30">
                  <Filter size={80} className="text-[#1A1A2E] mb-6" />
                  <p className="font-black uppercase tracking-widest text-[#1A1A2E] text-xl">Sin movimientos registrados</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function MetricBox({ title, amount, type }: { title: string, amount: number, type: 'INGRESO' | 'EGRESO' }) {
  const isIngreso = type === 'INGRESO'
  return (
    <div className={`${isIngreso ? 'bg-emerald-500' : 'bg-rose-500'} text-white p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden group`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</p>
      <p className="text-5xl font-black mt-4 tracking-tighter">{formatCurrencyCLP(amount)}</p>
      {isIngreso 
        ? <TrendingUp size={120} className="absolute right-0 bottom-0 -mb-8 -mr-8 opacity-20 group-hover:scale-110 transition-transform" />
        : <TrendingDown size={120} className="absolute right-0 bottom-0 -mb-8 -mr-8 opacity-20 group-hover:scale-110 transition-transform" />
      }
    </div>
  )
}