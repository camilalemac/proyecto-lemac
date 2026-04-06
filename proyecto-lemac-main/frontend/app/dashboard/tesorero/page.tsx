"use client"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { Download, ChevronLeft, Settings, Wallet, PieChart, Landmark, Loader2 } from "lucide-react"

// Importación de subcomponentes específicos del proyecto
import StatsGrid from "./components/StatsGrid"
import ExpenseChart from "./components/ExpenseChart"
import ActivityList from "./components/ActivityList"
import RegistroMovimientoModal from "./components/RegistroMovimientoModal"
import ReportPreview from "./components/ReportPreview"
import CuentaBancariaManager from "./components/CuentaBancariaManager"

export default function TesoreroPage() {
  // Manejo de Vistas y Modales
  const [activeView, setActiveView] = useState<"dashboard" | "report" | "bank">("dashboard")
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado centralizado de datos reales
  const [data, setData] = useState({ 
    cuenta: null, 
    categorias: [], 
    cobros: [], 
    loading: true 
  })

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("auth-token")
      try {
        // Consultas paralelas a ms-pagos (Puerto 3002)
        const [resCuenta, resCats, resCobros] = await Promise.all([
          fetch("http://127.0.0.1:3002/api/v1/pagos/cuentas-bancarias/mi-cuenta", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch("http://127.0.0.1:3002/api/v1/pagos/categorias", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch("http://127.0.0.1:3002/api/v1/pagos/cuentas-cobrar/resumen-mis-cobros", { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ])

        const [dCuenta, dCats, dCobros] = await Promise.all([
          resCuenta.json(), 
          resCats.json(), 
          resCobros.json()
        ])

        // Actualización con datos provenientes de la DB Oracle
        setData({ 
          cuenta: dCuenta.data, 
          categorias: dCats.data || [], 
          cobros: dCobros.data?.cobros || [], 
          loading: false 
        })
      } catch (e) { 
        console.error("Error de conexión con microservicios Lemac:", e)
        setData(prev => ({ ...prev, loading: false })) 
      }
    }
    fetchData()
  }, [])

  // Estado de Carga Institucional
  if (data.loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-[#FF8FAB] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#0F172A] rounded-full"></div>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
        Sincronizando con Servidor Oracle
      </p>
    </div>
  )

  // --- NAVEGACIÓN CONDICIONAL ---

  if (activeView === "report") {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={() => setActiveView("dashboard")}
          className="group flex items-center gap-3 text-[10px] font-black uppercase text-[#0F172A] bg-white px-8 py-5 rounded-4xl shadow-sm border border-slate-100 hover:bg-[#0F172A] hover:text-white transition-all"
        >
          <ChevronLeft size={18} className="text-[#FF8FAB] group-hover:text-white" /> Volver al inicio
        </button>
        <div className="bg-white rounded-[4rem] p-4 shadow-2xl border border-slate-50">
          <ReportPreview data={data} period="Reporte Financiero Lemac" />
        </div>
      </div>
    )
  }

  if (activeView === "bank") {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={() => setActiveView("dashboard")}
          className="group flex items-center gap-3 text-[10px] font-black uppercase text-[#0F172A] bg-white px-8 py-5 rounded-4xl shadow-sm border border-slate-100 hover:bg-[#0F172A] hover:text-white transition-all"
        >
          <ChevronLeft size={18} className="text-[#FF8FAB] group-hover:text-white" /> Volver al inicio
        </button>
        <div className="max-w-5xl mx-auto">
          <CuentaBancariaManager cuenta={data.cuenta} />
        </div>
      </div>
    )
  }

  // --- VISTA PRINCIPAL (DASHBOARD) ---
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Principal - Estética Lemac */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-[#0F172A] p-12 rounded-[4rem] text-white shadow-[0_35px_60px_-15px_rgba(15,23,42,0.3)] relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF8FAB] p-3 rounded-2xl rotate-3">
               <Wallet className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Tesorería</h1>
          </div>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em] ml-1">
            Panel de Control Financiero
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-white/10 p-3 rounded-[2.5rem] backdrop-blur-xl border border-white/10">
          <button 
            onClick={() => setActiveView("bank")}
            className="bg-white text-[#0F172A] p-5 rounded-3xl hover:bg-[#FF8FAB] hover:text-white transition-all shadow-xl active:scale-90"
            title="Cuenta Bancaria"
          >
            <Landmark size={22} />
          </button>

          <div className="h-10 w-px bg-white/20 mx-2"></div>

          <button 
            onClick={() => setActiveView("report")}
            className="bg-[#FF8FAB] text-white px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-pink-500/20 active:scale-95 flex items-center gap-3"
          >
            <Download size={18} /> Reporte
          </button>
        </div>
        
        {/* Orbe decorativo */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FF8FAB] opacity-10 rounded-full blur-[100px]" />
      </header>

      {/* Grid de Totales Reales */}
      <StatsGrid cuenta={data.cuenta} cobros={data.cobros} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Gráfico Analítico */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-[#FDF2F5] p-4 rounded-3xl text-[#FF8FAB]">
                <PieChart size={24} />
              </div>
              <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-tighter">Análisis de Egresos</h3>
            </div>
          </div>
          <ExpenseChart categorias={data.categorias} />
        </div>

        {/* Listado de Últimos Movimientos */}
        <div className="bg-white p-3 rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
          <ActivityList 
            cobros={data.cobros} 
            onOpenModal={() => setIsModalOpen(true)} 
          />
        </div>
      </div>

      {/* Modal para nuevos registros */}
      <RegistroMovimientoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categorias={data.categorias} 
      />
    </div>
  )
}