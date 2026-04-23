"use client"
import { useState, useEffect } from "react"
import { 
  FileSpreadsheet, Loader2, Save, FileDown, 
  History, CheckCircle2, BookmarkCheck, Calendar, ShieldAlert, ArrowLeft 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { reporteService } from "../../../../../services/reporteService"

export default function TesoreroReportesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [user, setUser] = useState<any>(null)
  const [reportes, setReportes] = useState<any[]>([])
  
  const [nuevoReporte, setNuevoReporte] = useState({
    tipo: "REPORTE_FINANCIERO_MENSUAL",
    titulo: "",
    descripcion: ""
  })
  const [enviando, setEnviando] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 1. Validar Identidad y Rol
      const perfil = await authService.getMe()
      const rolesPermitidos = ['DIR_TES_ALU', 'CEN_TES_CAL']
      const esTesorero = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

      if (!esTesorero) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      
      const colegioId = perfil.COLEGIO_ID || 1
      const cursoId = (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1
      setUser({ colegioId, cursoId })
      
      // 2. Obtener Historial de Reportes y filtrar por Curso y Tipo
      const docs = await reporteService.getHistorialReportes()
      
      const docsFinancieros = docs.filter((doc: any) => {
        const tipo = (doc.TIPO_DOCUMENTO || doc.tipo_documento || "").toUpperCase()
        const idCursoDoc = Number(doc.CURSO_ID || doc.curso_id)
        
        return (tipo.includes('REPORTE') || tipo.includes('BALANCE')) && idCursoDoc === Number(cursoId)
      })
      
      setReportes(docsFinancieros)

    } catch (e) {
      console.error("Error al cargar reportes financieros:", e)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerarReporte = async () => {
    if (!user || !user.colegioId) {
        alert("Error de conexión: No se pudo identificar tu curso.")
        return
    }

    if (!nuevoReporte.titulo || !nuevoReporte.descripcion) {
      alert("Debes asignar un título y una descripción al reporte.")
      return
    }

    setEnviando(true)
    try {
      const payload = {
        titulo: nuevoReporte.titulo,
        periodo: new Date().getFullYear().toString(),
        tipo: nuevoReporte.tipo,
        cursoId: user.cursoId,
        descripcion: nuevoReporte.descripcion,
        // Como es un simulador de generación, enviamos totales en 0 para que el backend los procese
        ingresos: 0,
        egresos: 0,
        saldoFinal: 0
      }

      // Llamada segura al MS_REPORTES
      await reporteService.createActa(payload)

      alert("Reporte financiero generado y guardado oficialmente.")
      setNuevoReporte({ tipo: "REPORTE_FINANCIERO_MENSUAL", titulo: "", descripcion: "" })
      
      // Recargar tabla silenciosamente
      await loadData()
    } catch (error) {
      console.error(error)
      alert("Hubo un error al generar el documento en Oracle DB.")
    } finally {
      setEnviando(false)
    }
  }

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-sky-500" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verificando Archivo Contable...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#F8FAFC]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">La emisión de reportes financieros es exclusiva para el Tesorero del Curso.</p>
        <button onClick={() => router.push('/dashboard/alumno/curso-alumno')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link href="/dashboard/alumno/curso-alumno/tesorero" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard de Finanzas
        </Link>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-8 z-10">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-sky-400 shadow-2xl rotate-3">
            <FileSpreadsheet size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight leading-none uppercase italic">
              Emisión de Reportes
            </h1>
            <p className="text-[12px] text-sky-500 font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <BookmarkCheck size={16} /> Consolidación Financiera de Curso
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE GENERACIÓN */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 h-full flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
               <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
                 <Calendar size={24} />
               </div>
               <div>
                 <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Generar Nuevo Documento</h2>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tipo de Reporte</label>
              <select 
                value={nuevoReporte.tipo}
                onChange={(e) => setNuevoReporte({...nuevoReporte, tipo: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer"
              >
                <option value="REPORTE_FINANCIERO_MENSUAL">Reporte Mensual</option>
                <option value="REPORTE_TRIMESTRAL">Balance Trimestral</option>
                <option value="BALANCE_ANUAL">Estado Financiero Anual</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Título del Documento</label>
              <input 
                type="text" 
                value={nuevoReporte.titulo}
                placeholder="Ej: Reporte Financiero Marzo 2026"
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-300"
                onChange={(e) => setNuevoReporte({...nuevoReporte, titulo: e.target.value})}
              />
            </div>

            <div className="space-y-3 flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Notas / Conclusiones del Período</label>
              <textarea 
                rows={4}
                value={nuevoReporte.descripcion}
                placeholder="Ingresa un resumen de los gastos o ingresos destacados..."
                className="w-full h-full min-h-30 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 text-sm font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all leading-relaxed placeholder:text-slate-300"
                onChange={(e) => setNuevoReporte({...nuevoReporte, descripcion: e.target.value})}
              />
            </div>

            <button 
              onClick={handleGenerarReporte}
              disabled={enviando}
              className="w-full bg-[#1A1A2E] text-white py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl mt-4"
            >
              {enviando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {enviando ? 'Sincronizando Ledger...' : 'Procesar y Guardar Reporte'}
            </button>
          </section>
        </div>

        {/* HISTORIAL DE REPORTES */}
        <aside className="lg:col-span-5 flex flex-col">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex-1 relative overflow-hidden flex flex-col">
            <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
              <History size={18} className="text-sky-500" /> Archivo Financiero
            </h3>
            
            <div className="space-y-4 relative z-10 flex-1 overflow-y-auto no-scrollbar max-h-125">
              {reportes.length > 0 ? (
                reportes.map((item: any, i) => (
                  <a 
                    key={item.DOCUMENTO_ID || item.documento_id || i} 
                    href={item.URL_ARCHIVO || item.url_archivo || "#"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-[#1A1A2E] transition-all border border-slate-100"
                  >
                    <div className="flex items-center gap-4 truncate">
                      <div className="p-3 bg-white rounded-2xl group-hover:bg-white/10 shadow-sm transition-colors">
                        <FileDown size={16} className="text-[#1A1A2E] group-hover:text-sky-400" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-black text-slate-700 group-hover:text-white truncate block tracking-tight transition-colors">
                          {item.TITULO || item.titulo}
                        </span>
                        <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest mt-1 block">
                          {(item.TIPO_DOCUMENTO || item.tipo_documento).replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-20 opacity-30 flex flex-col items-center justify-center h-full">
                  <FileSpreadsheet size={64} className="mb-4 text-slate-400" />
                  <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest italic max-w-37.5">Sin reportes financieros este año.</p>
                </div>
              )}
            </div>
            <CheckCircle2 size={180} className="absolute -bottom-16 -right-16 text-slate-50 rotate-12 z-0" />
          </div>
        </aside>
      </div>
    </div>
  )
}