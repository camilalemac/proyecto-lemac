"use client"
import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, TrendingDown, Loader2, Target, PieChart, AlertCircle, Scale, ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { pagosService } from "../../../../../services/pagosService"
import { formatCurrencyCLP } from "../../../../../utils/formatters"

export default function BalanceAnualPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [datosMensuales, setDatosMensuales] = useState<any[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resumenAnual, setResumenAnual] = useState({
    ingresos: 0,
    egresos: 0,
    balance: 0,
    mesMayorGasto: "---"
  })

  useEffect(() => {
    const fetchBalanceReal = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { router.push("/login"); return; }

        // 1. Obtener movimientos reales de la cuenta operativa (ID 1)
        const movimientos = await pagosService.getMovimientosByCuenta(1)
        
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        
        // 2. Procesar datos para el gráfico de barras (Agrupación por mes)
        const statsPorMes = meses.map((nombreMes, index) => {
          const movsMes = movimientos.filter((m: any) => new Date(m.FECHA_MOVIMIENTO).getMonth() === index)
          
          const inMes = movsMes
            .filter((m: any) => m.TIPO_MOVIMIENTO === 'INGRESO')
            .reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)
          
          const outMes = movsMes
            .filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO')
            .reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)
            
          return { mes: nombreMes, ingresos: inMes, egresos: outMes }
        })

        // 3. Cálculos de resumen anual
        const totalIn = statsPorMes.reduce((acc, m) => acc + m.ingresos, 0)
        const totalOut = statsPorMes.reduce((acc, m) => acc + m.egresos, 0)
        const maxGasto = [...statsPorMes].sort((a: any, b: any) => b.egresos - a.egresos)[0]

        setDatosMensuales(statsPorMes)
        setResumenAnual({
          ingresos: totalIn,
          egresos: totalOut,
          balance: totalIn - totalOut,
          mesMayorGasto: maxGasto && maxGasto.egresos > 0 ? maxGasto.mes : "N/A"
        })

      } catch (err: any) {
        console.error("Error en balance anual:", err)
        setErrorMsg(err.message || "Error al sincronizar con el nodo financiero.")
      } finally {
        setLoading(false)
      }
    }
    fetchBalanceReal()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 italic">Consolidando Balance de Arcas...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      <Link href="/dashboard/alumno/ceal-presidente" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-widest w-fit group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Panel
      </Link>

      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <Scale size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Balance Anual</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Auditoría de Fondos CEAL {new Date().getFullYear()}</p>
          </div>
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-white p-16 rounded-[4rem] border-2 border-dashed border-rose-100 flex flex-col items-center text-center gap-4">
          <AlertCircle size={48} className="text-rose-500" />
          <h3 className="text-lg font-black text-[#1A1A2E] uppercase">Error de Nodo</h3>
          <p className="text-xs font-bold text-slate-400 uppercase">{errorMsg}</p>
        </div>
      ) : (
        <>
          {/* TARJETAS DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard title="Recaudación" amount={resumenAnual.ingresos} icon={<TrendingUp className="text-emerald-500" size={24} />} />
            <MetricCard title="Inversión" amount={resumenAnual.egresos} icon={<TrendingDown className="text-rose-500" size={24} />} />
            <div className="bg-[#FF8FAB] p-8 rounded-[3rem] text-white shadow-xl flex flex-col justify-between">
              <Target className="text-white/60 mb-4" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Pico de Gasto</p>
                <p className="text-3xl font-black uppercase mt-1">{resumenAnual.mesMayorGasto}</p>
              </div>
            </div>
            <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-[#FF8FAB] shadow-2xl flex flex-col justify-between">
              <PieChart className="text-[#FF8FAB]/40 mb-4" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Saldo Neto</p>
                <p className="text-3xl font-black mt-1 text-white">{formatCurrencyCLP(resumenAnual.balance)}</p>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE BARRAS CUSTOM */}
          <section className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Comparativa de Flujos por Período</h3>
            </div>
            <div className="p-10">
              <div className="flex items-end justify-between h-80 gap-2 md:gap-4 border-b border-slate-100 pb-6 overflow-x-auto no-scrollbar">
                {datosMensuales.map((mes, i) => {
                  const maxVal = Math.max(...datosMensuales.map(d => Math.max(d.ingresos, d.egresos, 1)));
                  return (
                    <div key={i} className="flex-1 min-w-10 flex flex-col items-center group gap-2 h-full">
                      <div className="relative w-full flex flex-col items-center gap-1 h-full justify-end">
                        {/* Barra Ingresos */}
                        <div 
                          className="w-full bg-[#FF8FAB]/20 rounded-t-lg transition-all group-hover:bg-[#FF8FAB]/40" 
                          style={{ height: `${(mes.ingresos / maxVal) * 100}%` }} 
                          title={`Ingresos: ${formatCurrencyCLP(mes.ingresos)}`}
                        />
                        {/* Barra Egresos */}
                        <div 
                          className="w-full bg-[#1A1A2E] rounded-t-lg transition-all group-hover:scale-105 shadow-lg" 
                          style={{ height: `${(mes.egresos / maxVal) * 100}%` }} 
                          title={`Egresos: ${formatCurrencyCLP(mes.egresos)}`}
                        />
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase mt-2">{mes.mes}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex gap-6 justify-center">
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400"><div className="w-3 h-3 bg-[#FF8FAB]/30 rounded-sm"></div> Ingresos</div>
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400"><div className="w-3 h-3 bg-[#1A1A2E] rounded-sm"></div> Egresos</div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function MetricCard({ title, amount, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:border-[#FF8FAB]/30 transition-all">
      <div className="mb-4">{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-[#1A1A2E] mt-1">{formatCurrencyCLP(amount)}</p>
    </div>
  )
}