"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Download, Search, Loader2, FilePlus, 
  Calendar, AlertCircle, Trash2, ArrowLeft, ExternalLink 
} from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"

export default function ReportesCealPage() {
  const [loading, setLoading] = useState(true)
  const [reportes, setReportes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }

        // Petición real al microservicio de reportes
        const res = await fetch(`${GATEWAY_URL}/documentos`, { headers })
        
        if (!res.ok) {
           if (res.status === 404) throw new Error("Aún no se han subido reportes oficiales.");
           throw new Error("No se pudo conectar con el repositorio de documentos.");
        }

        const json = await res.json()

        if (json.success && Array.isArray(json.data)) {
          // Ordenamos por fecha de creación (más recientes primero)
          // Usamos (a: any, b: any) para evitar el error que viste en tu imagen
          const docs = json.data.sort((a: any, b: any) => 
            new Date(b.FECHA_DE_CREACION).getTime() - new Date(a.FECHA_DE_CREACION).getTime()
          )
          setReportes(docs)
        }
      } catch (err: any) {
        console.error("Error cargando documentos:", err)
        setErrorMsg(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  // Filtro dinámico por título o tipo de documento
  const reportesFiltrados = reportes.filter((doc: any) => 
    doc.TITULO.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.TIPO_DOCUMENTO.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 italic text-center">
        Abriendo Archivador Digital CEAL...
      </p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER TIPO LEMACPAY */}
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

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative z-10 w-full lg:w-96">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por título o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-4xl pl-14 pr-6 py-5 font-bold text-[#1A1A2E] text-sm outline-none focus:ring-2 focus:ring-pink-200 transition-all shadow-inner placeholder:text-slate-300"
          />
        </div>
      </header>

      {/* LISTADO DE REPORTES REALES */}
      <section className="bg-white rounded-[4rem] shadow-sm border border-pink-50 overflow-hidden min-h-125">
        <div className="p-10">
          {errorMsg ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic">
               <AlertCircle size={60} className="mb-4 opacity-20" />
               <p className="font-black uppercase tracking-widest text-xs">{errorMsg}</p>
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

                    <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight mb-2 group-hover:text-purple-600 transition-colors italic">
                      {doc.TITULO}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6 uppercase tracking-tight">
                      {doc.DESCRIPCION || "Sin descripción adicional registrada."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase">
                        {new Date(doc.FECHA_DE_CREACION).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <a 
                      href={doc.URL_ARCHIVO} 
                      target="_blank" 
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
              <p className="font-black uppercase tracking-widest text-lg">No se encontraron documentos</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}