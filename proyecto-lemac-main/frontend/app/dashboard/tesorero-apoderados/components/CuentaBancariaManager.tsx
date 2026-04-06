"use client"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { 
  Landmark, 
  RefreshCw, 
  Edit3, 
  Check, 
  Ban, 
  AlertTriangle, 
  Database,
  Lock
} from "lucide-react"

interface CuentaBancaria {
  CUENTA_ID: number;
  NOMBRE_CUENTA: string;
  BANCO: string;
  SALDO_ACTUAL: number;
  ACTIVO: string;
}

interface Props {
  cuenta: CuentaBancaria | null;
  onUpdate: () => void;
}

export default function CuentaBancariaManager({ cuenta, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado inicial sincronizado con la data real de Oracle
  const [editForm, setEditForm] = useState({
    NOMBRE_CUENTA: "",
    BANCO: "",
    ACTIVO: true
  });

  // Sincronizar el formulario cuando la cuenta carga
  useEffect(() => {
    if (cuenta) {
      setEditForm({
        NOMBRE_CUENTA: cuenta.NOMBRE_CUENTA,
        BANCO: cuenta.BANCO,
        ACTIVO: cuenta.ACTIVO === "S"
      });
    }
  }, [cuenta]);

  const API_PAGOS = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3002/api/v1/pagos/cuentas-bancarias";

  const handleUpdate = async () => {
    if (!cuenta) return;
    setLoading(true);
    const token = Cookies.get("auth-token");
    
    try {
      const res = await fetch(`${API_PAGOS}/${cuenta.CUENTA_ID}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...editForm,
          ACTIVO: editForm.ACTIVO ? "S" : "N"
        })
      });

      if (res.ok) {
        setIsEditing(false);
        onUpdate(); // Trigger de refresco en TesoreroPage
      }
    } catch (error) {
      console.error("Error Lemac Database:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaja = async () => {
    if (!cuenta) return;
    const confirmacion = confirm("¿Confirmas el traspaso de saldos? Esta acción generará un movimiento de apertura en el historial contable.");
    if (!confirmacion) return;
    
    setLoading(true);
    const token = Cookies.get("auth-token");
    try {
      const res = await fetch(`${API_PAGOS}/abrir-caja`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          CUENTA_ID: cuenta.CUENTA_ID // Enviamos el ID real de la cuenta cargada
        })
      });

      if (res.ok) {
        alert("Apertura de caja procesada exitosamente en OCI Oracle.");
        onUpdate();
      }
    } catch (error) {
      console.error("Error en procedimiento de apertura:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* SECCIÓN PRINCIPAL: CONFIGURACIÓN DE CUENTA */}
      <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[#0F172A] pointer-events-none">
          <Landmark size={180} />
        </div>

        <div className="flex justify-between items-start mb-12 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database size={14} className="text-[#FF8FAB]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Data Source: ms-pagos</h3>
            </div>
            <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase italic">
              {isEditing ? "Ajustes de Cuenta" : cuenta?.NOMBRE_CUENTA || "Sin Cuenta"}
            </h2>
          </div>
          
          <button 
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            disabled={loading}
            className={`p-5 rounded-3xl transition-all shadow-lg active:scale-90 ${
              isEditing ? 'bg-[#0F172A] text-white' : 'bg-[#FDF2F5] text-[#FF8FAB] hover:bg-[#FF8FAB] hover:text-white'
            }`}
          >
            {isEditing ? <Check size={24} /> : <Edit3 size={24} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest ml-1">Institución Bancaria</label>
            {isEditing ? (
              <input 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 rounded-2xl py-5 px-8 text-xs font-bold outline-none transition-all"
                value={editForm.BANCO}
                onChange={e => setEditForm({...editForm, BANCO: e.target.value})}
                placeholder="Ej: Banco Estado"
              />
            ) : (
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.8rem] border border-slate-100">
                <Landmark size={20} className="text-[#FF8FAB]" />
                <span className="text-sm font-black text-[#0F172A] uppercase tracking-tight">{cuenta?.BANCO || "No asignado"}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest ml-1">Estado en Red</label>
            <div 
              onClick={() => isEditing && setEditForm({...editForm, ACTIVO: !editForm.ACTIVO})}
              className={`flex items-center gap-4 p-6 rounded-[1.8rem] transition-all ${isEditing ? 'cursor-pointer border-2' : 'border'} ${
                editForm.ACTIVO ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
              }`}
            >
              {editForm.ACTIVO ? <Check size={20} className="text-green-600" /> : <Ban size={20} className="text-red-600" />}
              <span className={`text-[10px] font-black uppercase tracking-widest ${editForm.ACTIVO ? 'text-green-600' : 'text-red-600'}`}>
                {editForm.ACTIVO ? 'Sistema Operativo' : 'Cuenta Suspendida'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE CONTROL DE PERIODO (ACCIONES CRÍTICAS) */}
      <div className="bg-[#0F172A] p-12 rounded-[3.5rem] text-white shadow-2xl shadow-slate-200 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -bottom-10 -right-10 opacity-10 text-white group-hover:scale-110 transition-transform duration-700">
          <RefreshCw size={200} />
        </div>

        <div className="relative z-10">
          <div className="bg-[#FF8FAB] w-fit p-5 rounded-3xl mb-8 shadow-lg shadow-[#FF8FAB]/20">
            <RefreshCw size={28} className={loading ? "animate-spin" : ""} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">Gestión de Ciclo</h3>
          <p className="text-[11px] font-medium text-slate-400 uppercase leading-relaxed tracking-wider">
            Sincroniza el saldo final del periodo anterior como saldo inicial del nuevo año escolar en la base de datos Oracle.
          </p>
        </div>

        <div className="mt-12 space-y-5 relative z-10">
          <div className="flex items-center gap-3 text-[#FF8FAB] bg-white/5 p-5 rounded-2xl border border-white/5">
            <Lock size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Procedimiento Restringido</span>
          </div>
          
          <button 
            onClick={handleAbrirCaja}
            disabled={loading || !cuenta}
            className="w-full bg-white text-[#0F172A] py-6 rounded-4xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#FF8FAB] hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Database size={16} />}
            Abrir Caja {new Date().getFullYear()}
          </button>
        </div>
      </div>

    </div>
  );
}