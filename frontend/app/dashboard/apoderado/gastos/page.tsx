"use client"
import React, { useState, useEffect } from "react"
import { PieChart as ChartIcon, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { pagosService } from "../../../../services/pagosService"
import { IGastoGrafico } from "../../../../types/admin.types"
import { formatCurrencyCLP } from "../../../../utils/formatters"

// 🛡️ Definimos la forma exacta del dato para que TypeScript no chille
interface MovimientoCajaData {
  TIPO_MOVIMIENTO?: string;
  MONTO?: string | number;
  CATEGORIA_NOMBRE?: string;
}

export default function GastosApoderadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [gastos, setGastos] = useState<IGastoGrafico[]>([])
  const [totalEgresos, setTotalEgresos] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadGastos = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("auth-token")
        if (!token) {
          router.push("/login")
          return
        }
        
        // 1. Obtener movimientos reales de la cuenta institucional (ID 1 por defecto)
        const rawData = await pagosService.getMovimientosByCuenta(1)
        
        // 🛡️ Le decimos a TypeScript que la data es un arreglo de MovimientoCajaData
        const data = rawData as MovimientoCajaData[];
        
        // 2. Al hacer esto, ya no necesitas poner ': any' en la 'm'. ¡El linter estará feliz!
        const egresos = data.filter(m => m.TIPO_MOVIMIENTO === 'EGRESO')
        const total = egresos.reduce((acc, m) => acc + Number(m.MONTO), 0)
        setTotalEgresos(total)

        // 3. Agrupar por categoría para el gráfico
        const catMap: Record<string, number> = {}
        egresos.forEach(m => {
          const label = m.CATEGORIA_NOMBRE || `Otros Egresos`
          catMap[label] = (catMap[label] || 0) + Number(m.MONTO)
        })

        const arrayGastos = Object.keys(catMap).map(k => ({
          name: k,
          value: catMap[k],
          porcentaje: total > 0 ? Math.round((catMap[k] / total) * 100) : 0
        }))

        setGastos(arrayGastos.sort((a, b) => b.value - a.value))

      } catch (error: unknown) {
        console.warn("Acceso denegado o sin datos de curso:", error);
        // En lugar de "explotar", guardamos un mensaje para mostrarlo en la interfaz
        setErrorMsg("No tienes permisos suficientes o tu alumno no tiene un curso asignado para ver estos reportes.");
      } finally {
        setLoading(false);
      }
    };
    loadGastos();
  }, [router]);

  const COLORS = ["#FF8FAB", "#1A1A2E", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"]

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A2E]/40">Generando Reporte de Transparencia...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8 space-y-8 animate-in fade-in duration-700">
      
      <Link href="/dashboard/apoderado" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Portal
      </Link>

      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-[#1A1A2E] rounded-3xl text-[#FF8FAB] shadow-xl"><ChartIcon size={28} /></div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Transparencia Financiera</h1>
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Uso de Fondos y Recursos Institucionales</p>
           </div>
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-rose-50 text-rose-600 p-8 rounded-4xl border border-rose-100 flex items-center gap-4 shadow-sm">
          <AlertCircle size={24} />
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1">Visualización Protegida</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* GRÁFICO CIRCULAR */}
          <div className="lg:col-span-5 bg-white p-10 rounded-4xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-112.5">
             {gastos.length > 0 ? (
               <div className="w-full h-full flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={gastos} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={8}>
                        {gastos.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}} 
                        formatter={(val) => formatCurrencyCLP(Number(val))} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Total Acumulada</p>
                     <p className="text-3xl font-black text-[#1A1A2E]">{formatCurrencyCLP(totalEgresos)}</p>
                  </div>
               </div>
             ) : (
               <div className="text-center opacity-30">
                  <ChartIcon size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase">Sin datos para mostrar</p>
               </div>
             )}
          </div>

          {/* LISTADO DETALLADO */}
          <div className="lg:col-span-7 bg-white p-10 rounded-4xl border border-slate-100 shadow-sm">
             <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-[0.2em] mb-8 flex items-center gap-2">
               <div className="w-1.5 h-4 bg-[#FF8FAB] rounded-full"></div> Inversión por Categoría
             </h3>
             <div className="space-y-4 max-h-100 overflow-y-auto pr-4 no-scrollbar">
                {gastos.map((g, i) => (
                  <div key={i} className="group bg-slate-50/50 p-5 rounded-4xl border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg" style={{backgroundColor: COLORS[i % COLORS.length]}}>
                          {g.porcentaje}%
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A2E] uppercase tracking-tight">{g.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Monto Ejecutado</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-[#1A1A2E] tracking-tighter">{formatCurrencyCLP(g.value)}</p>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ width: `${g.porcentaje}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  )
}