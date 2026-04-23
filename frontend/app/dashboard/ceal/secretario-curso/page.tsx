"use client"
import { useState, useEffect } from "react"
import { Plus, History, FileText, ChevronLeft, BookOpen, LayoutDashboard, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { reporteService } from "../../../../services/reporteService"
import ActaForm from "./components/ActaForm"
import ListaActas from "./components/ListaActas"

export default function SecretarioPage() {
  const router = useRouter()
  const [view, setView] = useState<"list" | "create">("list")
  const [stats, setStats] = useState({ total: 0 })
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  const colegioNombre = "Liceo Bicentenario Valparaíso"

  useEffect(() => {
    const initializeSecretaria = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        // 1. Validar Perfil y Rol (Centralizado en authService)
        const perfil = await authService.getMe()
        const roles = perfil.roles || []
        
        const esSecretario = roles.some((rol: any) => 
          rol.rol_code === 'CEN_SEC_CAL' || rol.rol_code === 'DIR_SEC_ALU'
        )

        if (!esSecretario) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)

        // 2. Traer Reportes reales para calcular estadísticas
        const documentos = await reporteService.getReportes()
        setStats({ total: documentos.length })

      } catch (err) {
        console.error("Error en inicialización de secretaría:", err)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }
    initializeSecretaria()
  }, [router])

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F8F9FA]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.3em]">Autenticando Secretaría...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FA] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl text-center">
        <ShieldAlert size={40} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-8">
          No tienes permisos de Secretario para gestionar el Libro de Actas.
        </p>
        <button 
          onClick={() => router.push('/dashboard/alumno')} 
          className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FF8FAB] transition-all"
        >
          Volver al Portal
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0F172A] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#FF8FAB]" size={28} />
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Libro de Actas</h1>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            Secretaría de Alumnos • Gestión Institucional
          </p>
        </div>

        <button 
          onClick={() => setView(view === "list" ? "create" : "list")}
          className="relative z-10 bg-white text-[#0F172A] px-8 py-4 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 shadow-lg hover:scale-105 transition-all border-b-4 border-slate-200 active:border-b-0"
        >
          {view === "list" ? (
            <><Plus size={18} className="text-[#FF8FAB]" /> Redactar Acta</>
          ) : (
            <><ChevronLeft size={18} className="text-[#FF8FAB]" /> Ver Historial</>
          )}
        </button>
      </header>

      {view === "list" ? (
        <div className="space-y-10">
          {/* DASHBOARD DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FF8FAB] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <History size={80} className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Registros Digitales</p>
              <h3 className="text-4xl font-black tracking-tighter">{stats.total} Actas</h3>
              <p className="text-[9px] font-bold uppercase mt-1">Almacenadas en Oracle Cloud</p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm md:col-span-2 flex items-center gap-8 relative overflow-hidden">
              <div className="bg-[#FDF2F5] p-6 rounded-4xl text-[#FF8FAB]">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Firma Digital Verificada</h4>
                   <span className="bg-emerald-100 text-emerald-600 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">Seguro</span>
                </div>
                <p className="text-xs font-medium text-slate-400 max-w-md leading-relaxed">
                  Cada acta generada cuenta con un sello de inmutabilidad en el repositorio de reportes para procesos de acreditación.
                </p>
              </div>
            </div>
          </div>

          {/* LISTADO DE DOCUMENTOS */}
          <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-3 uppercase tracking-tight">
                  <LayoutDashboard className="text-[#FF8FAB]" size={20} /> Archivador Reciente
                </h2>
             </div>
             <ListaActas />
          </section>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
           <ActaForm 
             colegio={colegioNombre} 
             onSuccess={() => setView("list")} 
           />
        </div>
      )}
    </div>
  )
}