"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Users, Calendar, Save, 
  Send, Plus, ClipboardList, CheckCircle2,
  FileDown, History, Trash2, Video, MapPin, BellRing
} from "lucide-react"

export default function SecretarioPage() {
  const [acta, setActa] = useState({
    titulo: "",
    fecha: new Date().toISOString().split('T')[0],
    asistentes: "",
    contenido: "",
    acuerdos: ""
  })

  const [historialActas, setHistorialActas] = useState([])

  // Función para NOTIFICAR a los alumnos (Idealmente vía ms-auth o ms-notificaciones)
  const handleNotificarAlumnos = () => {
    if (!acta.titulo || !acta.fecha) {
      alert("Necesitas al menos un título y fecha para notificar al curso.")
      return
    }
    // Aquí conectarías con tu lógica de backend para enviar correos/push
    console.log("Enviando notificación de asamblea a alumnos...", acta.titulo)
    alert(`Notificación enviada: Se ha citado a los alumnos para la asamblea "${acta.titulo}" el día ${acta.fecha}.`)
  }

  const handleGuardarActa = async () => {
    if (!acta.titulo || !acta.contenido) {
      alert("Por favor, completa al menos el título y el contenido.")
      return
    }
    // Sincronización con ms-documentos (proyecto-lemac)
    console.log("Sincronizando con ms-documentos:", acta)
    alert("Acta guardada y publicada exitosamente.")
  }

  return (
    <div className="space-y-10">
      
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10B981]">Gestión de Documentación Oficial</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Registro de Actas</h1>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <History size={16} /> Ver Historial
          </button>
          <button 
            onClick={handleGuardarActa}
            className="flex items-center gap-2 bg-[#059669] px-6 py-3 rounded-2xl text-xs font-black text-white hover:bg-[#065F46] transition-all shadow-lg shadow-emerald-100"
          >
            <Save size={16} /> Guardar Acta
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULARIO DE GENERACIÓN CON BOTÓN DE NOTIFICACIÓN */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-emerald-100/20 space-y-8 relative overflow-hidden">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#ECFDF5] rounded-2xl text-[#10B981]">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Nueva Asamblea</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registro de puntos y acuerdos</p>
                  </div>
               </div>

               {/* BOTÓN DE ACCIÓN RÁPIDA PARA ALUMNOS */}
               <button 
                onClick={handleNotificarAlumnos}
                className="flex items-center gap-2 bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#DCFCE7] transition-all"
               >
                 <BellRing size={14} /> Notificar al Curso
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Título de la Reunión</label>
                <input 
                  type="text" 
                  value={acta.titulo}
                  placeholder="Ej: Asamblea Extraordinaria Paseo..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#10B981] transition-all"
                  onChange={(e) => setActa({...acta, titulo: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Fecha</label>
                  <input 
                    type="date" 
                    value={acta.fecha}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#10B981]"
                    onChange={(e) => setActa({...acta, fecha: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Asistencia</label>
                  <input 
                    type="number" 
                    value={acta.asistentes}
                    placeholder="Cant. Alumnos"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#10B981]"
                    onChange={(e) => setActa({...acta, asistentes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Desarrollo de la Asamblea</label>
              <textarea 
                rows={8}
                value={acta.contenido}
                placeholder="Detalla lo conversado en la reunión..."
                className="w-full bg-slate-50 border-none rounded-4xl p-6 text-sm focus:ring-2 focus:ring-[#10B981] transition-all leading-relaxed"
                onChange={(e) => setActa({...acta, contenido: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Acuerdos Tomados</label>
              <textarea 
                rows={3}
                value={acta.acuerdos}
                placeholder="Enumera los compromisos finales para los alumnos..."
                className="w-full bg-[#F0FDF4]/50 border border-[#DCFCE7] rounded-2xl p-6 text-sm text-[#065F46] focus:ring-2 focus:ring-[#10B981] transition-all font-medium"
                onChange={(e) => setActa({...acta, acuerdos: e.target.value})}
              />
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          {/* BOTÓN PRINCIPAL DE PUBLICACIÓN FINAL */}
          <div className="bg-[#059669] p-8 rounded-[3rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/10 w-fit p-4 rounded-2xl backdrop-blur-md mb-6">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-black mb-2">Publicar Acta</h3>
              <p className="text-[#D1FAE5] text-[10px] font-bold uppercase tracking-wider opacity-90 leading-relaxed">
                Al confirmar, el acta será visible para todos los alumnos y apoderados en su historial.
              </p>
              
              <button 
                onClick={handleGuardarActa}
                className="w-full mt-8 bg-white text-[#059669] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F0FDF4] transition-all shadow-lg"
              >
                Confirmar y Publicar
              </button>
            </div>
            {/* Decoración sutil */}
            <CheckCircle2 size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
          </div>

          {/* ACTAS RECIENTES */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={16} className="text-[#10B981]" /> Historial Reciente
            </h3>
            
            <div className="space-y-3">
              {historialActas.length > 0 ? (
                historialActas.map((item: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-[#F0FDF4] transition-all border border-transparent hover:border-[#DCFCE7]">
                    <div className="flex items-center gap-3">
                      <FileDown size={14} className="text-[#10B981]" />
                      <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sin documentos previos</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}