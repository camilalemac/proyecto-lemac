"use client"
import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, TrendingDown, Loader2, Calendar, Target, PieChart, AlertCircle, Scale } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

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

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { router.push("/login"); return; }

        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }

        const resMov = await fetch(`${GATEWAY_URL}/pagos/movimientos-caja/cuenta/1`, { headers })
        
        if (!resMov.ok) {
          if (resMov.status === 403) throw new Error("Acceso restringido por permisos de servidor (403).");
          throw new Error("No se pudo conectar con el servicio financiero.");
        }

        const responseJson = await resMov.json()

        if (responseJson.success && Array.isArray(responseJson.data)) {
          const movimientos = responseJson.data
          const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
          
          const statsPorMes = meses.map((nombreMes, index) => {
            const movsMes = movimientos.filter((m: any) => new Date(m.FECHA_MOVIMIENTO).getMonth() === index)
            const inMes = movsMes.filter((m: any) => m.TIPO_MOVIMIENTO === 'INGRESO').reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)
            const outMes = movsMes.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO').reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)
            return { mes: nombreMes, ingresos: inMes, egresos: outMes }
          })

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
        }
      } catch (err: any) {
        console.error("Error en balance:", err)
        setErrorMsg(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 italic">Consolidando Balance Oracle...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <Scale size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Balance Anual</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Estado de Resultados {new Date().getFullYear()}</p>
          </div>
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-white p-16 rounded-[4rem] border-2 border-dashed border-rose-100 flex flex-col items-center text-center gap-4">
          <AlertCircle size={48} className="text-rose-500" />
          <h3 className="text-lg font-black text-[#1A1A2E] uppercase">Error de Sincronización</h3>
          <p className="text-xs font-bold text-slate-400 uppercase">{errorMsg}</p>
        </div>
      ) : (
        <>
          {/* MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group">
              <TrendingUp className="text-emerald-500 mb-4" size={24} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recaudación Real</p>
              <p className="text-3xl font-black text-[#1A1A2E] mt-1">${resumenAnual.ingresos.toLocaleString('es-CL')}</p>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group">
              <TrendingDown className="text-rose-500 mb-4" size={24} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Ejecutada</p>
              <p className="text-3xl font-black text-[#1A1A2E] mt-1">${resumenAnual.egresos.toLocaleString('es-CL')}</p>
            </div>
            <div className="bg-[#FF8FAB] p-8 rounded-[3rem] text-white shadow-xl">
              <Target className="text-white/60 mb-4" size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Mes Pico Actividad</p>
              <p className="text-3xl font-black uppercase mt-1">{resumenAnual.mesMayorGasto}</p>
            </div>
            <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-[#FF8FAB] shadow-2xl">
              <PieChart className="text-[#FF8FAB]/40 mb-4" size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest">Saldo Final</p>
              <p className="text-3xl font-black mt-1 text-white">${resumenAnual.balance.toLocaleString('es-CL')}</p>
            </div>
          </div>

          {/* GRÁFICO BARRAS */}
          <section className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Flujo Mensual Consolidado</h3>
            </div>
            <div className="p-10">
              <div className="flex items-end justify-between h-72 gap-3 md:gap-6 border-b border-slate-100 pb-4">
                {datosMensuales.map((mes, i) => {
                  const maxVal = Math.max(...datosMensuales.map(d => Math.max(d.ingresos, d.egresos, 1)));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group gap-2 h-full">
                      <div className="relative w-full flex flex-col items-center gap-1 h-full justify-end">
                        <div className="w-full bg-[#FF8FAB]/20 rounded-t-xl" style={{ height: `${(mes.ingresos / maxVal) * 100}%` }} />
                        <div className="w-full bg-[#1A1A2E] rounded-t-xl group-hover:bg-[#FF8FAB] transition-all" style={{ height: `${(mes.egresos / maxVal) * 100}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase mt-2">{mes.mes}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}