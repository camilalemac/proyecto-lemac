"use client"
import { useState } from "react"
import { FileText, MapPin, Calendar, Send, Loader2, Plus, Trash2, Users, CheckCircle2 } from "lucide-react"
import Cookies from "js-cookie"

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
    generadoPor: "Secretario de Curso" // Esto puede dinamizarse luego con el perfil del usuario
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
      alert("Debes añadir al menos un asistente.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("auth-token");
      
      // Conexión al microservicio de documentos (Puerto 3005)
      const response = await fetch("http://127.0.0.1:3005/api/v1/documentos/actas", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          ...formData, 
          colegioNombre: colegio,
          fecha_creacion: new Date().toISOString()
        })
      });

      if (response.ok) {
        // En lugar de un alert simple, podrías usar un toast.
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'No se pudo generar el acta'}`);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión con el servidor de documentos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Encabezado del Formulario */}
      <div className="border-b border-slate-50 pb-6">
        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-3">
          <div className="bg-[#FDF2F5] p-2 rounded-lg text-[#FF8FAB]">
            <CheckCircle2 size={20} />
          </div>
          Nueva Acta de Reunión
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 ml-11 italic">
          Institución: {colegio}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Título */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Tema de la Sesión</label>
          <div className="relative group">
            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB] group-focus-within:scale-110 transition-transform" size={18} />
            <input 
              required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white transition-all rounded-3xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A]"
              placeholder="Ej: Organización de Gala Anual"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
        </div>

        {/* Lugar */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Ubicación / Medio</label>
          <div className="relative group">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB]" size={18} />
            <input 
              required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white transition-all rounded-3xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A]"
              placeholder="Ej: Biblioteca o Sala de Zoom"
              value={formData.lugar}
              onChange={e => setFormData({...formData, lugar: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Asistentes */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Participantes Registrados</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A]"
              placeholder="Nombre del integrante..."
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
        
        {/* Chips de Asistentes */}
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
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 ml-2 italic">No se han añadido asistentes aún...</p>
          )}
        </div>
      </div>

      {/* Contenido / Desarrollo */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Relato y Acuerdos de la Sesión</label>
        <textarea 
          required
          rows={6}
          className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white transition-all rounded-[2.5rem] p-8 text-xs font-bold text-[#0F172A] leading-relaxed resize-none shadow-inner"
          placeholder="Describa de forma detallada los puntos tratados..."
          value={formData.contenido}
          onChange={e => setFormData({...formData, contenido: e.target.value})}
        />
      </div>

      {/* Botón de Envío */}
      <button 
        disabled={loading}
        className="w-full bg-[#0F172A] text-white py-6 rounded-4xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-[#1e293b] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin text-[#FF8FAB]" />
            Sincronizando con Drive...
          </>
        ) : (
          <>
            <Send size={18} className="text-[#FF8FAB]" />
            Finalizar y Generar Documento
          </>
        )}
      </button>
    </form>
  );
}