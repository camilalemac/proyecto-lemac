"use client"
import React, { useState, useEffect } from "react"
import { 
  UserCheck, Loader2, Search, ShieldCheck, Mail, Fingerprint,
  UserPlus, ServerOff, AlertCircle
} from "lucide-react"
import Cookies from "js-cookie"

export default function ValidacionUsuariosPage() {
  const [loading, setLoading] = useState(true)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [procesandoId, setProcesandoId] = useState<number | null>(null)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const fetchPendientes = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("auth-token")
      if (!token) throw new Error("No hay sesión activa. Falta el auth-token.")

      const res = await fetch("http://127.0.0.1:3007/api/v1/identity/usuarios", {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const json = await res.json()
      
      if (res.ok && json.data) {
        // Filtramos usuarios que están esperando validación (PENDIENTE)
        // Usamos mayúsculas porque Oracle/Sequelize suelen devolverlas así
        const pendientes = json.data.filter((u: any) => u.ESTADO !== 'ACTIVO' && u.ESTADO !== 'activo')
        setUsuarios(pendientes)
        setErrorGlobal(null)
      } else {
        throw new Error(json.message || "Error al obtener datos de Identity")
      }
    } catch (e: any) {
      setErrorGlobal(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPendientes() }, [])

  const handleAprobar = async (id: number) => {
    setProcesandoId(id)
    try {
      const token = Cookies.get("auth-token")
      const res = await fetch(`http://127.0.0.1:3007/api/v1/identity/usuarios/${id}`, {
        method: "PUT",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ estado: "ACTIVO" })
      })

      if (res.ok) {
        setNotificacion({ msg: "Usuario activado en base de datos", tipo: 'success' })
        // Quitamos al usuario de la lista localmente
        setUsuarios(usuarios.filter(u => (u.USER_ID || u.userId) !== id))
      } else {
        const err = await res.json()
        throw new Error(err.message || "Error al actualizar")
      }
    } catch (e: any) {
      setNotificacion({ msg: e.message, tipo: 'error' })
    } finally {
      setProcesandoId(null)
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  const filtrados = usuarios.filter(u => 
    (u.NOMBRES || u.nombres)?.toLowerCase().includes(busqueda.toLowerCase()) || 
    (u.RUT_CUERPO || u.rutCuerpo)?.includes(busqueda)
  )

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando registros en Identity...</p>
    </div>
  )

  if (errorGlobal) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-8">
      <ServerOff size={80} className="mb-6 text-rose-400 opacity-20" />
      <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Error de Acceso</h2>
      <p className="text-sm font-bold text-rose-500 mt-2">{errorGlobal}</p>
      <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-[#1A1A2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Reintentar</button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-110 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <ShieldCheck size={20} />
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-sky-400 shadow-xl">
            <Fingerprint size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Validación de Usuarios</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aprobación de acceso a la plataforma</p>
          </div>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por RUT o Nombre..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-sky-400 outline-none transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-100">
        {usuarios.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center opacity-30">
            <UserCheck size={80} className="mb-6 text-emerald-400" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Sin solicitudes</h3>
            <p className="text-sm font-medium mt-2">No hay usuarios pendientes de validación.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Usuario</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">RUT / Email</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Estado Oracle</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map((u) => {
                  const id = u.USER_ID || u.userId;
                  const nombre = u.NOMBRES || u.nombres;
                  const apellido = u.APELLIDOS || u.apellidos;
                  const email = u.EMAIL || u.email;
                  const rut = u.RUT_CUERPO || u.rutCuerpo;
                  const dv = u.RUT_DV || u.rutDv;
                  const estado = u.ESTADO || u.estado;

                  return (
                    <tr key={id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 font-black text-xs uppercase">
                            {nombre?.[0]}{apellido?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1A1A2E] uppercase">{nombre} {apellido}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: #{id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <p className="text-[11px] font-black text-slate-600">{rut}-{dv}</p>
                        <div className="flex items-center justify-center gap-1 mt-1 text-slate-400">
                          <Mail size={10} />
                          <p className="text-[10px] font-medium">{email}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                         <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
                           {estado}
                         </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => handleAprobar(id)}
                          disabled={procesandoId === id}
                          className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2 ml-auto"
                        >
                          {procesandoId === id ? <Loader2 className="animate-spin" size={14}/> : <UserPlus size={14}/>}
                          Activar
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