"use client"
import React, { useState, useEffect } from "react"
import { 
  CreditCard, Plus, ArrowLeft, Loader2, 
  ServerOff, Edit3, Trash2, ShieldCheck, 
  Percent, DollarSign, Receipt, CheckCircle2, XCircle
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// IMPORTACIONES ARQUITECTURA LIMPIA
import { pagosService } from "../../../../services/pagosService"
import { IMetodoPago } from "../../../../types/admin.types"

export default function MetodosPagoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [conexionBackend, setConexionBackend] = useState(true)
  const [metodos, setMetodos] = useState<IMetodoPago[]>([])
  
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [formData, setFormData] = useState({
    NOMBRE_METODO: "",
    COMISION_PORCENTAJE: 0,
    COMISION_FIJA: 0,
    IMPUESTO_PORCENTAJE: 19.00,
    ESTADO: "ACTIVO"
  })

  const [editData, setEditData] = useState({
    METODO_ID: 0,
    NOMBRE_METODO: "",
    COMISION_PORCENTAJE: 0,
    COMISION_FIJA: 0,
    IMPUESTO_PORCENTAJE: 19.00,
    ESTADO: "ACTIVO"
  })

  // Validación estricta
  const checkAdminAuth = () => {
    const token = Cookies.get("auth-token")
    if (!token) return false
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      return payload.role === "SYS_ADMIN"
    } catch (e) {
      return false
    }
  }

  const fetchMetodos = async () => {
    if (!checkAdminAuth()) {
      router.push("/login")
      return
    }
    setAuthorized(true)

    try {
      // ✅ CONSUMO DE BACKEND REAL
      const data = await pagosService.getMetodos();
      
      // Mapeo defensivo
      const mappedMetodos = data.map((m: any) => ({
        ...m,
        METODO_ID: m.METODO_ID || m.metodoId,
        NOMBRE_METODO: m.NOMBRE_METODO || m.nombreMetodo,
        COMISION_PORCENTAJE: m.COMISION_PORCENTAJE || m.comisionPorcentaje || 0,
        COMISION_FIJA: m.COMISION_FIJA || m.comisionFija || 0,
        IMPUESTO_PORCENTAJE: m.IMPUESTO_PORCENTAJE || m.impuestoPorcentaje || 0,
        ESTADO: m.ESTADO || m.estado || "INACTIVO"
      }));

      setMetodos(mappedMetodos)
      setConexionBackend(true)
    } catch (err) {
      console.error(err);
      setConexionBackend(false)
      setMetodos([]) 
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => { fetchMetodos() }, [])

  // ✅ CREAR MÉTODO (POST)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        NOMBRE_METODO: formData.NOMBRE_METODO,
        COMISION_PORCENTAJE: parseFloat(formData.COMISION_PORCENTAJE.toString()),
        COMISION_FIJA: parseInt(formData.COMISION_FIJA.toString()),
        IMPUESTO_PORCENTAJE: parseFloat(formData.IMPUESTO_PORCENTAJE.toString()),
        ESTADO: formData.ESTADO
      }

      const data = await pagosService.createMetodo(payload);
      
      if (data.success) {
        setShowModal(false);
        setFormData({NOMBRE_METODO: "", COMISION_PORCENTAJE: 0, COMISION_FIJA: 0, IMPUESTO_PORCENTAJE: 19.0, ESTADO: "ACTIVO"})
        fetchMetodos();
      } else {
        alert("Error al crear: " + data.message);
      }
    } catch (error) {
      alert("Error crítico de conexión con Oracle.");
    }
  }

  // ✅ EDITAR MÉTODO (PUT)
  const openEditModal = (metodo: IMetodoPago) => {
    setEditData({
      METODO_ID: metodo.METODO_ID as number,
      NOMBRE_METODO: metodo.NOMBRE_METODO || "",
      COMISION_PORCENTAJE: metodo.COMISION_PORCENTAJE || 0,
      COMISION_FIJA: metodo.COMISION_FIJA || 0,
      IMPUESTO_PORCENTAJE: metodo.IMPUESTO_PORCENTAJE || 19,
      ESTADO: metodo.ESTADO || "ACTIVO"
    })
    setShowEditModal(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        NOMBRE_METODO: editData.NOMBRE_METODO,
        COMISION_PORCENTAJE: parseFloat(editData.COMISION_PORCENTAJE.toString()),
        COMISION_FIJA: parseInt(editData.COMISION_FIJA.toString()),
        IMPUESTO_PORCENTAJE: parseFloat(editData.IMPUESTO_PORCENTAJE.toString()),
        ESTADO: editData.ESTADO
      }

      const data = await pagosService.updateMetodo(editData.METODO_ID, payload);
      
      if (data.success) {
        setShowEditModal(false);
        fetchMetodos();
      } else {
        alert("Error al actualizar: " + data.message);
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  }

  // ✅ ELIMINAR MÉTODO (DELETE)
  const handleDelete = async (metodoId: number) => {
    if (!window.confirm(`¿Seguro que deseas eliminar/desactivar la pasarela ID ${metodoId}?`)) return;

    try {
      const data = await pagosService.deleteMetodo(metodoId);
      if (data.success) fetchMetodos();
      else alert("Error al eliminar: " + data.message);
    } catch (error) {
      alert("Error de red.");
    }
  }

  if (loading || !authorized) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FDF2F5] gap-4">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] opacity-60">Consultando MS_PAGOS...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF2F5] p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* NAVEGACIÓN */}
      <Link href="/dashboard/admin" className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Infraestructura del Sistema
      </Link>

      {/* HEADER */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <CreditCard size={250} className="absolute -right-10 -bottom-10 text-pink-50 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#0F172A] p-6 rounded-3xl text-white shadow-2xl">
            <CreditCard size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none italic">Pasarelas de Pago</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Configuración de Comisiones e Impuestos</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="relative z-10 bg-[#0F172A] text-white px-10 py-5 rounded-4xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#1e293b] transition-all shadow-xl shadow-slate-900/20 italic"
        >
          <Plus size={18} className="text-[#FF8FAB]" /> Nueva Pasarela
        </button>
      </header>

      {/* GRILLA DE MÉTODOS REALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
        {!conexionBackend && (
          <div className="col-span-full bg-[#0F172A] text-pink-200 p-10 rounded-[3rem] text-center border border-pink-500/20">
            <ServerOff size={40} className="mx-auto mb-4 text-pink-500" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">MS_PAGOS Offline • Oracle DB no accesible</p>
          </div>
        )}

        {metodos.length > 0 ? metodos.map((metodo) => (
          <div key={metodo.METODO_ID} className="bg-white rounded-[3.5rem] border border-pink-50 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
            <div className="p-10 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-pink-50 p-4 rounded-2xl text-[#FF8FAB]">
                  <CreditCard size={28} />
                </div>
                <StatusBadge status={metodo.ESTADO || "INACTIVO"} />
              </div>
              
              <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter mb-6 line-clamp-2">
                {metodo.NOMBRE_METODO}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Percent size={10}/> Comisión %</p>
                  <p className="text-lg font-black text-[#0F172A]">{metodo.COMISION_PORCENTAJE}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign size={10}/> Comisión Fija</p>
                  <p className="text-lg font-black text-[#0F172A]">${metodo.COMISION_FIJA}</p>
                </div>
                <div className="col-span-full bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Receipt size={10}/> Impuesto (IVA)</p>
                  <p className="text-sm font-black text-indigo-900">{metodo.IMPUESTO_PORCENTAJE}% sobre comisión</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">ID: {metodo.METODO_ID}</p>
               <div className="flex gap-2">
                 <button onClick={() => openEditModal(metodo)} className="p-3 bg-white text-[#0F172A] hover:bg-[#0F172A] hover:text-white rounded-xl transition-all shadow-sm">
                    <Edit3 size={16} />
                 </button>
                 <button onClick={() => handleDelete(metodo.METODO_ID as number)} className="p-3 bg-white text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm">
                    <Trash2 size={16} />
                 </button>
               </div>
            </div>
          </div>
        )) : conexionBackend && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-40">
            <ServerOff size={60} className="text-[#0F172A] mb-4" />
            <p className="font-black uppercase tracking-widest text-[#0F172A] text-xl">Sin Pasarelas Registradas</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-[#0F172A] p-10 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white/5 rounded-3xl"><ShieldCheck className="text-[#FF8FAB]" size={32} /></div>
            <div className="space-y-1">
               <p className="text-xs font-black uppercase tracking-widest text-[#FF8FAB]">Seguridad Financiera</p>
               <p className="text-[10px] text-slate-400 uppercase leading-relaxed max-w-lg">
                  Los valores configurados aquí afectarán los recargos automáticos que el sistema calcula para los apoderados.
               </p>
            </div>
         </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREAR (POST) */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-md bg-[#0F172A]/70 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 relative border-4 border-pink-100">
            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic mb-8">Nueva Pasarela</h2>
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full mb-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Nombre de Pasarela / Proveedor</label>
                <input 
                  type="text" required placeholder="Ej: Webpay Plus"
                  value={formData.NOMBRE_METODO} 
                  onChange={(e) => setFormData({...formData, NOMBRE_METODO: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Comisión %</label>
                <input 
                  type="number" step="0.01" required placeholder="Ej: 2.95"
                  value={formData.COMISION_PORCENTAJE} 
                  onChange={(e) => setFormData({...formData, COMISION_PORCENTAJE: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Comisión Fija ($)</label>
                <input 
                  type="number" required placeholder="Ej: 300"
                  value={formData.COMISION_FIJA} 
                  onChange={(e) => setFormData({...formData, COMISION_FIJA: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all" 
                />
              </div>

              <div className="col-span-full flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-[#0F172A] text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-[#0F172A]/20 italic">Registrar Método</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDITAR (PUT) */}
      {/* ======================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-md bg-[#0F172A]/80 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 relative border-4 border-indigo-100">
            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic mb-8">Ajustar Comisiones</h2>
            
            <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full mb-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Nombre</label>
                <input 
                  type="text" required
                  value={editData.NOMBRE_METODO} 
                  onChange={(e) => setEditData({...editData, NOMBRE_METODO: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Comisión %</label>
                <input 
                  type="number" step="0.01" required
                  value={editData.COMISION_PORCENTAJE} 
                  onChange={(e) => setEditData({...editData, COMISION_PORCENTAJE: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Comisión Fija ($)</label>
                <input 
                  type="number" required
                  value={editData.COMISION_FIJA} 
                  onChange={(e) => setEditData({...editData, COMISION_FIJA: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all" 
                />
              </div>
              
              <div className="col-span-full">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Estado</label>
                <select 
                  value={editData.ESTADO}
                  onChange={(e) => setEditData({...editData, ESTADO: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="col-span-full flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 italic">Guardar Cambios</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-8 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActivo = status?.toUpperCase() === "ACTIVO"
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
      isActivo ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'
    }`}>
      {isActivo ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {status || 'INACTIVO'}
    </div>
  )
}