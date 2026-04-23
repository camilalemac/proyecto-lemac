"use client"
import React, { useState, useEffect } from "react"
import { 
  FileText, Download, Loader2, Search, 
  Calendar, ShieldCheck, AlertCircle, BarChart3, FilePlus2, ExternalLink, ArrowLeft, ShieldAlert
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { reporteService } from "../../../../../services/reporteService"

export default function ReportesHistorialPage() {
  const router = useRouter()
  const [reportes, setReportes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    const initData = async () => {
      try {
        setAuthLoading(true)
        
        // 1. Validar Identidad (Permitimos a Tesoreros y Secretarios ver esto)
        const perfil = await authService.getMe()
        const rolesPermitidos = [
          'CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU',
          'CEN_SEC_CAP', 'DIR_SEC_APO', 'CEN_SEC_CAL', 'DIR_SEC_ALU',
          'CEN_PRES_CAP', 'DIR_PRES_APO' // Presidentes también suelen poder ver reportes
        ]
        
        const tienePermiso = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

        if (!tienePermiso) {
          setIsAuthorized(false)
          return
        }

        setIsAuthorized(true)

        // 2. Traer reportes desde el servicio
        setLoading(true)
        // Usa la función de tu reporteService que corresponda a esta vista
        const data = await reporteService.getHistorialReportes() 
        setReportes(data)

      } catch (e) {
        console.error("Error al cargar reportes:", e)
        setIsAuthorized(false) // Ante la duda, bloqueamos
      } finally {
        setAuthLoading(false)
        setLoading(false)
      }
    }

    initData()
  }, [])

  const filtrados = reportes.filter(r => 
    (r.TITULO || r.titulo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (r.TIPO_DOCUMENTO || r.tipo_documento || "").toLowerCase().includes(busqueda.toLowerCase())
  )

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-amber-500" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Archivos de Oracle...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center p-6 text-center">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10">La lectura del historial de reportes es exclusiva para la Directiva.</p>
        <button onClick={() => router.push('/dashboard/cpad/tesorero-cpad')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all hover:bg-slate-800">
          <ArrowLeft size={16} /> Volver al Panel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/cpad/tesorero-cpad" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard Tesorería
        </Link>
      </div>

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-amber-400 shadow-xl shadow-slate-900/10">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Archivo de Reportes</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Historial de balances oficiales
            </p>
          </div>
        </div>
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar reporte por título o tipo..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-xs font-bold outline-none focus:ring-4 focus:ring-amber-500/20 transition-all text-[#1A1A2E]" 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-center border-b-4 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2 z-10">
            <BarChart3 size={16} className="text-blue-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Documentos</p>
          </div>
          <h3 className="text-4xl font-black text-[#1A1A2E] tracking-tighter z-10">{reportes.length}</h3>
          <BarChart3 size={100} className="absolute -right-8 -bottom-8 text-blue-50 opacity-50 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-center border-b-4 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2 z-10">
            <Calendar size={16} className="text-emerald-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Año Fiscal</p>
          </div>
          <h3 className="text-4xl font-black text-[#1A1A2E] tracking-tighter z-10">{new Date().getFullYear()}</h3>
          <Calendar size={100} className="absolute -right-8 -bottom-8 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform" />
        </div>
        
        {/* BOTÓN CONECTADO A LA VISTA NUEVO/BALANCE */}
        <Link 
          href="/dashboard/cpad/tesorero-cpad/balance" 
          className="bg-[#1A1A2E] p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between group cursor-pointer hover:bg-amber-500 transition-colors text-white relative overflow-hidden"
        >
          <div className="flex items-center gap-5 z-10">
            <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-black/10 transition-colors"><FilePlus2 size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 group-hover:text-amber-100 uppercase tracking-widest transition-colors">Acción Rápida</p>
              <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mt-1">Emitir Balance</h3>
            </div>
          </div>
          <ExternalLink size={20} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all z-10" />
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtrados.length === 0 ? (
          <div className="col-span-full bg-white rounded-[3.5rem] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-40 text-center min-h-75">
            <AlertCircle size={64} className="mb-6 text-slate-400" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-[#1A1A2E]">Sin Resultados</h3>
            <p className="text-sm font-medium mt-2 max-w-sm text-slate-500 italic">No se encontraron documentos que coincidan con la búsqueda en Oracle DB.</p>
          </div>
        ) : filtrados.map((r, i) => {
          const idUnico = r.DOCUMENTO_ID || r.documento_id || i;
          
          return (
            <div key={idUnico} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group h-full">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-slate-50 text-[#1A1A2E] rounded-2xl group-hover:bg-amber-400 group-hover:text-white transition-colors shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1A1A2E] uppercase leading-tight group-hover:text-amber-500 transition-colors">
                      {r.TITULO || r.titulo || "Reporte sin título"}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">
                      {r.TIPO_DOCUMENTO || r.tipo_documento || "General"}
                    </p>
                  </div>
                </div>
                
                {/* Si hay URL, mostramos el botón de descarga */}
                {(r.URL_ARCHIVO || r.url_archivo) ? (
                  <a 
                    href={r.URL_ARCHIVO || r.url_archivo} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#1A1A2E] hover:text-amber-400 transition-all shrink-0 border border-slate-100 group-hover:border-[#1A1A2E]"
                    title="Descargar Documento"
                  >
                    <Download size={18} />
                  </a>
                ) : (
                  <span className="text-[10px] font-black text-slate-300 uppercase mt-4">Sin Archivo</span>
                )}
              </div>
              
              {r.fecha_creacion && (
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase text-slate-300 tracking-widest">
                  <span>Generado el:</span>
                  <span>{new Date(r.fecha_creacion).toLocaleDateString('es-CL')}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}