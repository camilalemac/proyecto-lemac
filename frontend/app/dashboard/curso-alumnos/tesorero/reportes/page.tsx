"use client"
import { useState, useEffect } from "react"
import { FileSpreadsheet, Loader2, Save, FileDown, History, CheckCircle2, BookmarkCheck, Calendar } from "lucide-react"
import Cookies from "js-cookie"

export default function TesoreroReportesPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [reportes, setReportes] = useState<any[]>([])
  
  const [nuevoReporte, setNuevoReporte] = useState({
    tipo: "REPORTE_FINANCIERO_MENSUAL",
    titulo: "",
    descripcion: ""
  })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return setLoading(false)
        const headers = { 'Authorization': `Bearer ${token}` }

        const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
        const dataMe = await resMe.json()
        if (dataMe.success) {
          setUser(dataMe.data)
          
          const resDocs = await fetch(`http://127.0.0.1:3007/api/v1/documentos`, { headers })
          if (resDocs.ok) {
            const dataDocs = await resDocs.json()
            if (dataDocs.success) {
              // Filtrar solo los reportes financieros del curso
              const docsFinancieros = dataDocs.data.filter((doc: any) => 
                doc.TIPO_DOCUMENTO.includes('REPORTE') || doc.TIPO_DOCUMENTO.includes('BALANCE')
              )
              setReportes(docsFinancieros)
            }
          }
        }
      } catch (e) { console.error(e) } 
      finally { setLoading(false) }
    }
    fetchDatos()
  }, [])

  const handleGenerarReporte = async () => {
    if (!user || !user.colegioId) {
        alert("Error de conexión: No se pudo identificar tu perfil. Revisa si el servidor Backend está encendido.")
        return
    }

    if (!nuevoReporte.titulo || !nuevoReporte.descripcion) {
      alert("Debes asignar un título y una descripción al reporte.")
      return
    }

    setEnviando(true)
    try {
      const token = Cookies.get("auth-token")
      const payload = {
        COLEGIO_ID: user.colegioId,
        CURSO_ID: user.cursoId,
        TIPO_DOCUMENTO: nuevoReporte.tipo,
        TITULO: nuevoReporte.titulo,
        DESCRIPCION: nuevoReporte.descripcion,
        URL_ARCHIVO: 'https://storage.oracle.com/reportes/financiero-generado.pdf' 
      }

      const res = await fetch(`http://127.0.0.1:3007/api/v1/documentos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert("Reporte financiero generado y guardado oficialmente.")
        setNuevoReporte({ tipo: "REPORTE_FINANCIERO_MENSUAL", titulo: "", descripcion: "" })
        window.location.reload()
      } else {
        alert("Error al generar el reporte.")
      }
    } catch (error) {
      console.error(error)
      alert("Hubo un error de conexión.")
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Cargando Módulo de Reportes...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-8 z-10">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-2xl rotate-3">
            <FileSpreadsheet size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight leading-none uppercase">
              Emisión de Reportes
            </h1>
            <p className="text-[12px] text-[#FF8FAB] font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <BookmarkCheck size={16} /> Consolidación Financiera
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE GENERACIÓN */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
               <div className="p-3 bg-[#FAF5FF] rounded-2xl text-[#FF8FAB]">
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
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all appearance-none"
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
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
                onChange={(e) => setNuevoReporte({...nuevoReporte, titulo: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Notas / Conclusiones del Período</label>
              <textarea 
                rows={5}
                value={nuevoReporte.descripcion}
                placeholder="Ingresa un resumen de los gastos o ingresos destacados del período..."
                className="w-full bg-[#FAF5FF] border border-[#FF8FAB]/20 rounded-[2.5rem] p-6 text-sm font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
                onChange={(e) => setNuevoReporte({...nuevoReporte, descripcion: e.target.value})}
              />
            </div>

            <button 
              onClick={handleGenerarReporte}
              disabled={enviando}
              className="w-full bg-[#1A1A2E] text-[#FF8FAB] py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
            >
              {enviando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Procesar y Guardar Reporte
            </button>
          </section>
        </div>

        {/* HISTORIAL DE REPORTES */}
        <aside className="lg:col-span-5">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-full relative overflow-hidden">
            <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
              <History size={18} className="text-[#FF8FAB]" /> Archivo Financiero
            </h3>
            
            <div className="space-y-4 relative z-10">
              {reportes.length > 0 ? (
                reportes.map((item: any, i) => (
                  <a key={i} href={item.URL_ARCHIVO} target="_blank" className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-[#1A1A2E] transition-all border border-slate-100">
                    <div className="flex items-center gap-4 truncate">
                      <div className="p-3 bg-white rounded-2xl group-hover:bg-white/10">
                        <FileDown size={16} className="text-[#1A1A2E] group-hover:text-[#FF8FAB]" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-700 group-hover:text-white truncate block">{item.TITULO}</span>
                        <span className="text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest">{item.TIPO_DOCUMENTO.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No se han emitido reportes este año.</p>
                </div>
              )}
            </div>
            <CheckCircle2 size={200} className="absolute -bottom-16 -right-16 text-slate-50 rotate-12" />
          </div>
        </aside>
      </div>
    </div>
  )
}