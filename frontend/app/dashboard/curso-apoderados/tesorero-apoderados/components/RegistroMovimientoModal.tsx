"use client"
import { useState } from "react"
import Cookies from "js-cookie"
import { X, Save, DollarSign, Tag, AlignLeft, Image as ImageIcon, Loader2 } from "lucide-react"

interface Categoria {
  CATEGORIA_ID: number;
  NOMBRE: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>; // Para refrescar los datos del dashboard
  categorias: Categoria[];
}

export default function RegistroMovimientoModal({ isOpen, onClose, onSuccess, categorias }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    TIPO_MOVIMIENTO: "EGRESO",
    CATEGORIA_ID: "",
    GLOSA: "",
    MONTO: "",
    COMPROBANTE_URL: ""
  });

  const API_PAGOS = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3002/api/v1/pagos";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = Cookies.get("auth-token");
    
    try {
      const res = await fetch(`${API_PAGOS}/movimientos-caja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          MONTO: Number(formData.MONTO),
          CATEGORIA_ID: Number(formData.CATEGORIA_ID),
          FECHA_MOVIMIENTO: new Date().toISOString() // Fecha actual para Oracle
        })
      });

      if (res.ok) {
        // Resetear formulario y cerrar
        setFormData({
          TIPO_MOVIMIENTO: "EGRESO",
          CATEGORIA_ID: "",
          GLOSA: "",
          MONTO: "",
          COMPROBANTE_URL: ""
        });
        await onSuccess(); // Refresca las estadísticas y la lista
        onClose();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || "No se pudo registrar en la DB"}`);
      }
    } catch (error) {
      console.error("Error conectando al microservicio:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
        
        {/* HEADER: ESTILO LEMAC */}
        <div className="p-10 bg-[#0F172A] text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <DollarSign size={80} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">
              Nuevo <span className="text-[#FF8FAB]">Movimiento</span>
            </h2>
            <p className="text-[9px] font-black opacity-60 uppercase tracking-[0.3em] mt-1">Transacción Certificada OCI</p>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/10 p-3 rounded-2xl transition-all relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          
          {/* TOGGLE TIPO: NAVY & PINK */}
          <div className="flex gap-3 p-2 bg-slate-50 rounded-4xl border border-slate-100">
            {["INGRESO", "EGRESO"].map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setFormData({ ...formData, TIPO_MOVIMIENTO: tipo })}
                className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.TIPO_MOVIMIENTO === tipo 
                  ? "bg-[#0F172A] text-white shadow-lg" 
                  : "text-slate-400 hover:text-[#0F172A]"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoría */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría Contable</label>
              <div className="relative">
                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB]" size={16} />
                <select
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A] appearance-none transition-all outline-none"
                  value={formData.CATEGORIA_ID}
                  onChange={(e) => setFormData({ ...formData, CATEGORIA_ID: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {categorias.map((cat) => (
                    <option key={cat.CATEGORIA_ID} value={cat.CATEGORIA_ID}>{cat.NOMBRE}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monto (CLP)</label>
              <div className="relative">
                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB]" size={16} />
                <input
                  type="number"
                  required
                  placeholder="0"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A] outline-none transition-all"
                  value={formData.MONTO}
                  onChange={(e) => setFormData({ ...formData, MONTO: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Glosa / Descripción */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Glosa de Operación</label>
            <div className="relative">
              <AlignLeft className="absolute left-5 top-5 text-[#FF8FAB]" size={16} />
              <textarea
                required
                rows={2}
                placeholder="Describe el motivo del movimiento..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 rounded-[1.8rem] py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A] outline-none transition-all resize-none"
                value={formData.GLOSA}
                onChange={(e) => setFormData({ ...formData, GLOSA: e.target.value })}
              />
            </div>
          </div>

          {/* Comprobante URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Evidencia (URL)</label>
            <div className="relative">
              <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF8FAB]" size={16} />
              <input
                type="text"
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 rounded-2xl py-5 pl-14 pr-6 text-xs font-bold text-[#0F172A] outline-none transition-all"
                value={formData.COMPROBANTE_URL}
                onChange={(e) => setFormData({ ...formData, COMPROBANTE_URL: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white py-6 rounded-4xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin text-[#FF8FAB]" /> : <Save size={18} className="text-[#FF8FAB]" />}
            Confirmar en Lemac DB
          </button>
        </form>
      </div>
    </div>
  );
}