"use client"
import React, { useState, useEffect } from "react"
import { FileText, Download, Search, Loader2, AlertCircle, History, Filter } from "lucide-react"
import Cookies from "js-cookie"

export default function ReportesColegioPage() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const token = Cookies.get("auth-token")
        const headers = { 'Authorization': `Bearer ${token}` }
        
        const res = await fetch(`http://127.0.0.1:3007/api/v1/documentos`, { headers })
        const contentType = res.headers.get("content-type")
        
        if (contentType && contentType.includes("application/json")) {
           const json = await res.json()
           if (json.success) {
              // Filtrar solo los documentos que sean del colegio (no de un curso específico) si así lo requiere la lógica, o todos.
              setReportes(json.data || [])
           }
        }
      } catch (e: any) { 
        console.error("Error al cargar reportes", e)
      } finally { 
        setLoading(false) 
      }
    }
    fetchReportes()
  }, [])

  const reportesFiltrados = reportes.filter((r: any) => 
    r.TITULO?.toLowerCase().includes(busqueda.toLowerCase()) || 
    r.TIPO_DOCUMENTO?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Cargando Archivo Digital...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-[#1A1A2E] rounded-3xl text-[#FF8FAB] shadow-xl"><FileText size={28} /></div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Archivo de Reportes</h1>
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Balances y Documentos Oficiales</p>
           </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar documento..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50"
          />
        </div>
      </header>

      {/* LISTADO DE REPORTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {reportesFiltrados.length > 0 ? reportesFiltrados.map((rep: any, i: number) => (
           <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-50">
              <div>
                 <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#FAF5FF] p-3 rounded-xl text-[#FF8FAB]"><FileText size={20} /></div>
                    <span className="text-[8px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                      {rep.TIPO_DOCUMENTO?.replace(/_/g, ' ')}
                    </span>
                 </div>
                 <h3 className="text-lg font-black text-[#1A1A2E] leading-tight mb-2 group-hover:text-[#FF8FAB] transition-colors">{rep.TITULO}</h3>
                 <p className="text-xs font-medium text-slate-500 line-clamp-2">{rep.DESCRIPCION || "Sin descripción adicional."}</p>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                 <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5"><History size={12}/> {new Date(rep.FECHA_DE_CREACION).toLocaleDateString('es-CL')}</p>
                 <a href={rep.URL_ARCHIVO} target="_blank" className="bg-[#1A1A2E] text-white p-3 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md">
                    <Download size={16} />
                 </a>
              </div>
           </div>
         )) : (
           <div className="col-span-full py-20 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
             <Filter size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No se encontraron documentos</p>
           </div>
         )}
      </div>

    </div>
  )
}