"use client"
import { useState } from "react"
import { FileText, MapPin, Send, Loader2, Plus, Trash2, Users, CheckCircle2 } from "lucide-react"
import Cookies from "js-cookie"

// ARQUITECTURA LIMPIA
import { reporteService } from "../../../../../services/reporteService"

interface Props {
  onSuccess: () => void;
  colegio: string;
}

export default function ActaForm({ onSuccess, colegio }: Props) {
  const [loading, setLoading] = useState(false);
  const [asistenteInput, setAsistenteInput] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    fecha: new Date().toISOString().split('T')[0],
    lugar: "",
    asistentes: [] as string[],
    contenido: "",
    generadoPor: "Secretario de Alumnos" 
  });

  const addAsistente = () => {
    if (asistenteInput.trim()) {
      setFormData({ ...formData, asistentes: [...formData.asistentes, asistenteInput] });
      setAsistenteInput("");
    }
  };

  const removeAsistente = (index: number) => {
    setFormData({ ...formData, asistentes: formData.asistentes.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.asistentes.length === 0) {
      alert("⚠️ Debes registrar al menos un asistente para validar la sesión.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Uso del servicio centralizado conectado a MS_REPORTES
      await reporteService.createActa({ 
        ...formData, 
        colegioNombre: colegio,
        fecha_creacion: new Date().toISOString()
      });

      // Notificamos al componente padre para que cambie la vista al listado
      onSuccess();
      
    } catch (error: any) {
      console.error("Error al guardar acta:", error);
      alert(error.message || "Error de conexión con el repositorio de documentos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DEL FORMULARIO */}
      <div className="border-b border-slate-50 pb-6">
        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-3">
          <div className="bg-[#FDF2F5] p-2 rounded-lg text-[#FF8FAB]">
            <CheckCircle2 size={20} />
          </div>
          Redacción de Acta Oficial
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 ml-11 italic">
          Entidad: {colegio}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* TEMA */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Tema de la Tabla</label>
          <div className="relative group">
            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB]" size={18} />
            <input 
              required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white transition-all rounded-3xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A]"
              placeholder="Ej: Organización Semana del Alumno"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
        </div>

        {/* LUGAR */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Lugar / Sesión Virtual</label>
          <div className="relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB]" size={18} />
            <input 
              required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white transition-all rounded-3xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A]"
              placeholder="Ej: Sala de Consejo o Google Meet"
              value={formData.lugar}
              onChange={e => setFormData({...formData, lugar: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* ASISTENTES */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Registro de Asistencia</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A]"
              placeholder="Añadir nombre de asistente..."
              value={asistenteInput}
              onChange={e => setAsistenteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAsistente())}
            />
          </div>
          <button 
            type="button" 
            onClick={addAsistente} 
            className="bg-[#0F172A] text-white px-6 rounded-3xl hover:bg-[#FF8FAB] transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* CHIPS DE ASISTENTES */}
        <div className="flex flex-wrap gap-2 min-h-10 p-2">
          {formData.asistentes.map((as, i) => (
            <span key={i} className="bg-white border border-[#FF8FAB]/20 text-[#0F172A] text-[9px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm animate-in zoom-in-50">
              {as} 
              <button type="button" onClick={() => removeAsistente(i)} className="text-[#FF8FAB] hover:text-red-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </span>
          ))}
          {formData.asistentes.length === 0 && (
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 ml-2 italic">Sin participantes registrados...</p>
          )}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Cuerpo del Acta y Acuerdos</label>
        <textarea 
          required
          rows={6}
          className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white transition-all rounded-[2.5rem] p-8 text-xs font-bold text-[#0F172A] leading-relaxed resize-none shadow-inner"
          placeholder="Escriba aquí los puntos tratados, votaciones y compromisos adquiridos..."
          value={formData.contenido}
          onChange={e => setFormData({...formData, contenido: e.target.value})}
        />
      </div>

      {/* SUBMIT */}
      <button 
        disabled={loading}
        className="w-full bg-[#0F172A] text-white py-6 rounded-4xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl hover:bg-[#1e293b] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin text-[#FF8FAB]" />
            Generando Documento en Oracle...
          </>
        ) : (
          <>
            <Send size={18} className="text-[#FF8FAB]" />
            Finalizar y Guardar en Repositorio
          </>
        )}
      </button>
    </form>
  );
}