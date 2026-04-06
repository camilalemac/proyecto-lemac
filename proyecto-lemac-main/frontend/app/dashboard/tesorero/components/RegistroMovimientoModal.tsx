"use client"
import { useState } from "react"
import { X, DollarSign, Calendar, Tag, FileText, Loader2, CheckCircle2 } from "lucide-react"

interface RegistroMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: any[];
  onSuccess?: () => void; // Para recargar la lista después de guardar
}

export default function RegistroMovimientoModal({ 
  isOpen, 
  onClose, 
  categorias,
  onSuccess 
}: RegistroMovimientoModalProps) {
  const [tipo, setTipo] = useState<"INGRESO" | "EGRESO">("EGRESO")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success">("idle")

  // Estado del formulario vinculado a tu tabla de Oracle
  const [formData, setFormData] = useState({
    monto: "",
    categoria_id: "",
    fecha: new Date().toISOString().split('T')[0],
    descripcion: ""
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Ajusta esta URL a tu endpoint real de ms-pagos o ms-tesoreria
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tipo_movimiento: tipo,
          monto: Number(formData.monto)
        }),
      })

      if (response.ok) {
        setStatus("success")
        setTimeout(() => {
          onSuccess?.()
          handleClose()
        }, 1500)
      }
    } catch (error) {
      console.error("Error al registrar:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStatus("idle")
    setFormData({ monto: "", categoria_id: "", fecha: new Date().toISOString().split('T')[0], descripcion: "" })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* HEADER DINÁMICO */}
        <div className={`p-10 flex justify-between items-center transition-colors duration-500 ${tipo === 'INGRESO' ? 'bg-green-50/50' : 'bg-[#FDF2F5]'}`}>
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter italic">
              {tipo === 'INGRESO' ? 'Nuevo Ingreso' : 'Registrar Gasto'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
              Operación Tesorería Lemac
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-4 bg-white rounded-3xl text-slate-300 hover:text-[#FF8FAB] transition-all shadow-sm active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {status === "success" ? (
          <div className="p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-green-100 p-6 rounded-[2.5rem] text-green-500 mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tighter">¡Registro Exitoso!</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">La base de datos Oracle ha sido actualizada</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            
            {/* SELECTOR DE TIPO (Switch Lemac Style) */}
            <div className="flex bg-slate-50 p-2 rounded-4xl">
              <button 
                type="button"
                onClick={() => setTipo("EGRESO")}
                className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${tipo === 'EGRESO' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Gasto / Egreso
              </button>
              <button 
                type="button"
                onClick={() => setTipo("INGRESO")}
                className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${tipo === 'INGRESO' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Entrada / Ingreso
              </button>
            </div>

            <div className="space-y-6">
              {/* MONTO */}
              <div className="group">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-5 mb-2 block tracking-widest">Monto de la Operación</label>
                <div className="flex items-center bg-slate-50 rounded-[1.8rem] px-6 border-2 border-transparent group-focus-within:border-[#FF8FAB]/20 group-focus-within:bg-white transition-all">
                  <DollarSign size={20} className={tipo === 'INGRESO' ? 'text-green-500' : 'text-[#FF8FAB]'} />
                  <input 
                    required
                    type="number" 
                    placeholder="0"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    className="w-full bg-transparent p-5 outline-none font-black text-lg text-[#0F172A] placeholder:text-slate-200"
                  />
                </div>
              </div>

              {/* CATEGORÍA Y FECHA */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-5 mb-2 block tracking-widest">Categoría</label>
                  <div className="flex items-center bg-slate-50 rounded-[1.8rem] px-5">
                    <Tag size={16} className="text-slate-300" />
                    <select 
                      required
                      value={formData.categoria_id}
                      onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                      className="w-full bg-transparent p-5 outline-none font-bold text-[11px] text-[#0F172A] uppercase appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map(cat => (
                        <option key={cat.CATEGORIA_ID} value={cat.CATEGORIA_ID}>{cat.NOMBRE}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-5 mb-2 block tracking-widest">Fecha</label>
                  <div className="flex items-center bg-slate-50 rounded-[1.8rem] px-5">
                    <Calendar size={16} className="text-slate-300" />
                    <input 
                      required
                      type="date" 
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      className="w-full bg-transparent p-5 outline-none font-bold text-[11px] text-[#0F172A]" 
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-5 mb-2 block tracking-widest">Motivo / Descripción</label>
                <div className="flex items-start bg-slate-50 rounded-4xl px-6 py-2 border-2 border-transparent focus-within:bg-white focus-within:border-[#FF8FAB]/10 transition-all">
                  <FileText size={18} className="text-slate-300 mt-4" />
                  <textarea 
                    required
                    rows={2}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Ej: Pago de cuota mensual marzo..."
                    className="w-full bg-transparent p-4 outline-none font-bold text-xs text-[#0F172A] placeholder:text-slate-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button 
              disabled={loading}
              type="submit"
              className={`w-full py-6 rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 ${tipo === 'INGRESO' ? 'bg-green-500 shadow-green-100 hover:bg-green-600' : 'bg-[#0F172A] shadow-slate-200 hover:bg-[#1e293b]'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Confirmar Operación</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}