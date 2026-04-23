"use client"
import React, { useEffect, useState } from "react"
import { 
  FileText, Loader2, Search, Filter, AlertCircle, 
  ArrowLeft, ShieldAlert, Download, ExternalLink, Calendar,
  ClipboardCheck, PieChart // <-- ¡Asegúrate de que estas dos estén aquí!
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"


// ARQUITECTURA LIMPIA (Sube 6 niveles: reportes -> centro-padres -> cpad -> dashboard -> app -> raíz)
import { authService } from "../../../../services/authService"
import { reporteService } from "../../../../services/reporteService"
import { IReporteDocumento } from "../../../../types/admin.types" // Tipado global de documentos

export default function DocumentosCPADPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [documentos, setDocumentos] = useState<IReporteDocumento[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "ACTA" | "REPORTE_FINANCIERO">("TODOS")

  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Validar Identidad
        const perfil = await authService.getMe()
        
        const rolesDelUsuario = perfil.roles || [];
        const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
          const code = rol.rol_code;
          return [
            'CEN_PRES_CAP', 'CEN_TES_CAP', 'CEN_SEC_CAP', 
            'DIR_PRES_APO', 'DIR_TES_APO', 'DIR_SEC_APO'
          ].includes(code);
        });

        if (!esCentroDePadres) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)

        // 2. Traer Documentos del Microservicio
        const dataDocs = await reporteService.getReportes()
        setDocumentos(dataDocs)

      } catch (e: any) {
        console.error("Error al cargar reportes:", e)
        setErrorMsg(e.message || "Error al sincronizar con el repositorio oficial.")
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [router])

  // Filtrado en memoria
  const docsFiltrados = documentos.filter(doc => {
    const matchSearch = doc.TITULO.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        doc.DOCUMENTO_ID.toString() === searchTerm
    const matchTipo = filtroTipo === "TODOS" ? true : doc.TIPO_DOCUMENTO === filtroTipo
    return matchSearch && matchTipo
  }).sort((a, b) => new Date(b.FECHA_DE_CREACION).getTime() - new Date(a.FECHA_DE_CREACION).getTime())

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Archivos...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-500/5 text-center animate-in zoom-in-95 duration-500">
      <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-rose-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-2">Acceso Restringido</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
        No tienes los permisos necesarios para ver el repositorio documental. Esta vista es exclusiva para miembros activos de la directiva CPAD.
      </p>
      <Link href="/dashboard/cpad/centro-padres" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1A2E] bg-slate-50 hover:bg-rose-50 px-6 py-3 rounded-2xl transition-colors border border-slate-100 hover:border-rose-200">
        <ArrowLeft size={16} /> Volver al Panel
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/cpad/centro-padres" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:border-[#FF8FAB]/50"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Panel
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold shadow-sm">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Institucional */}
      <header className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="p-4 bg-[#1A1A2E] rounded-[1.25rem] text-[#FF8FAB] shadow-lg shadow-slate-900/10">
             <FileText size={32} strokeWidth={1.5} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Repositorio Digital</h1>
             <p className="text-slate-400 text-sm font-bold mt-1">Actas de reuniones y balances financieros PDF</p>
           </div>
        </div>
        
        <button 
          onClick={() => alert("Módulo de subida de archivos en construcción (AWS S3)")}
          className="w-full md:w-auto bg-[#1A1A2E] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-lg flex justify-center items-center gap-3"
        >
          <FileText size={16} /> Subir Nuevo Documento
        </button>
      </header>

      {/* Grid de Búsqueda y Filtros */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre de documento o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-[#1A1A2E] focus:outline-none focus:border-[#FF8FAB] transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <Filter className="text-slate-300 mr-2 shrink-0 self-center" size={18} />
            {(['TODOS', 'ACTA', 'REPORTE_FINANCIERO'] as const).map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  filtroTipo === tipo 
                  ? "bg-[#1A1A2E] text-white shadow-md" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tipo.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla Documental */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175">
            <thead className="bg-[#FAF5FF] border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">ID</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento Oficial</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docsFiltrados.length > 0 ? (
                docsFiltrados.map((doc) => (
                  <tr key={doc.DOCUMENTO_ID} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-6 text-xs font-black text-slate-400 group-hover:text-[#FF8FAB] transition-colors">
                      #DOC-{doc.DOCUMENTO_ID}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${doc.TIPO_DOCUMENTO === 'ACTA' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {doc.TIPO_DOCUMENTO === 'ACTA' ? <ClipboardCheck size={20}/> : <PieChart size={20}/>}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0F172A] tracking-tight leading-none mb-1.5">
                            {doc.TITULO}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {doc.DESCRIPCION || "Sin descripción adicional"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(doc.FECHA_DE_CREACION).toLocaleDateString('es-CL')}
                      </div>
                    </td>
                    <td className="p-6 text-right flex justify-end gap-2">
                      <a 
                        href={doc.URL_ARCHIVO} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-500 rounded-xl hover:bg-[#1A1A2E] hover:text-white transition-all shadow-sm"
                        title="Ver Documento"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <a 
                        href={doc.URL_ARCHIVO} 
                        download
                        className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-500 rounded-xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-sm"
                        title="Descargar PDF"
                      >
                        <Download size={16} />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <div className="space-y-4">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                        <FileText size={32} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">No hay documentos</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Sube el primer reporte para visualizarlo aquí.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}