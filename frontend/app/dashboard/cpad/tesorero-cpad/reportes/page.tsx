"use client"
import React, { useState, useEffect } from "react"
import { 
  FileText, Download, Loader2, Search, 
  Calendar, ShieldCheck, AlertCircle, BarChart3, FilePlus2, ExternalLink
} from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"

export default function ReportesHistorialPage() {
  const [reportes, setReportes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")

  const fetchReportes = async () => {
    try {
      const token = Cookies.get("auth-token")
      if (!token) return 

      const res = await fetch("http://127.0.0.1:3007/api/v1/notificaciones/reportes", {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const json = await res.json()
      if (res.ok && json.success) {
        setReportes(json.data)
      }
    } catch (e) {
      console.error("Error conectando al servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchReportes()
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filtrados = reportes.filter(r => 
    r.TITULO?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#FF8FAB]" size={40} /></div>

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-amber-400 shadow-xl"><FileText size={32} /></div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Archivo de Reportes</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Historial de balances oficiales</p>
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input type="text" placeholder="Buscar reporte..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}/>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><BarChart3 size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Documentos</p>
            <h3 className="text-2xl font-black text-[#1A1A2E]">{reportes.length}</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><Calendar size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Año 2026</p>
            <h3 className="text-2xl font-black text-[#1A1A2E]">{reportes.length}</h3>
          </div>
        </div>
        
        {/* BOTÓN CONECTADO A LA VISTA NUEVO */}
        <Link href="/dashboard/apoderado/tesorero-cpad/reportes/nuevo" className="bg-amber-500 p-8 rounded-[2.5rem] shadow-xl shadow-amber-100 flex items-center justify-between group cursor-pointer hover:bg-amber-600 transition-all text-white">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/20 rounded-2xl"><FilePlus2 size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest">Acción</p>
              <h3 className="text-lg font-black uppercase tracking-tighter">Nuevo Reporte</h3>
            </div>
          </div>
          <ExternalLink size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtrados.length === 0 ? (
          <div className="col-span-full bg-white rounded-[3.5rem] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center opacity-30 text-center">
            <AlertCircle size={64} className="mb-4" /><p className="text-sm font-black uppercase">No se encontraron documentos</p>
          </div>
        ) : filtrados.map((r) => (
          <div key={r.DOCUMENTO_ID} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-50 text-[#1A1A2E] rounded-2xl group-hover:bg-[#1A1A2E] group-hover:text-white transition-all"><FileText size={24} /></div>
                <div>
                  <h3 className="text-sm font-black text-[#1A1A2E] uppercase line-clamp-1">{r.TITULO}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{r.TIPO_DOCUMENTO}</p>
                </div>
              </div>
              <a href={r.URL_ARCHIVO} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-amber-500 hover:text-white transition-all"><Download size={18} /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}