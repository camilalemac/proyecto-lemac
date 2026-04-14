"use client"
import React, { useState, useEffect } from "react"
import { 
  Landmark, Plus, Loader2, Trash2, Edit3, 
  CheckCircle2, AlertCircle, ServerOff, X, Save,
  Power, PowerOff, Building2, CreditCard
} from "lucide-react"
import Cookies from "js-cookie"

export default function GestionCuentasPage() {
  const [loading, setLoading] = useState(true)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [cuentas, setCuentas] = useState<any[]>([])
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)
  
  const [form, setForm] = useState({
    NOMBRE_CUENTA: "",
    BANCO: "",
    CURSO_ID: 1, 
    ACTIVO: true
  })

  const fetchCuentas = async () => {
    try {
      const token = Cookies.get("auth-token")
      if (!token) throw new Error("Sesión no encontrada.")
      const res = await fetch("http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias", {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Error al conectar con MS_PAGOS")
      const json = await res.json()
      if (json.success) setCuentas(json.data)
    } catch (e: any) {
      setErrorGlobal(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCuentas() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)
    try {
      const token = Cookies.get("auth-token")
      const url = editandoId 
        ? `http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias/${editandoId}`
        : "http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias"
      
      const res = await fetch(url, {
        method: editandoId ? "PUT" : "POST",
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setNotificacion({ msg: "Guardado en Oracle exitosamente", tipo: 'success' })
        cerrarModal()
        fetchCuentas()
      } else {
        throw new Error(json.message || "Error en el servidor")
      }
    } catch (e: any) {
      setNotificacion({ msg: e.message, tipo: 'error' })
    } finally {
      setProcesando(false)
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar cuenta? Solo es posible si el saldo es $0.")) return
    try {
      const token = Cookies.get("auth-token")
      const res = await fetch(`http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias/${id}`, {
        method: "DELETE", headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) { fetchCuentas(); setNotificacion({msg: "Cuenta eliminada", tipo: 'success'}); }
      else throw new Error("No se puede eliminar cuenta con saldo.");
    } catch (e: any) { setNotificacion({msg: e.message, tipo: 'error'}); }
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditandoId(null)
    setForm({ NOMBRE_CUENTA: "", BANCO: "", CURSO_ID: 1, ACTIVO: true })
  }

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#FF8FAB]" size={40} /></div>

  if (errorGlobal) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-8">
      <ServerOff size={80} className="mb-6 text-rose-400 opacity-20" />
      <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Sin Conexión</h2>
      <p className="text-sm font-bold text-rose-500 mt-2">{errorGlobal}</p>
      <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-[#1A1A2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Reintentar</button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-110 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <CheckCircle2 size={20} />
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-xl"><Building2 size={32} /></div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Cuentas Bancarias</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de canales de recaudación oficial</p>
          </div>
        </div>
        <button onClick={() => { cerrarModal(); setModalAbierto(true); }} className="flex items-center gap-2 px-8 py-4 bg-[#1A1A2E] text-white rounded-3xl font-black uppercase text-[10px] shadow-lg hover:bg-slate-800 transition-all"><Plus size={18} /> Nueva Cuenta</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cuentas.map((c) => (
          <div key={c.CUENTA_ID} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${c.ACTIVO === 'S' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}><Landmark size={24} /></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => {
                  setEditandoId(c.CUENTA_ID);
                  setForm({ NOMBRE_CUENTA: c.NOMBRE_CUENTA, BANCO: c.BANCO || "", CURSO_ID: c.CURSO_ID, ACTIVO: c.ACTIVO === 'S' });
                  setModalAbierto(true);
                }} className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={18}/></button>
                <button onClick={() => handleEliminar(c.CUENTA_ID)} className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#1A1A2E] uppercase tracking-tighter">{c.NOMBRE_CUENTA}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Building2 size={12} className="text-[#FF8FAB]" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.BANCO || "BANCO NO ASIGNADO"}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Saldo en Oracle</p>
                <p className="text-2xl font-black text-[#1A1A2E]">${Number(c.SALDO_ACTUAL).toLocaleString('es-CL')}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${c.ACTIVO === 'S' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {c.ACTIVO === 'S' ? <Power size={10} /> : <PowerOff size={10} />}
                <span className="text-[9px] font-black uppercase tracking-tighter">{c.ACTIVO === 'S' ? 'Activa' : 'Inactiva'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-[#1A1A2E]/80 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter">{editandoId ? 'Editar Parámetros' : 'Nueva Cuenta'}</h2>
              <button onClick={cerrarModal} className="p-3 hover:bg-white rounded-full text-slate-400 transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre y Número de Cuenta</label>
                <input required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#FF8FAB] outline-none" placeholder="Ej: Operativa - N° 12345678" value={form.NOMBRE_CUENTA} onChange={e => setForm({...form, NOMBRE_CUENTA: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Banco</label>
                <input required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#FF8FAB] outline-none" placeholder="Ej: Banco Estado" value={form.BANCO} onChange={e => setForm({...form, BANCO: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">ID Curso</label>
                  <input type="number" required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#FF8FAB] outline-none" value={form.CURSO_ID} onChange={e => setForm({...form, CURSO_ID: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Estado</label>
                  <button type="button" onClick={() => setForm({...form, ACTIVO: !form.ACTIVO})} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${form.ACTIVO ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 'bg-rose-50 text-rose-600 border-2 border-rose-100'}`}>
                    {form.ACTIVO ? 'Operativa' : 'Inactiva'}
                  </button>
                </div>
              </div>

              <button disabled={procesando} type="submit" className="w-full py-5 bg-[#1A1A2E] text-white rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all mt-4">
                {procesando ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                {editandoId ? 'Guardar Cambios' : 'Registrar Cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}