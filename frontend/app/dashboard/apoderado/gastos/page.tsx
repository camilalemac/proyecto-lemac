"use client"
import React, { useState, useEffect } from "react"
import { PieChart as ChartIcon, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function GastosApoderadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [gastos, setGastos] = useState<any[]>([])
  const [totalEgresos, setTotalEgresos] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          router.push("/login")
          return
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
        
        // Petición real al backend
        const res = await fetch(`${GATEWAY_URL}/pagos/movimientos-caja/cuenta/1`, { headers })
        
        if (!res.ok) {
          if (res.status === 401) {
            Cookies.remove("auth-token");
            router.push("/login?error=expired");
            throw new Error("Sesión expirada.");
          }
          if (res.status === 403) throw new Error("No tienes permisos para ver el detalle de movimientos de caja.");
          if (res.status === 404) throw new Error("No hay registros de inversión para este periodo.");
          throw new Error(`Error del servidor (${res.status})`);
        }

        const json = await res.json()
        
        if (json.success && Array.isArray(json.data)) {
          const egresos = json.data.filter((m:any) => m.TIPO_MOVIMIENTO === 'EGRESO')
          const total = egresos.reduce((acc:number, m:any) => acc + Number(m.MONTO), 0)
          setTotalEgresos(total)

          const catMap: any = {}
          egresos.forEach((m:any) => {
            let label = m.CATEGORIA_NOMBRE || `Categoría ${m.CATEGORIA_ID}`
            catMap[label] = (catMap[label] || 0) + Number(m.MONTO)
          })

          const arrayGastos = Object.keys(catMap).map(k => ({
            name: k,
            value: catMap[k],
            porcentaje: total > 0 ? Math.round((catMap[k] / total) * 100) : 0
          }))

          setGastos(arrayGastos.sort((a,b) => b.value - a.value))
        }

      } catch (e: any) { 
        console.error("Error cargando gastos:", e) 
        setErrorMsg(e.message)
      } finally { 
        setLoading(false) 
      }
    }
    fetchGastos()
  }, [router])

  const COLORS = ["#FF8FAB", "#1A1A2E", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"]

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A2E]/40">Consultando Oracle...</p>
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
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Inversión institucional verificada</p>
           </div>
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-rose-50 text-rose-600 p-8 rounded-4xl border border-rose-100 flex items-center gap-4">
          <AlertCircle size={24} />
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1">Acceso restringido</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-10 rounded-4xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-112.5">
             {gastos.length > 0 ? (
               <div className="w-full h-full flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={gastos} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={8}>
                        {gastos.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}} formatter={(val) => `$${Number(val).toLocaleString('es-CL')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Total Reportada</p>
                     <p className="text-3xl font-black text-[#1A1A2E]">${totalEgresos.toLocaleString('es-CL')}</p>
                  </div>
               </div>
             ) : (
               <p className="text-xs font-black uppercase text-slate-300">Sin datos registrados</p>
             )}
          </div>

          <div className="lg:col-span-7 bg-white p-10 rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
             <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-[0.2em] mb-8 flex items-center gap-2">
               <div className="w-1.5 h-4 bg-[#FF8FAB] rounded-full"></div> Desglose por Categoría
             </h3>
             <div className="space-y-4 max-h-100 overflow-y-auto pr-4">
                {gastos.map((g, i) => (
                  <div key={i} className="group bg-slate-50/50 p-5 rounded-4xl border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg" style={{backgroundColor: COLORS[i % COLORS.length]}}>{g.porcentaje}%</div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A2E] uppercase tracking-tight">{g.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Gasto acumulado</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-[#1A1A2E] tracking-tighter">${g.value.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${g.porcentaje}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
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