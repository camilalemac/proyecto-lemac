"use client"
import React, { useState, useEffect } from "react"
import { 
  UserCheck, Loader2, Search, ShieldCheck, Mail, Fingerprint,
  UserPlus, ServerOff, ArrowLeft
} from "lucide-react"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"

export default function ValidacionUsuariosPage() {
  const [loading, setLoading] = useState(true)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [procesandoId, setProcesandoId] = useState<number | null>(null)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const loadPendientes = async () => {
    try {
      setLoading(true)
      // Usamos el servicio limpio
      const pendientes = await authService.getUsuariosPendientes()
      setUsuarios(pendientes)
      setErrorGlobal(null)
    } catch (e: any) {
      setErrorGlobal(e.message || "Error al conectar con Identity Service")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadPendientes() 
  }, [])

  const handleAprobar = async (id: number) => {
    setProcesandoId(id)
    try {
      // Usamos el servicio limpio
      await authService.activarUsuario(id)
      
      setNotificacion({ msg: "Acceso autorizado en Oracle DB", tipo: 'success' })
      // Quitar de la vista localmente para que la UI sea rápida
      setUsuarios(prev => prev.filter(u => (u.USER_ID || u.userId) !== id))
    } catch (e: any) {
      setNotificacion({ msg: e.message || "Error en la validación", tipo: 'error' })
    } finally {
      setProcesandoId(null)
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  // Búsqueda flexible para mayúsculas/minúsculas
  const filtrados = usuarios.filter(u => {
    const nombres = (u.NOMBRES || u.nombres || "").toLowerCase()
    const apellidos = (u.APELLIDOS || u.apellidos || "").toLowerCase()
    const rut = (u.RUT_CUERPO || u.rut_cuerpo || "")
    const busq = busqueda.toLowerCase()
    
    return nombres.includes(busq) || apellidos.includes(busq) || rut.includes(busq)
  })

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-sky-500" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verificando solicitudes pendientes...</p>
    </div>
  )

  if (errorGlobal) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-8 bg-[#F8FAFC]">
      <ServerOff size={80} className="mb-6 text-rose-400 opacity-20" />
      <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Falla de Sincronización</h2>
      <p className="text-sm font-bold text-rose-500 mt-2">{errorGlobal}</p>
      <button 
        onClick={loadPendientes} 
        className="mt-8 px-8 py-3 bg-[#1A1A2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
      >
        Reintentar Conexión
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <ShieldCheck size={20} />
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      {/* Botón Volver */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/cpad/tesorero-cpad" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard Tesorería
        </Link>
      </div>

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-sky-400 shadow-xl shadow-slate-900/10">
            <Fingerprint size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Validación de Usuarios</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Aprobación de acceso a la plataforma
            </p>
          </div>
        </div>
        
        <div className="relative w-full lg:max-w-xs group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por RUT o Apellido..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-xs font-bold focus:ring-4 focus:ring-sky-500/20 outline-none transition-all text-[#1A1A2E]"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-100 flex flex-col">
        {usuarios.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
            <UserCheck size={80} className="mb-6 text-emerald-500" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A2E]">Bandeja Limpia</h3>
            <p className="text-sm font-medium mt-2 italic text-slate-500">No hay cuentas de apoderados pendientes de validación.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-7 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identidad Solicitante</th>
                  <th className="px-10 py-7 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">RUT / Contacto</th>
                  <th className="px-10 py-7 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Estado MS_IDENTITY</th>
                  <th className="px-10 py-7 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Firma Digital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((u) => {
                  const id = u.USER_ID || u.user_id;
                  const nombre = u.NOMBRES || u.nombres || "";
                  const apellido = u.APELLIDOS || u.apellidos || "";
                  const email = u.EMAIL || u.email || "Sin correo";
                  const rut = u.RUT_CUERPO || u.rut_cuerpo;
                  const dv = u.RUT_DV || u.rut_dv;
                  const estado = (u.ESTADO || u.estado || "PENDIENTE").toUpperCase();

                  return (
                    <tr key={id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 font-black text-sm uppercase shadow-inner">
                            {nombre[0] || "U"}{apellido[0] || ""}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1A1A2E] uppercase tracking-tight">{nombre} {apellido}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID DB: #{id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <p className="text-xs font-black text-slate-600 tracking-wider bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                          {rut}-{dv}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400">
                          <Mail size={12} />
                          <p className="text-[10px] font-medium">{email}</p>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100">
                          {estado}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <button 
                          onClick={() => handleAprobar(id)}
                          disabled={procesandoId === id}
                          className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 ml-auto disabled:opacity-50 disabled:shadow-none"
                        >
                          {procesandoId === id ? <Loader2 className="animate-spin" size={16}/> : <UserPlus size={16}/>}
                          {procesandoId === id ? 'Validando...' : 'Autorizar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}