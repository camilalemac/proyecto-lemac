"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Download, Search, Loader2, FilePlus, 
  Calendar, AlertCircle, ArrowLeft, Home 
} from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { reporteService } from "../../../../../services/reporteService"
import { IReporteDocumento } from "../../../../../types/admin.types"

export default function ReportesCealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reportes, setReportes] = useState<IReporteDocumento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { router.push("/login"); return; }

        // 1. Obtener documentos desde el Microservicio de Reportes
        const data = await reporteService.getReportes()
        
        // 2. Ordenar por fecha (Más recientes primero)
        const sortedDocs = data.sort((a: any, b: any) => 
          new Date(b.FECHA_DE_CREACION || b.createdAt).getTime() - 
          new Date(a.FECHA_DE_CREACION || a.createdAt).getTime()
        )
        
        setReportes(sortedDocs)
      } catch (err: any) {
        console.error("Error cargando repositorio:", err)
        setErrorMsg(err.message || "Error al conectar con el servidor de archivos.")
      } finally {
        setLoading(false)
      }
    }
    loadDocuments()
  }, [router])

  // Filtro dinámico en memoria
  const reportesFiltrados = reportes.filter((doc) => 
    doc.TITULO.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.TIPO_DOCUMENTO.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 italic">
        Abriendo Archivador Digital CEAL...
      </p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      <nav className="flex items-center gap-4">
        <Link href="/dashboard/alumno/ceal-presidente" className="text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Home size={14} /> Panel Central
        </Link>
      </nav>

      {/* HEADER */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <FileText size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Reportes & Actas</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Repositorio Oficial de Documentación</p>
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-96">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por título o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-4xl pl-14 pr-6 py-5 font-bold text-[#1A1A2E] text-sm outline-none focus:ring-2 focus:ring-pink-200 transition-all placeholder:text-slate-300"
          />
        </div>
      </header>

      {/* LISTADO DE DOCUMENTOS */}
      <section className="bg-white rounded-[4rem] shadow-sm border border-pink-50 overflow-hidden min-h-100">
        <div className="p-10">
          {errorMsg ? (
            <div className="flex flex-col items-center justify-center py-20 text-rose-500">
               <AlertCircle size={60} className="mb-4 opacity-40" />
               <p className="font-black uppercase tracking-widest text-xs text-center">{errorMsg}</p>
            </div>
          ) : reportesFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reportesFiltrados.map((doc, i) => (
                <div key={i} className="group bg-slate-50/50 p-8 rounded-[3rem] border border-transparent hover:border-pink-200 transition-all flex flex-col justify-between hover:bg-white hover:shadow-xl">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-white rounded-2xl shadow-sm text-purple-500">
                        <FileText size={24} />
                      </div>
                      <span className="bg-[#1A1A2E] text-[#FF8FAB] px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                        {doc.TIPO_DOCUMENTO}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight mb-2 group-hover:text-purple-600 transition-colors italic leading-tight">
                      {doc.TITULO}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6 uppercase tracking-tight">
                      {doc.DESCRIPCION || "Documento oficial verificado por la directiva."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase">
                        {new Date(doc.FECHA_DE_CREACION || "").toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <a 
                      href={doc.URL_ARCHIVO} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-lg active:scale-95"
                    >
                      <Download size={14} /> Descargar PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center opacity-20">
              <FilePlus size={80} className="text-[#1A1A2E] mb-6" />
              <p className="font-black uppercase tracking-widest text-lg">No hay documentos disponibles</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}