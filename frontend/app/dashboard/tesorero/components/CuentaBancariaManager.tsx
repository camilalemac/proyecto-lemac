"use client"
import { useState } from "react"
import { CreditCard, Save, Copy, ShieldCheck, Landmark, Mail, Fingerprint } from "lucide-react"

export default function CuentaBancariaManager({ cuenta }: { cuenta: any }) {
  const [isEditing, setIsEditing] = useState(false)

  // Utilidad para copiar datos a portapapeles (para el grupo del curso)
  const copyToClipboard = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    // Aquí podrías usar una librería de toasts si la tienes, o un alert simple
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-50 shadow-sm relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#FF8FAB]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-14 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-4 bg-[#0F172A] rounded-3xl text-[#FF8FAB] shadow-xl shadow-slate-200">
                <Landmark size={26} />
              </div>
              <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic">
                Cuenta Recaudadora
              </h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" /> Sincronizado con Oracle DB
            </p>
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-10 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${
              isEditing 
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
              : 'bg-[#FF8FAB] text-white shadow-lg shadow-pink-100 hover:scale-105'
            }`}
          >
            {isEditing ? "Cancelar Cambios" : "Editar Datos de Depósito"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          
          {/* TARJETA VISUAL PREMIUM */}
          <div className="bg-linear-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] relative text-white min-h-75 flex flex-col justify-between group overflow-hidden border border-white/5 transition-transform hover:-rotate-1">
            {/* Patrón de ondas decorativo */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full border border-white rounded-full scale-150 translate-x-1/2" />
            </div>

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Entidad Bancaria</p>
                <p className="text-2xl font-black tracking-tight uppercase italic text-[#FF8FAB]">{cuenta?.BANCO || "BANCO ESTADO"}</p>
              </div>
              <div className="w-14 h-10 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 flex items-center justify-center p-2">
                 <CreditCard className="text-slate-300 opacity-50" size={24} />
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="group/num cursor-pointer" onClick={() => copyToClipboard(cuenta?.NUMERO_CUENTA)}>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2 flex items-center gap-2">
                    Nº de Cuenta <Copy size={10} className="opacity-0 group-hover/num:opacity-100 transition-opacity" />
                </p>
                <p className="text-3xl font-mono tracking-[0.25em]">{cuenta?.NUMERO_CUENTA || "0000 0000 0000"}</p>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Titular Responsable</p>
                  <p className="text-md font-bold uppercase tracking-tight">{cuenta?.TITULAR || "Nombre Tesorero"}</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 bg-[#FF8FAB] rounded-full animate-pulse" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-200 italic">Lemac Official</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULARIO Y DETALLES */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<Fingerprint size={14}/>} label="RUT del Titular" value={cuenta?.RUT_TITULAR || "20.123.456-7"} isEditing={isEditing} />
              <DetailItem icon={<Landmark size={14}/>} label="Tipo de Cuenta" value={cuenta?.TIPO_CUENTA || "Cuenta Vista / RUT"} isEditing={isEditing} />
            </div>
            
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 group transition-all hover:border-[#FF8FAB]/30">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Mail size={12} className="text-[#FF8FAB]" /> Correo de Notificación
              </p>
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-[#0F172A] lowercase tracking-tighter">
                    {cuenta?.EMAIL_NOTIFICACION || "tesoreria@proyecto-lemac.cl"}
                </p>
                <button 
                  onClick={() => copyToClipboard(cuenta?.EMAIL_NOTIFICACION)}
                  className="bg-white p-3 rounded-xl text-[#0F172A] hover:text-[#FF8FAB] hover:shadow-md transition-all active:scale-90"
                  title="Copiar Correo"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {isEditing && (
              <button className="w-full py-6 bg-[#0F172A] text-white rounded-4xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-slate-200 hover:bg-[#FF8FAB] transition-all flex items-center justify-center gap-4 animate-in slide-in-from-top-2">
                <Save size={20} /> Actualizar en Servidor Lemac
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

function DetailItem({ icon, label, value, isEditing }: { icon: any, label: string, value: string, isEditing: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
        {icon} {label}
      </label>
      {isEditing ? (
        <input 
          type="text" 
          defaultValue={value} 
          className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl text-[11px] font-black text-[#0F172A] outline-none focus:border-[#FF8FAB]/20 focus:bg-white transition-all uppercase tracking-tighter"
        />
      ) : (
        <div className="p-5 bg-slate-50 rounded-3xl text-[11px] font-black text-[#0F172A] border border-transparent uppercase tracking-tighter">
          {value}
        </div>
      )}
    </div>
  )
}