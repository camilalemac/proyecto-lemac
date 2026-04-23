"use client"
import { useState, useEffect } from "react"
import { 
  ClipboardList, Save, BellRing, History, 
  FileDown, CheckCircle2, Edit3, Loader2, BookmarkCheck, Info, Send,
  ShieldAlert, ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { reporteService } from "../../../../services/reporteService"
import { notificacionService } from "../../../../services/notificacionService"

export default function SecretarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
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
  const [notificando, setNotificando] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 1. Identidad y Rol
      const perfil = await authService.getMe()
      const rolesSecretaria = ['CEN_SEC_CAP', 'DIR_SEC_APO', 'CEN_SEC_CAL', 'DIR_SEC_ALU']
      const esSecretario = perfil.roles?.some((r: any) => rolesSecretaria.includes(r.rol_code))

      if (!esSecretario) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      
      const userProfile = {
        nombre: `${perfil.nombres} ${perfil.apellidos}`,
        colegioId: perfil.COLEGIO_ID || 1,
        // Usamos la técnica segura para el curso (contexto)
        cursoId: (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1
      }
      setUser(userProfile)
      
      // 2. Obtener Historial de Actas (MS_REPORTES)
      const docs = await reporteService.getHistorialReportes()
      // Filtrar por Actas y por este curso en particular
      const actas = docs.filter((doc: any) => {
        const tipoOk = (doc.TIPO_DOCUMENTO || doc.tipo_documento) === 'ACTA_REUNION'
        const cursoOk = Number(doc.CURSO_ID || doc.curso_id) === Number(userProfile.cursoId)
        return tipoOk && cursoOk
      })
      
      setHistorialActas(actas.slice(0, 5))

    } catch (e) { 
      console.error(e) 
      setIsAuthorized(false)
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 3. Enviar Notificación a los Alumnos
  const handleNotificarAlumnos = async () => {
    if (!acta.titulo || !acta.fecha) {
      alert("Necesitas al menos un título y fecha para citar al curso.")
      return
    }
    
    setNotificando(true)
    try {
      await notificacionService.citarAsamblea({ titulo: acta.titulo, fecha: acta.fecha })
      alert(`Citación enviada a todos los miembros del curso.`)
    } catch (error) {
      alert("La notificación no se pudo enviar. Revisa la consola para más detalles.")
    } finally {
      setNotificando(false)
    }
  }

  // 4. Guardar Acta en Oracle
  const handleGuardarActa = async () => {
    if (!acta.titulo || !acta.contenido) {
      alert("Por favor, completa al menos el título y el desarrollo de la asamblea.")
      return
    }
    
    setEnviando(true)
    try {
      const payload = {
        titulo: acta.titulo,
        periodo: new Date().getFullYear().toString(),
        tipo: 'ACTA_REUNION', 
        descripcion: acta.acuerdos || acta.contenido.substring(0, 100),
        cursoId: user.cursoId, // Para que el servicio sepa a qué curso anclarla
        ingresos: 0,
        egresos: 0,
        saldoFinal: 0
      }

      await reporteService.createActa(payload)
      
      alert("Acta guardada y publicada en el historial oficial del curso.")
      setActa({ titulo: "", fecha: new Date().toISOString().split('T')[0], asistentes: "", contenido: "", acuerdos: "" })
      
      // Recargar historial silenciosamente
      loadData()
    } catch (error) {
      console.error(error)
      alert("Hubo un error al guardar el acta en Oracle.")
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A2E]/40">Inicializando Módulo de Secretaría...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC] p-6 text-center">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-10">La redacción de actas oficiales es exclusiva para los Secretarios de la Directiva.</p>
        <button onClick={() => router.push('/dashboard/alumno/curso-alumno')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      
      {/* HEADER SECRETARÍA */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-8 z-10">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-xl rotate-3">
            <Edit3 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight leading-none uppercase">
              Secretaría de Curso
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
              <BookmarkCheck size={14} className="text-[#FF8FAB]" /> Redacción de Documentación Oficial
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#1A1A2E] bg-[#FDF2F5] px-6 py-4 rounded-3xl border border-pink-100 z-10 mt-6 md:mt-0">
           <Info size={16} className="text-[#FF8FAB]" />
           <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">Sesión: {user?.nombre || 'Activa'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE GENERACIÓN */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-6 border-b border-slate-50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-50 rounded-2xl text-[#FF8FAB]">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tighter">Nueva Asamblea</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Registro de Puntos y Acuerdos</p>
                  </div>
               </div>

               <button 
                onClick={handleNotificarAlumnos}
                disabled={notificando}
                className="flex items-center justify-center gap-2 bg-white text-[#1A1A2E] border border-slate-200 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
               >
                 {notificando ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />} 
                 {notificando ? 'Citando...' : 'Citar al Curso'}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Título Principal</label>
                <input 
                  type="text" 
                  value={acta.titulo}
                  placeholder="Ej: Asamblea Extraordinaria de Abril..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all placeholder:font-medium placeholder:text-slate-300"
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
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all placeholder:font-medium placeholder:text-slate-300 text-center"
                    onChange={(e) => setActa({...acta, asistentes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Desarrollo Temático</label>
              <textarea 
                rows={8}
                value={acta.contenido}
                placeholder="Detalla minuciosamente los temas tratados durante la asamblea..."
                className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 text-sm font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all leading-relaxed placeholder:text-slate-300"
                onChange={(e) => setActa({...acta, contenido: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-400" /> Acuerdos Tomados
              </label>
              <textarea 
                rows={4}
                value={acta.acuerdos}
                placeholder="1. Se acordó la cuota de $5.000 para..."
                className="w-full bg-[#FDF2F5] border border-pink-100 rounded-[2.5rem] p-6 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all leading-relaxed placeholder:text-pink-300/50"
                onChange={(e) => setActa({...acta, acuerdos: e.target.value})}
              />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          
          {/* BOTÓN PRINCIPAL DE PUBLICACIÓN FINAL */}
          <div className="bg-[#1A1A2E] p-10 rounded-[3.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-[#FF8FAB] text-[#1A1A2E] w-fit p-4 rounded-3xl mb-6 shadow-lg shadow-[#FF8FAB]/20">
                <Send size={24} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter">Sellar y Publicar</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">
                Al confirmar, el acta quedará resguardada inmutablemente en el módulo de reportes.
              </p>
              
              <button 
                onClick={handleGuardarActa}
                disabled={enviando}
                className="w-full bg-white text-[#1A1A2E] py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF8FAB] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {enviando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {enviando ? 'Guardando en Oracle...' : 'Confirmar Firma Institucional'}
              </button>
            </div>
            <CheckCircle2 size={180} className="absolute -bottom-16 -right-16 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* ACTAS RECIENTES (CONECTADAS A LA DB) */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-slate-50 pb-4">
              <History size={16} className="text-[#FF8FAB]" /> Historial Oficial
            </h3>
            
            <div className="space-y-4 flex-1">
              {historialActas.length > 0 ? (
                historialActas.map((item: any, i) => (
                  <a key={i} href={item.URL_ARCHIVO || item.url_archivo || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all border border-slate-100">
                    <div className="flex items-center gap-4 truncate">
                      <div className="p-3 bg-white rounded-xl group-hover:bg-white/10 shadow-sm">
                        <FileDown size={14} className="text-[#1A1A2E] group-hover:text-[#FF8FAB]" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-black text-slate-700 group-hover:text-white truncate block tracking-tight">{item.TITULO || item.titulo}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block">
                          {item.FECHA_DE_CREACION || item.fecha_creacion ? new Date(item.FECHA_DE_CREACION || item.fecha_creacion).toLocaleDateString('es-CL') : 'Generada'}
                        </span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                  <ClipboardList size={40} className="text-slate-400 mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sin documentos en sistema</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}