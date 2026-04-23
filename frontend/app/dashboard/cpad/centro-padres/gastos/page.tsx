"use client"
import React, { useState, useEffect } from "react"
import { PieChart as ChartIcon, Loader2, TrendingDown, Filter, AlertCircle, ArrowLeft } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import Link from "next/link"

// ARQUITECTURA LIMPIA (Sube 6 niveles: gastos -> centro-padres -> cpad -> dashboard -> app -> raíz)
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function AnalisisGastosPage() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [gastos, setGastos] = useState<any[]>([])
  const [totalEgresos, setTotalEgresos] = useState(0)

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        // 1. Obtener la identidad del usuario para sacar su colegio_id
        const perfil = await authService.getMe()
        const colId = perfil.colegioId || perfil.COLEGIO_ID || 1

        // 2. Obtener los movimientos de ese colegio usando el servicio
        const data = await pagosService.getMovimientosPorColegio(colId)

        // 3. Filtrar solo los Egresos (Gastos)
        const egresos = data.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO')
        
        // 4. Calcular el Total
        const total = egresos.reduce((acc: number, m: any) => acc + Number(m.MONTO), 0)
        setTotalEgresos(total)

        // 5. Agrupar por Categoría
        const catMap: { [key: string]: number } = {}
        egresos.forEach((m: any) => {
          const label = m.CATEGORIA_NOMBRE || `Categoría ${m.CATEGORIA_ID || 'General'}`
          catMap[label] = (catMap[label] || 0) + Number(m.MONTO)
        })

        // 6. Formatear para Recharts
        const arrayGastos = Object.keys(catMap).map(k => ({
          name: k,
          value: catMap[k],
          porcentaje: total > 0 ? Math.round((catMap[k] / total) * 100) : 0
        }))

        // Ordenar de mayor a menor gasto
        setGastos(arrayGastos.sort((a, b) => b.value - a.value))

      } catch (e: any) { 
        console.error("Error cargando análisis de gastos:", e)
        setErrorMsg(e.message || "Error al conectar con el servidor.") 
      } finally { 
        setLoading(false) 
      }
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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/cpad/centro-padres" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:border-[#FF8FAB]/50"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Panel
        </Link>
      </div>

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
                 <Tooltip 
                   contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight:'bold'}} 
                   formatter={(val: any) => `$${Number(val).toLocaleString('es-CL')}`}
                 />
               </PieChart>
             </ResponsiveContainer>
           ) : (
             <div className="text-slate-300 text-center"><Filter size={40} className="mx-auto mb-4 opacity-50"/><p className="text-[10px] uppercase font-black tracking-widest">Sin datos para graficar</p></div>
           )}
        </div>

        {/* Detalle de Áreas */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-y-auto h-125 custom-scrollbar">
           <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-widest mb-8 sticky top-0 bg-white pb-4 border-b border-slate-50 z-10">
             Detalle por Área
           </h3>
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