"use client"
import React, { useState, useEffect } from "react"
import { PieChart as ChartIcon, Loader2, TrendingDown, Filter, AlertCircle } from "lucide-react"
import Cookies from "js-cookie"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export default function AnalisisGastosPage() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [gastos, setGastos] = useState<any[]>([])
  const [totalEgresos, setTotalEgresos] = useState(0)

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const token = Cookies.get("auth-token")
        const headers = { 'Authorization': `Bearer ${token}` }
        
        let colId = 1
        try {
          const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
          if (resMe.ok) colId = (await resMe.json()).data?.colegioId || 1
        } catch (e) {}

        const res = await fetch(`http://127.0.0.1:3007/api/v1/pagos/movimientos/colegio/${colId}`, { headers })
        const contentType = res.headers.get("content-type")
        
        if (contentType && contentType.includes("application/json")) {
           const json = await res.json()
           if (json.success) {
              const egresos = (json.data || []).filter((m:any) => m.TIPO_MOVIMIENTO === 'EGRESO')
              
              const total = egresos.reduce((acc:number, m:any) => acc + Number(m.MONTO), 0)
              setTotalEgresos(total)

              // Agrupar por Categoría
              const catMap: any = {}
              egresos.forEach((m:any) => {
                const label = m.CATEGORIA_NOMBRE || `Categoría ${m.CATEGORIA_ID || 'General'}`
                catMap[label] = (catMap[label] || 0) + Number(m.MONTO)
              })

              const arrayGastos = Object.keys(catMap).map(k => ({
                name: k,
                value: catMap[k],
                porcentaje: total > 0 ? Math.round((catMap[k] / total) * 100) : 0
              }))

              setGastos(arrayGastos.sort((a,b) => b.value - a.value)) // Ordenar de mayor a menor gasto
           }
        } else {
           setErrorMsg("Ruta de movimientos no encontrada en backend.")
        }
      } catch (e) { setErrorMsg("Error de conexión.") } finally { setLoading(false) }
    }
    fetchGastos()
  }, [])

  const COLORS = ["#FF8FAB", "#1A1A2E", "#D4C4FB", "#A7E8BD", "#FFB7C5", "#E2E8F0"]

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Procesando Gráficos...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-[#1A1A2E] rounded-3xl text-[#FF8FAB] shadow-xl"><ChartIcon size={28} /></div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Análisis de Gastos</h1>
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Distribución Presupuestaria Anual</p>
           </div>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex items-center gap-4 text-amber-700">
          <AlertCircle size={24} />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Anillo */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center h-125">
           <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-widest mb-8 self-start">Proporción de Egresos</h3>
           {gastos.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={gastos} dataKey="value" innerRadius={90} outerRadius={130} paddingAngle={5}>
                   {gastos.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                 </Pie>
                 <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight:'bold'}} formatter={(val) => `$${Number(val).toLocaleString('es-CL')}`} />
               </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="text-slate-300 text-center"><Filter size={40} className="mx-auto mb-4 opacity-50"/><p className="text-[10px] uppercase font-black tracking-widest">Sin datos para graficar</p></div>
           )}
        </div>

        {/* Detalle de Áreas */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-y-auto max-h-125 custom-scrollbar">
           <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-widest mb-8 sticky top-0 bg-white pb-4 border-b border-slate-50 z-10">Detalle por Área</h3>
           <div className="space-y-6">
              {gastos.length > 0 ? gastos.map((g, i) => (
                <div key={i} className="flex flex-col gap-2 group">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{g.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-[#1A1A2E]">${g.value.toLocaleString('es-CL')}</p>
                       <p className="text-[9px] font-black text-rose-400 uppercase">{g.porcentaje}% del total</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${g.porcentaje}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                  </div>
                </div>
              )) : <p className="text-center text-slate-400 text-xs italic">No hay egresos registrados.</p>}
           </div>
        </div>
      </div>
    </div>
  )
}