"use client"
import React, { useState, useEffect } from "react"
import { 
  FileSignature, Search, CheckCircle2, XCircle, 
  Clock, Loader2, AlertCircle, UserCheck, ShieldAlert, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function ExencionesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [exenciones, setExenciones] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [procesandoId, setProcesandoId] = useState<number | null>(null)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const loadExenciones = async () => {
    try {
      setLoading(true)
      const data = await pagosService.getExenciones()
      setExenciones(data)
    } catch (e) {
      console.error("Error al conectar con el Ledger de exenciones.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const perfil = await authService.getMe()
        const rolesTesoreria = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU']
        const esTesorero = perfil.roles?.some((r: any) => rolesTesoreria.includes(r.rol_code))
        
        if (esTesorero) {
          setIsAuthorized(true)
          await loadExenciones()
        } else {
          setIsAuthorized(false)
        }
      } catch (e) {
        setIsAuthorized(false)
      } finally {
        setAuthLoading(false)
      }
    }
    verifyAuth()
  }, [])

  const handleRevision = async (exencionId: number, aprobado: boolean) => {
    setProcesandoId(exencionId)
    setNotificacion(null)
    
    try {
      let observacion = null;
      if (!aprobado) {
        observacion = window.prompt("Indique el motivo del rechazo para el acta:")
        if (observacion === null) {
          setProcesandoId(null)
          return 
        }
      }

      await pagosService.revisarExencionTesorero(exencionId, aprobado, observacion)

      setNotificacion({ msg: `Firma aplicada: Solicitud ${aprobado ? 'Aprobada' : 'Rechazada'}`, tipo: 'success' })
      await loadExenciones() // Refrescar datos reales de Oracle
    } catch (e: any) {
      setNotificacion({ msg: e.message || "Error en el visado contable", tipo: 'error' })
    } finally {
      setProcesandoId(null)
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  const filtradas = exenciones.filter(e => 
    (e.MOTIVO || e.motivo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.cobro?.DESCRIPCION || e.cobro?.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
  )

  if (authLoading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#1A1A2E]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consultando Ledger de Exenciones...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#F8FAFC]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-rose-100 shadow-xl">
        <ShieldAlert size={60} className="text-rose-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter italic">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-10">Solo los miembros de la Directiva de Tesorería pueden visar exenciones de pago.</p>
        <button onClick={() => router.push('/dashboard/cpad/tesorero-cpad')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Volver al Panel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notificacion.tipo === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      {/* Botón Volver */}
      <div className="flex items-center">
        <Link href="/dashboard/cpad/tesorero-cpad" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Regresar a Tesorería
        </Link>
      </div>

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-3xl text-sky-400 shadow-xl shadow-slate-900/10">
            <FileSignature size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Visado de Exenciones</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" /> Protocolo de Doble Firma Activo
            </p>
          </div>
        </div>
      </header>

      {/* BÚSQUEDA */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por motivo o descripción del cobro..."
          className="w-full pl-14 pr-6 py-2 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none text-[#1A1A2E]"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-100">
        {exenciones.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
            <CheckCircle2 size={80} className="mb-6 text-sky-400" strokeWidth={1} />
            <h3 className="text-2xl font-black uppercase tracking-tighter">Bandeja Vacía</h3>
            <p className="text-sm font-medium mt-2 text-slate-500 italic">No hay deudas por eximir registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-7 text-[9px] font-black uppercase text-slate-400 tracking-widest">Cobro / Fecha</th>
                  <th className="px-10 py-7 text-[9px] font-black uppercase text-slate-400 tracking-widest">Motivo Declarado</th>
                  <th className="px-10 py-7 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Firma Profesor</th>
                  <th className="px-10 py-7 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Estado Oracle</th>
                  <th className="px-10 py-7 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Acción Tesorería</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtradas.map((e, i) => {
                  const idUnico = e.EXENCION_ID || e.exencion_id
                  const estado = e.ESTADO_FINAL || e.estado_final
                  const checkTesorero = e.CHECK_TESORERO || e.check_tesorero
                  const checkProfesor = e.CHECK_PROFESOR || e.check_profesor

                  return (
                    <tr key={idUnico} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-7">
                        <p className="text-[10px] font-bold text-slate-400 mb-1">
                          {new Date(e.FECHA_SOLICITUD || e.fecha_solicitud).toLocaleDateString('es-CL')}
                        </p>
                        <p className="text-sm font-black text-[#1A1A2E]">{e.cobro?.DESCRIPCION || e.cobro?.descripcion || `ID: ${e.COBRO_ID}`}</p>
                        <p className="text-[9px] font-black text-rose-500 tracking-tighter mt-1 italic">
                          ${Number(e.cobro?.MONTO_ORIGINAL || e.cobro?.monto_original || 0).toLocaleString('es-CL')}
                        </p>
                      </td>
                      <td className="px-10 py-7 max-w-xs">
                        <p className="text-xs font-medium text-slate-600 italic line-clamp-3 leading-relaxed border-l-2 border-slate-100 pl-4">
                          "{e.MOTIVO || e.motivo}"
                        </p>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <div className="flex justify-center">
                          {checkProfesor === 'S' ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                              <UserCheck size={14} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Validado</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                              <Clock size={14} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Pendiente</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className={`inline-flex items-center px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                          estado === 'APROBADO' ? 'bg-emerald-500 text-white border-emerald-600' : 
                          estado === 'RECHAZADO' ? 'bg-rose-500 text-white border-rose-600' : 
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {estado}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-center">
                        {estado === 'PENDIENTE' && checkTesorero === 'N' ? (
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleRevision(idUnico, true)}
                              disabled={procesandoId === idUnico}
                              className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                              title="Aprobar Solicitud"
                            >
                              {procesandoId === idUnico ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18} />}
                            </button>
                            <button 
                              onClick={() => handleRevision(idUnico, false)}
                              disabled={procesandoId === idUnico}
                              className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                              title="Rechazar Solicitud"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest italic leading-none">
                            {checkTesorero === 'S' ? 'Trámite Procesado' : 'Sin Acción'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}