"use client"

import React, { useState, useEffect } from "react"
import { 
  PieChart, FileText, Download, ShieldCheck, 
  RefreshCw, TrendingUp, CreditCard, Bookmark, 
  AlertCircle, Home, Receipt, PieChart as ChartIcon, 
  History, LogOut, User as UserIcon
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

function StatCard({ title, value, icon: Icon, colorClass, delay }: any) {
  return (
    <div className={`bg-white/80 backdrop-blur-md p-7 rounded-[2.5rem] border border-rose-100/50 shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${delay}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClass.bg} ${colorClass.text}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value || "$0"}</p>
    </div>
  )
}

export default function CentroPadresPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Datos del usuario 
  const userName = "" 

  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  const fetchCpadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = Cookies.get("auth-token")
      const response = await fetch('http://localhost:3001/api/v1/finanzas/cpad/resumen', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error(`Error de servidor (${response.status})`);
      const result = await response.json()
      if (result.success) setData(result.data);
      else throw new Error(result.message || "Error al cargar datos.");
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCpadData()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1c2e]">
      <div className="h-16 w-16 rounded-full border-t-4 border-rose-400 animate-spin"></div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#fffafa] text-slate-900">
      
      {/* SIDEBAR AZUL MARINO (Igual a tu captura) */}
      <aside className="w-64 bg-[#1a1c2e] text-white flex flex-col fixed h-full z-50">
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            Lemac <span className="text-rose-400">Pay</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Apoderado Titular</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <p className="text-[9px] font-black text-slate-500 uppercase px-4 mb-4 tracking-[0.2em]">Menú Principal</p>
          
          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-white/5 transition-all group">
            <Home size={18} /> <span className="text-sm font-bold">Inicio</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-white/5 transition-all">
            <Receipt size={18} /> <span className="text-sm font-bold">Mis Cuotas</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <ChartIcon size={18} /> <span className="text-sm font-bold">Gastos</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-white/5 transition-all">
            <History size={18} /> <span className="text-sm font-bold">Historial</span>
          </button>
        </nav>

        {/* CERRAR SESIÓN */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="h-8 w-8 rounded-full bg-rose-400 flex items-center justify-center text-[#1a1c2e] font-black text-xs">
              {userName.charAt(0)}
            </div>
            <p className="text-xs font-bold truncate">{userName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-12">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER */}
          <header className="mb-12 flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="bg-rose-500 p-4 rounded-3xl shadow-lg shadow-rose-200">
                <ShieldCheck className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#1a1c2e]">Centro de Padres</h1>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Gestión Transparente • {userName}</p>
              </div>
            </div>

            <button 
              onClick={fetchCpadData}
              className="bg-[#1a1c2e] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Actualizar Datos
            </button>
          </header>

          {error && (
            <div className="mb-8 bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex items-center gap-5 text-rose-500 animate-bounce">
              <AlertCircle size={20} />
              <p className="text-xs font-bold uppercase tracking-widest flex-1">Error: {error}</p>
              <button onClick={fetchCpadData} className="underline text-xs font-black">Reintentar</button>
            </div>
          )}

          {/* MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <StatCard 
              title="Recaudación" 
              value={`$${data?.recaudacionTotal?.toLocaleString('es-CL')}`} 
              icon={TrendingUp} 
              colorClass={{bg: "bg-rose-50", text: "text-rose-500"}}
              delay="delay-0"
            />
            <StatCard 
              title="Cuotas al día" 
              value={data?.cuotasPagadas} 
              icon={CreditCard} 
              colorClass={{bg: "bg-indigo-50", text: "text-indigo-500"}}
              delay="delay-75"
            />
            <StatCard 
              title="Pendientes" 
              value={`$${data?.porCobrar?.toLocaleString('es-CL')}`} 
              icon={Bookmark} 
              colorClass={{bg: "bg-slate-50", text: "text-slate-400"}}
              delay="delay-150"
            />
            <StatCard 
              title="Caja Actual" 
              value={`$${(data?.recaudacionTotal - (data?.totalEgresos || 0))?.toLocaleString('es-CL')}`} 
              icon={ShieldCheck} 
              colorClass={{bg: "bg-[#1a1c2e]", text: "text-white"}}
              delay="delay-200"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* GRÁFICO */}
            <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-rose-100/50 shadow-sm">
              <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.3em] mb-12 flex items-center gap-3">
                <span className="h-1 w-6 bg-rose-400 rounded-full"></span> Distribución de Gastos
              </h3>
              
              <div className="space-y-10">
                {data?.categorias?.map((cat: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.nombre}</p>
                      <span className="text-xs font-black text-rose-500">{cat.porcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-rose-400 h-full rounded-full" style={{ width: `${cat.porcentaje}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DOCUMENTOS */}
            <div className="bg-[#1a1c2e] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col">
              <h3 className="font-black text-rose-300 mb-10 flex items-center gap-3 uppercase text-[10px] tracking-widest relative z-10">
                <FileText size={16} /> Documentos
              </h3>
              
              <div className="space-y-4 relative z-10 flex-1">
                {data?.reportes?.map((rep: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 hover:bg-rose-400/20 rounded-3xl border border-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl"><Download size={14} /></div>
                      <div>
                        <p className="text-[11px] font-bold text-white">{rep.nombre}</p>
                        <p className="text-[9px] font-black text-rose-300/40 uppercase mt-1">{rep.fecha}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}