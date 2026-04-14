"use client"
import { useState, useEffect } from "react"
import { 
  ClipboardList, Save, BellRing, History, 
  FileDown, CheckCircle2, Edit3, Loader2, BookmarkCheck, Info, Send 
} from "lucide-react"
import Cookies from "js-cookie"

export default function SecretarioPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [historialActas, setHistorialActas] = useState<any[]>([])
  
  const [acta, setActa] = useState({
    titulo: "",
    fecha: new Date().toISOString().split('T')[0],
    asistentes: "",
    contenido: "",
    acuerdos: ""
  })
  const [enviando, setEnviando] = useState(false)

  // Cargar el perfil y el historial de documentos
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return setLoading(false)
        const headers = { 'Authorization': `Bearer ${token}` }

        // 1. Obtener datos del secretario
        const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
        const dataMe = await resMe.json()
        if (dataMe.success) {
          setUser(dataMe.data)
          
          // 2. Obtener Historial de Actas (MS_REPORTES -> REP_DOCUMENTOS)
          const resDocs = await fetch(`http://127.0.0.1:3007/api/v1/documentos`, { headers })
          const dataDocs = await resDocs.json()
          if (dataDocs.success) {
            // Filtramos solo los que sean actas de reuniones
            const actas = dataDocs.data.filter((doc: any) => doc.TIPO_DOCUMENTO === 'ACTA_REUNION')
            setHistorialActas(actas.slice(0, 5))
          }
        }
      } catch (e) { console.error(e) } 
      finally { setLoading(false) }
    }
    fetchDatos()
  }, [])

  // Enviar Notificación a los Alumnos
  const handleNotificarAlumnos = async () => {
    if (!acta.titulo || !acta.fecha) {
      alert("Necesitas al menos un título y fecha para citar al curso.")
      return
    }
    try {
      const token = Cookies.get("auth-token")
      await fetch(`http://127.0.0.1:3007/api/v1/comunicaciones/notificar-asamblea`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: acta.titulo, fecha: acta.fecha })
      })
      alert(`Notificación enviada a todos los miembros del curso.`)
    } catch (error) {
      console.error(error)
    }
  }

  // Guardar Acta en el Backend (MS_REPORTES)
  const handleGuardarActa = async () => {
    if (!acta.titulo || !acta.contenido) {
      alert("Por favor, completa al menos el título y el desarrollo de la asamblea.")
      return
    }
    setEnviando(true)
    try {
      const token = Cookies.get("auth-token")
      
      // Creamos el payload basado en tu tabla REP_DOCUMENTOS
      const payload = {
        COLEGIO_ID: user.colegioId,
        CURSO_ID: user.cursoId,
        TIPO_DOCUMENTO: 'ACTA_REUNION',
        TITULO: acta.titulo,
        DESCRIPCION: acta.acuerdos || acta.contenido.substring(0, 100),
        URL_ARCHIVO: 'https://storage.oracle.com/actas/generada-automaticamente.pdf' 
      }

      const res = await fetch(`http://127.0.0.1:3007/api/v1/documentos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert("Acta guardada y publicada en el historial oficial del curso.")
        setActa({ titulo: "", fecha: new Date().toISOString().split('T')[0], asistentes: "", contenido: "", acuerdos: "" })
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
      alert("Hubo un error al guardar el acta.")
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Cargando Módulo de Secretaría...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER SECRETARÍA */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-8 z-10">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-2xl rotate-3">
            <Edit3 size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight leading-none uppercase">
              {user?.nombre || 'Secretaría'}
            </h1>
            <p className="text-[12px] text-[#FF8FAB] font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <BookmarkCheck size={16} /> Documentación y Actas Oficiales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#1A1A2E] bg-[#FAF5FF] px-6 py-4 rounded-3xl border border-[#1A1A2E]/5 z-10">
           <Info size={16} className="text-[#FF8FAB]" />
           <span className="text-[10px] font-black uppercase tracking-widest">Módulo de Redacción Activo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE GENERACIÓN */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FAF5FF] rounded-2xl text-[#FF8FAB]">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Nueva Asamblea</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registro de puntos y acuerdos</p>
                  </div>
               </div>

               <button 
                onClick={handleNotificarAlumnos}
                className="flex items-center gap-2 bg-[#FAF5FF] text-[#1A1A2E] border border-[#FF8FAB]/20 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all"
               >
                 <BellRing size={14} /> Citar al Curso
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Título de la Reunión</label>
                <input 
                  type="text" 
                  value={acta.titulo}
                  placeholder="Ej: Asamblea Extraordinaria..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
                  onChange={(e) => setActa({...acta, titulo: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Fecha</label>
                  <input 
                    type="date" 
                    value={acta.fecha}
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
                    onChange={(e) => setActa({...acta, fecha: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Asistencia</label>
                  <input 
                    type="number" 
                    value={acta.asistentes}
                    placeholder="Cant."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
                    onChange={(e) => setActa({...acta, asistentes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Desarrollo de la Asamblea</label>
              <textarea 
                rows={8}
                value={acta.contenido}
                placeholder="Detalla lo conversado en la reunión..."
                className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 text-sm font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all leading-relaxed"
                onChange={(e) => setActa({...acta, contenido: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Acuerdos Tomados</label>
              <textarea 
                rows={3}
                value={acta.acuerdos}
                placeholder="Enumera los compromisos finales..."
                className="w-full bg-[#FAF5FF] border border-[#FF8FAB]/20 rounded-3xl p-6 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all leading-relaxed"
                onChange={(e) => setActa({...acta, acuerdos: e.target.value})}
              />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          {/* BOTÓN PRINCIPAL DE PUBLICACIÓN FINAL */}
          <div className="bg-[#1A1A2E] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-[#FF8FAB] text-[#1A1A2E] w-fit p-4 rounded-3xl mb-6 shadow-lg">
                <Send size={24} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Publicar Acta</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Al confirmar, el acta se guardará en la base de datos de reportes institucionales.
              </p>
              
              <button 
                onClick={handleGuardarActa}
                disabled={enviando}
                className="w-full mt-8 bg-white text-[#1A1A2E] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF8FAB] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enviando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Confirmar Firma
              </button>
            </div>
            <CheckCircle2 size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* ACTAS RECIENTES (CONECTADAS A LA DB) */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-full">
            <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
              <History size={18} className="text-[#FF8FAB]" /> Historial Oficial
            </h3>
            
            <div className="space-y-4">
              {historialActas.length > 0 ? (
                historialActas.map((item: any, i) => (
                  <a key={i} href={item.URL_ARCHIVO} target="_blank" className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all border border-slate-100">
                    <div className="flex items-center gap-4 truncate">
                      <div className="p-2 bg-white rounded-xl group-hover:bg-white/10">
                        <FileDown size={14} className="text-[#1A1A2E] group-hover:text-[#FF8FAB]" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-700 group-hover:text-white truncate block">{item.TITULO}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(item.FECHA_DE_CREACION).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sin documentos previos en sistema</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}