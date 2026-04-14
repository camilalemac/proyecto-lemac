"use client"
import { useState, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { 
  Download, 
  ChevronLeft, 
  Settings, 
  PlusCircle, 
  LayoutDashboard, 
  RefreshCcw,
  Database,
  ShieldCheck
} from "lucide-react"

// Importaciones de componentes Lemac actualizados
import StatsGrid from "./components/StatsGrid";
import ExpenseChart from "./components/ExpenseChart";
import ActivityList from "./components/ActivityList";
import RegistroMovimientoModal from "./components/RegistroMovimientoModal";
import ReportPreview from "./components/ReportPreview";
import CuentaBancariaManager from "./components/CuentaBancariaManager";

interface Cuenta {
  CUENTA_ID: number;
  NOMBRE_CUENTA: string;
  SALDO_ACTUAL: number;
  BANCO: string;
  ACTIVO: string;
}

export default function TesoreroPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "report" | "bank">("dashboard")
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [data, setData] = useState({ 
    cuenta: null as Cuenta | null, 
    categorias: [] as any[], 
    cobros: [] as any[], 
    movimientos: [] as any[], 
    loading: true 
  })

  const API_PAGOS = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3002/api/v1/pagos"

  // useCallback para poder pasar la función de refresco a los hijos de forma estable
  const fetchData = useCallback(async () => {
    const token = Cookies.get("auth-token")
    if (!token) return;

    setData(prev => ({ ...prev, loading: true }))

    try {
      // 1. Obtener la cuenta bancaria del curso
      const resCuenta = await fetch(`${API_PAGOS}/cuentas-bancarias/mi-cuenta`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      const dCuenta = await resCuenta.json()
      const cuentaId = dCuenta.data?.CUENTA_ID

      // 2. Cargar datos dependientes (Categorías, Cobros y Movimientos de la cuenta)
      const [resCats, resCobros, resMovs] = await Promise.all([
        fetch(`${API_PAGOS}/categorias`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${API_PAGOS}/cuentas-cobrar/resumen-mis-cobros`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        cuentaId 
          ? fetch(`${API_PAGOS}/movimientos-caja/cuenta/${cuentaId}`, { 
              headers: { Authorization: `Bearer ${token}` } 
            }) 
          : Promise.resolve({ json: () => ({ data: [] }) })
      ])

      const [dCats, dCobros, dMovs] = await Promise.all([
        resCats.json(), 
        resCobros.json(),
        resMovs.json()
      ])

      setData({ 
        cuenta: dCuenta.data, 
        categorias: dCats.data || [], 
        cobros: dCobros.data?.cobros || [], 
        movimientos: dMovs.data || [],
        loading: false 
      })
    } catch (e) { 
      console.error("Error crítico de sincronización con Oracle DB:", e)
      setData(prev => ({ ...prev, loading: false })) 
    }
  }, [API_PAGOS]);

  useEffect(() => { fetchData() }, [fetchData])

  // --- VISTAS ALTERNATIVAS ---

  if (data.loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#FF8FAB]/20 blur-3xl rounded-full animate-pulse" />
        <RefreshCcw size={64} className="text-[#FF8FAB] animate-spin relative z-10" />
        <Database size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0F172A] z-20" />
      </div>
      <div className="text-center space-y-3">
        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-[0.5em] italic">Sincronizando Lemac v3.0</h2>
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-green-500" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo Seguro Oracle Cloud Infrastructure</p>
        </div>
      </div>
    </div>
  )

  if (activeView === "report") return (
    <div className="p-10 bg-slate-50 min-h-screen space-y-10">
      <button 
        onClick={() => setActiveView("dashboard")} 
        className="group flex items-center gap-4 text-[10px] font-black uppercase text-slate-500 hover:text-[#0F172A] bg-white px-10 py-5 rounded-4xl shadow-sm transition-all border border-slate-100"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver al Centro de Control
      </button>
      <ReportPreview data={data} period="Balance Anual 2026" />
    </div>
  )

  if (activeView === "bank") return (
    <div className="p-10 bg-slate-50 min-h-screen space-y-10">
      <button 
        onClick={() => setActiveView("dashboard")} 
        className="group flex items-center gap-4 text-[10px] font-black uppercase text-slate-500 hover:text-[#0F172A] bg-white px-10 py-5 rounded-4xl shadow-sm transition-all border border-slate-100"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver al Centro de Control
      </button>
      <CuentaBancariaManager cuenta={data.cuenta} onUpdate={fetchData} />
    </div>
  )

  // --- DASHBOARD PRINCIPAL ---

  return (
    <div className="max-w-400 mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-4">
      
      {/* Header Corporativo */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-white p-12 rounded-[4rem] border border-slate-50 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#FDF2F5] p-3 rounded-2xl">
              <LayoutDashboard className="text-[#FF8FAB]" size={28} />
            </div>
            <h1 className="text-5xl font-black text-[#0F172A] uppercase tracking-tighter italic">
              Tesorería <span className="text-[#FF8FAB]">Lemac</span>
            </h1>
          </div>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF8FAB] rounded-full" />
            Control Financiero Académico • {data.cuenta?.NOMBRE_CUENTA || "Configuración Pendiente"}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto relative z-10">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 xl:flex-none bg-[#0F172A] text-white px-10 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-[#1e293b] transition-all shadow-2xl shadow-slate-200 active:scale-95"
          >
            <PlusCircle size={22} className="text-[#FF8FAB]" /> Nuevo Registro
          </button>
          
          <button 
            onClick={() => setActiveView("bank")} 
            className="p-6 bg-slate-50 text-slate-400 rounded-4xl hover:text-[#0F172A] border border-slate-100 transition-all hover:bg-white hover:shadow-md active:rotate-12"
            title="Configuración de Cuenta"
          >
            <Settings size={24} />
          </button>
          
          <button 
            onClick={() => setActiveView("report")} 
            className="p-6 bg-[#FDF2F5] text-[#FF8FAB] rounded-4xl hover:bg-[#FF8FAB] hover:text-white transition-all shadow-sm active:scale-90"
            title="Generar Reporte PDF"
          >
            <Download size={24} />
          </button>
        </div>
      </header>

      {/* Grid de Estadísticas Reales */}
      <StatsGrid cuenta={data.cuenta} cobros={data.cobros} />

      {/* Sección Gráfica y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          {/* IMPORTANTE: Ahora pasamos data.movimientos para que el gráfico sea real */}
          <ExpenseChart categorias={data.categorias} movimientos={data.movimientos} />
        </div>
        <div className="lg:col-span-5">
          <ActivityList movimientos={data.movimientos} />
        </div>
      </div>

      {/* Modal de Registro */}
      <RegistroMovimientoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        categorias={data.categorias} 
      />

      {/* Footer de Estado de Sistema */}
      <footer className="pt-10 flex justify-center pb-12">
        <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-full border border-slate-100 shadow-sm transition-all hover:border-[#FF8FAB]/30">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute inset-0" />
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full relative" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Oracle Cloud OCI Core <span className="text-slate-200 mx-2">|</span> Status: <span className="text-[#0F172A]">Sincronizado</span>
          </p>
        </div>
      </footer>
    </div>
  )
}