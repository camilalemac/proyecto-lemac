"use client"
import React, { useState, useEffect } from "react"
import { PieChart as ChartIcon, Loader2, Filter, AlertCircle, ArrowLeft } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA (Sube 5 niveles: gastos -> tesorero-cpad -> cpad -> dashboard -> app -> raíz)
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function AnalisisGastosTesoreriaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [gastos, setGastos] = useState<any[]>([])
  const [totalEgresos, setTotalEgresos] = useState(0)

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        
        // 1. Validar Identidad y Permisos
        const perfil = await authService.getMe()
        
        // Roles permitidos: Tesoreros y Presidentes de curso/colegio
        const rolesTesoreria = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU', 'CEN_PRES_CAP', 'DIR_PRES_APO']
        const tienePermiso = perfil.roles?.some((r: any) => rolesTesoreria.includes(r.rol_code))

        if (!tienePermiso) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)
        const colId = perfil.COLEGIO_ID || 1

        // 2. Traer Movimientos Reales desde Oracle
        const movimientosData = await pagosService.getMovimientosPorColegio(colId)
        
        // 3. Filtrar Egresos
        const egresos = movimientosData.filter((m: any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'EGRESO')
        
        const total = egresos.reduce((acc: number, m: any) => acc + Number(m.MONTO || m.monto || 0), 0)
        setTotalEgresos(total)

        // 4. Agrupar Egresos por Categoría
        const catMap: { [key: string]: number } = {}
        egresos.forEach((m: any) => {
          const label = m.CATEGORIA_NOMBRE || m.categoria_nombre || `Categoría ${m.CATEGORIA_ID || m.categoria_id || 'General'}`
          catMap[label] = (catMap[label] || 0) + Number(m.MONTO || m.monto || 0)
        })

        // 5. Formatear Data para Recharts
        const arrayGastos = Object.keys(catMap).map(k => ({
          name: k,
          value: catMap[k],
          porcentaje: total > 0 ? Math.round((catMap[k] / total) * 100) : 0
        }))

        // Ordenar de mayor a menor gasto
        setGastos(arrayGastos.sort((a, b) => b.value - a.value))

      } catch (e: any) {
        console.error("Error al cargar análisis de gastos:", e)
        setErrorMsg(e.message || "Error al sincronizar con el Ledger Oracle.")
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    initData()
  }, [])

  const COLORS = ["#FF8FAB", "#1A1A2E", "#D4C4FB", "#A7E8BD", "#FFB7C5", "#E2E8F0"]

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Procesando Reporte Financiero...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6 text-center">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <AlertCircle size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-10">La lectura de análisis financieros es exclusiva para la Directiva de Tesorería.</p>
        <button onClick={() => router.push('/dashboard/cpad/tesorero-cpad')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all hover:bg-slate-800">
          <ArrowLeft size={16} /> Volver al Panel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/cpad/tesorero-cpad" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:border-[#FF8FAB]/50"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard Tesorería
        </Link>
      </div>

      {/* HEADER INSTITUCIONAL */}
      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
           <div className="bg-[#1A1A2E] p-5 rounded-2xl text-[#FF8FAB] shadow-xl shadow-slate-900/10">
             <ChartIcon size={32} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Análisis de Gastos</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Distribución Presupuestaria Anual</p>
           </div>
        </div>
        
        {totalEgresos > 0 && (
          <div className="bg-[#FDF2F5] px-8 py-5 rounded-4xl border border-pink-100 text-right">
            <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1">Egresos Totales</p>
            <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tighter">${totalEgresos.toLocaleString('es-CL')}</h3>
          </div>
        )}
      </header>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600 shadow-sm animate-in zoom-in-95">
          <AlertCircle size={24} />
          <p className="text-xs font-black uppercase tracking-widest">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICO DE ANILLO */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center h-125 relative overflow-hidden group">
           <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-widest mb-8 self-start z-10">Proporción de Egresos</h3>
           
           {gastos.length > 0 ? (
             <div className="w-full h-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie 
                     data={gastos} 
                     dataKey="value" 
                     innerRadius={90} 
                     outerRadius={140} 
                     paddingAngle={5}
                     animationDuration={1500}
                     animationBegin={200}
                   >
                     {gastos.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                   </Pie>
                   <Tooltip 
                     contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight:'bold'}} 
                     formatter={(val: any) => `$${Number(val).toLocaleString('es-CL')}`} 
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="text-slate-300 text-center flex flex-col items-center z-10">
               <Filter size={60} className="mb-4 opacity-50 stroke-1"/>
               <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#1A1A2E]">Sin datos para graficar</p>
               <p className="text-xs font-medium text-slate-400 mt-2">No hay egresos registrados en el sistema.</p>
             </div>
           )}
        </div>

        {/* DETALLE DE ÁREAS */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-y-auto h-125 no-scrollbar relative">
           <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-widest mb-8 sticky top-0 bg-white/90 backdrop-blur-sm pb-4 border-b border-slate-50 z-10">
             Detalle por Área
           </h3>
           <div className="space-y-6">
              {gastos.length > 0 ? gastos.map((g, i) => (
                <div key={i} className="flex flex-col gap-3 group">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-xl shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{g.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-[#1A1A2E] tracking-tight">${g.value.toLocaleString('es-CL')}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{g.porcentaje}% del total</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${g.porcentaje}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                  </div>
                </div>
              )) : (
                <div className="h-full w-full flex items-center justify-center pt-20">
                  <p className="text-center text-slate-400 text-xs italic font-medium">Bandeja de egresos limpia.</p>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  )
}