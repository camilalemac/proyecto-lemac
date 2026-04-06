"use client"
import { useState, useEffect } from "react"
import { Plus, History, FileText, ChevronLeft, BookOpen, LayoutDashboard } from "lucide-react"
import Cookies from "js-cookie"
import ActaForm from "./components/ActaForm"
import ListaActas from "./components/ListaActas"

export default function SecretarioPage() {
  const [view, setView] = useState<"list" | "create">("list")
  const [stats, setStats] = useState({ total: 0 })
  const [loading, setLoading] = useState(true)

  // Datos del colegio (puedes traerlos de tu ms-auth o contexto)
  const colegioNombre = "Liceo Bicentenario Valparaíso"

  // Conexión real al microservicio de académico para las estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("auth-token")
        // Se conecta al puerto 3007 (ms-academico) para obtener el conteo real
        const res = await fetch("http://127.0.0.1:3007/api/v1/academico/actas/stats", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) setStats({ total: data.data.total })
      } catch (err) {
        console.error("Error cargando estadísticas:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-plomo p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER PRINCIPAL - Estilo Lemac */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0F172A] p-10 rounded-[3rem] text-white shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#FF8FAB]" size={28} />
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Libro de Actas</h1>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            Secretaría de Alumnos • {colegioNombre}
          </p>
        </div>

        <button 
          onClick={() => setView(view === "list" ? "create" : "list")}
          className="bg-white text-[#0F172A] px-8 py-4 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 shadow-lg hover:scale-105 transition-all border-b-4 border-slate-200 active:border-b-0"
        >
          {view === "list" ? (
            <><Plus size={18} className="text-[#FF8FAB]" /> Nueva Acta</>
          ) : (
            <><ChevronLeft size={18} className="text-[#FF8FAB]" /> Volver al Listado</>
          )}
        </button>
      </header>

      {view === "list" ? (
        <div className="space-y-10">
          {/* DASHBOARD DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Widget Total Actas (Rosa Pastel) */}
            <div className="bg-[#FF8FAB] p-8 rounded-[3rem] text-white shadow-xl shadow-pink-100 relative overflow-hidden group">
              <History size={80} className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Registros Históricos</p>
              <h3 className="text-4xl font-black tracking-tighter">
                {loading ? "..." : `${stats.total} Actas`}
              </h3>
              <p className="text-[9px] font-bold uppercase mt-1">Sincronizadas con la nube</p>
            </div>

            {/* Widget Informativo Respaldo (Blanco/Azul) */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm md:col-span-2 flex items-center gap-8 relative overflow-hidden">
              <div className="bg-[#FDF2F5] p-6 rounded-4xl text-[#FF8FAB]">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Respaldo Automático</h4>
                   <span className="bg-green-100 text-green-600 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Activo</span>
                </div>
                <p className="text-xs font-medium text-slate-400 max-w-md leading-relaxed">
                  Todos los documentos generados se almacenan automáticamente en el repositorio institucional para cumplimiento de auditoría.
                </p>
              </div>
            </div>
          </div>

          {/* LISTADO DE DOCUMENTOS */}
          <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-3 uppercase tracking-tight">
                  <LayoutDashboard className="text-[#FF8FAB]" size={20} /> Documentos Recientes
                </h2>
             </div>
             <ListaActas />
          </section>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
           {/* SOLUCIÓN AL ERROR: Se pasa el nombre del colegio como prop */}
           <ActaForm 
             colegio={colegioNombre} 
             onSuccess={() => setView("list")} 
           />
        </div>
      )}
    </div>
  )
}