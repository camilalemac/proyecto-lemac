"use client"
import React, { useState, useEffect } from "react"
import { 
  Mail, Search, AlertCircle, Loader2, Send, 
  Clock, ShieldAlert, CheckCircle2, ArrowLeft 
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function CobranzaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [morosos, setMorosos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [enviandoId, setEnviandoId] = useState<number | null>(null)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchMorosos = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }

        // 1. Validar identidad y Colegio (MS_IDENTITY vía 3007)
        const resMe = await fetch(`${GATEWAY_URL}/identity/me`, { headers })
        const dataMe = await resMe.json()

        if (dataMe.status === "success") {
          // Solo Tesorería puede entrar aquí
          const roles = dataMe.data?.roles || []
          const esTesorero = roles.some((r: any) => 
            ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU'].includes(r.rol_code)
          )

          if (!esTesorero) {
            setIsAuthorized(false)
            setLoading(false)
            return
          }

          setIsAuthorized(true)
          const colId = dataMe.data.perfil.colegio_id || 1

          // 2. Obtener deudores de la tabla PAG_CUENTAS_COBRAR (MS_PAGOS vía 3007)
          const res = await fetch(`${GATEWAY_URL}/pagos/cuotas/total-institucional/${colId}`, { headers })
          
          const contentType = res.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const json = await res.json()
            if (json.success && json.data) {
              // Filtramos morosidad real (PENDIENTE o VENCIDO)
              const deudores = json.data.filter((c: any) => 
                (c.ESTADO || c.estado) === 'PENDIENTE' || (c.ESTADO || c.estado) === 'VENCIDO'
              )
              setMorosos(deudores)
            }
          }
        } else {
          setIsAuthorized(false)
        }
      } catch (e) {
        console.error("Error al conectar con el microservicio de cobranza:", e);
      } finally {
        setLoading(false)
      }
    }
    fetchMorosos()
  }, [])

  const handleEnviarCorreo = async (moroso: any) => {
    // Usamos el COBRO_ID de Oracle
    setEnviandoId(moroso.COBRO_ID || moroso.cobro_id) 
    setNotificacion(null)
    
    try {
      const token = Cookies.get("auth-token")
      
      // Payload dinámico basado en los datos de la fila de la tabla
      const payloadCorreo = {
        destinatario: moroso.EMAIL || "contacto@apoderado.cl", 
        nombreApoderado: moroso.NOMBRE_COMPLETO || moroso.nombre_completo || "Apoderado Responsable",
        nombreAlumno: "Alumno Regular", 
        cuotas: [
          {
            concepto: moroso.DESCRIPCION || moroso.descripcion,
            monto: Number(moroso.MONTO_ORIGINAL || moroso.monto_original) - Number(moroso.MONTO_PAGADO || moroso.monto_pagado || 0),
            vencimiento: new Date(moroso.FECHA_VENCIMIENTO || moroso.fecha_vencimiento).toLocaleDateString('es-CL')
          }
        ],
        totalPendiente: Number(moroso.MONTO_ORIGINAL || moroso.monto_original) - Number(moroso.MONTO_PAGADO || moroso.monto_pagado || 0)
      }

      // MS_DOCUMENTOS/NOTIFICACIONES vía Gateway 3007
      const res = await fetch(`${GATEWAY_URL}/notificaciones/correos/pagos-pendientes`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadCorreo)
      })

      if (res.ok) {
        setNotificacion({ msg: `Recordatorio enviado a la bandeja del apoderado.`, tipo: 'success' })
      } else {
        throw new Error("No se pudo completar el envío de correo.")
      }
    } catch (e: any) {
      setNotificacion({ msg: e.message, tipo: 'error' })
    } finally {
      setEnviandoId(null)
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  const morososFiltrados = morosos.filter(m => 
    (m.NOMBRE_COMPLETO || m.nombre_completo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.RUT || m.rut || "").includes(busqueda)
  )

  const totalDeuda = morosos.reduce((acc, curr) => acc + (Number(curr.MONTO_ORIGINAL || curr.monto_original) - Number(curr.MONTO_PAGADO || curr.monto_pagado || 0)), 0)

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Escaneando Ledger de Deudas...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl text-center">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter italic">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-8">Usted no tiene los privilegios para realizar gestiones de cobranza institucional.</p>
        <button onClick={() => router.push('/login')} className="bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Ir al Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notificacion.tipo === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-xl">
            <Mail size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Centro de Cobranza</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Oracle Database Ledger Active</p>
          </div>
        </div>

        {morosos.length > 0 && (
          <div className="flex items-center gap-6 bg-[#FDF2F5] px-8 py-5 rounded-[2rem] border border-pink-100">
            <div>
              <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1">Monto en Riesgo</p>
              <h3 className="text-2xl font-black text-rose-600 tracking-tighter">${totalDeuda.toLocaleString('es-CL')}</h3>
            </div>
            <div className="h-10 w-px bg-pink-200" />
            <div>
              <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1">Cuentas Morosas</p>
              <h3 className="text-2xl font-black text-rose-600 tracking-tighter">{morosos.length}</h3>
            </div>
          </div>
        )}
      </header>

      {morosos.length > 0 && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[#FF8FAB] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por RUT o Apellido..."
            className="w-full pl-14 pr-6 py-2 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none placeholder:text-slate-300"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {morosos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-24 opacity-40">
            <CheckCircle2 size={80} className="mb-6 text-emerald-500" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A2E]">Cartera Saneada</h3>
            <p className="text-sm font-medium mt-2 max-w-sm text-slate-500 italic">
              No se detectan deudas vigentes en MS_PAGOS.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Apoderado</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Concepto</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Deuda Actual</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Día Vto.</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {morososFiltrados.map((m, i) => {
                  const esVencido = new Date(m.FECHA_VENCIMIENTO || m.fecha_vencimiento) < new Date()
                  const idUnico = m.COBRO_ID || m.cobro_id || i

                  return (
                    <tr key={idUnico} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-[#1A1A2E]">{m.NOMBRE_COMPLETO || m.nombre_completo || "SIN NOMBRE"}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-widest">{m.RUT || m.rut}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-600 uppercase">{m.DESCRIPCION || m.descripcion}</span>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-rose-500 tracking-tighter">
                          ${(Number(m.MONTO_ORIGINAL || m.monto_original) - Number(m.MONTO_PAGADO || m.monto_pagado || 0)).toLocaleString('es-CL')}
                        </p>
                      </td>
                      <td className="px-10 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${esVencido ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {esVencido ? <AlertCircle size={12}/> : <Clock size={12}/>}
                          {new Date(m.FECHA_VENCIMIENTO || m.fecha_vencimiento).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <button 
                          onClick={() => handleEnviarCorreo(m)}
                          disabled={enviandoId === idUnico}
                          className="inline-flex items-center gap-2 px-7 py-3 bg-[#1A1A2E] text-white rounded-2xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-md disabled:opacity-50 text-[10px] font-black uppercase tracking-widest italic"
                        >
                          {enviandoId === idUnico ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Notificar</>}
                        </button>
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