"use client"
import { useState, useEffect } from "react"
import { ArrowRightLeft, TrendingUp, TrendingDown, Filter, Loader2, Calendar, FileText, AlertCircle, Search } from "lucide-react"
import Cookies from "js-cookie"

export default function IngresosEgresosPage() {
  const [loading, setLoading] = useState(true)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [filtroActivo, setFiltroActivo] = useState("TODOS")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [finanzas, setFinanzas] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0
  })

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }

        // Usamos el endpoint real del microservicio de pagos
        const resMov = await fetch(`${GATEWAY_URL}/pagos/movimientos-caja/cuenta/1`, { headers })
        const responseJson = await resMov.json()

        if (responseJson.success && Array.isArray(responseJson.data)) {
          const sortedMovs = responseJson.data.sort((a: any, b: any) => 
            new Date(b.FECHA_MOVIMIENTO).getTime() - new Date(a.FECHA_MOVIMIENTO).getTime()
          )
          
          setMovimientos(sortedMovs)

          let ingresos = 0
          let egresos = 0
          
          sortedMovs.forEach((mov: any) => {
            if (mov.TIPO_MOVIMIENTO === 'INGRESO') ingresos += Number(mov.MONTO)
            if (mov.TIPO_MOVIMIENTO === 'EGRESO') egresos += Number(mov.MONTO)
          })

          setFinanzas({
            totalIngresos: ingresos,
            totalEgresos: egresos,
            balance: ingresos - egresos
          })
        }
      } catch (err) {
        console.error("Error cargando movimientos:", err)
        setErrorMsg("No se pudo sincronizar con el Ledger Oracle.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const movimientosFiltrados = movimientos.filter(mov => {
    if (filtroActivo === "TODOS") return true
    return mov.TIPO_MOVIMIENTO === filtroActivo
  })

  const totalFlujo = finanzas.totalIngresos + finanzas.totalEgresos;
  const porcentajeIngresos = totalFlujo > 0 ? (finanzas.totalIngresos / totalFlujo) * 100 : 50;

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 italic">Auditando Libro de Caja...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER TIPO LEMACPAY */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <ArrowRightLeft size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Libro de Caja</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Movimientos Institucionales CEAL</p>
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

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-500 text-white p-10 rounded-[3.5rem] shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Ingresos</p>
          <p className="text-5xl font-black mt-4 tracking-tighter">${finanzas.totalIngresos.toLocaleString('es-CL')}</p>
          <TrendingUp size={120} className="absolute right-0 bottom-0 -mb-8 -mr-8 opacity-20 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-rose-500 text-white p-10 rounded-[3.5rem] shadow-xl shadow-rose-500/20 relative overflow-hidden group">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Egresos</p>
          <p className="text-5xl font-black mt-4 tracking-tighter">${finanzas.totalEgresos.toLocaleString('es-CL')}</p>
          <TrendingDown size={120} className="absolute right-0 bottom-0 -mb-8 -mr-8 opacity-20 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-[#1A1A2E] text-white p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-widest">Balance Operacional</p>
          <p className="text-5xl font-black mt-4 tracking-tighter text-white">${finanzas.balance.toLocaleString('es-CL')}</p>
          <div className="w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-[#FF8FAB] transition-all duration-1000" style={{ width: `${porcentajeIngresos}%` }} />
          </div>
        </div>
      </div>

      {/* LISTADO DE MOVIMIENTOS */}
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
                      {mov.TIPO_MOVIMIENTO === 'INGRESO' ? '+' : '-'}${Number(mov.MONTO).toLocaleString('es-CL')}
                    </p>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Transacción Verificada</span>
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
    </div>
  )
}