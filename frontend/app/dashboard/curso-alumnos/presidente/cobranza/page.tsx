"use client"
import { useState, useEffect } from "react"
import { Users, Loader2, ShieldAlert, ArrowLeft, Send, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"
import { notificacionService } from "../../../../../services/notificacionService"

export default function CobranzaCursoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [deudores, setDeudores] = useState<any[]>([])
  const [enviandoId, setEnviandoId] = useState<number | null>(null)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 1. Validar Identidad y Permisos
      const perfil = await authService.getMe()
      const rolesPermitidos = ['DIR_PRES_ALU', 'CEN_PRES_CAL']
      const esPresidente = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

      if (!esPresidente) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      const colId = perfil.COLEGIO_ID || 1
      const cursoId = (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1

      // 2. Obtener deudores desde Oracle (vía MS_PAGOS)
      const dataCobros = await pagosService.getCuentasPorCobrar(colId)
      
      // 3. Filtrar solo los PENDIENTES y que pertenezcan a este CURSO específico
      const morosos = dataCobros.filter((c: any) => {
        const estado = (c.ESTADO || c.estado || "").toUpperCase()
        const idCursoCobro = Number(c.CURSO_ID || c.curso_id)
        return (estado === 'PENDIENTE' || estado === 'VENCIDO') && idCursoCobro === Number(cursoId)
      })

      setDeudores(morosos)

    } catch (e) {
      console.error("Error al cargar cobranza:", e)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleNotificar = async (moroso: any) => {
    const idUnico = moroso.COBRO_ID || moroso.cobro_id
    setEnviandoId(idUnico)
    
    try {
      const montoPendiente = Number(moroso.MONTO_ORIGINAL || moroso.monto_original) - Number(moroso.MONTO_PAGADO || moroso.monto_pagado || 0)
      
      const payloadCorreo = {
        destinatario: moroso.EMAIL || moroso.email || "contacto@apoderado.cl", 
        nombreApoderado: moroso.NOMBRE_COMPLETO || moroso.nombre_completo || "Apoderado",
        concepto: moroso.DESCRIPCION || moroso.descripcion,
        totalPendiente: montoPendiente,
        vencimiento: new Date(moroso.FECHA_VENCIMIENTO || moroso.fecha_vencimiento).toLocaleDateString('es-CL')
      }

      // 4. Enviar notificación usando el servicio limpio
      await notificacionService.enviarRecordatorioPago(payloadCorreo)
      
      setNotificacion({ msg: "Recordatorio enviado con éxito al apoderado.", tipo: 'success' })
    } catch (e: any) {
      setNotificacion({ msg: e.message || "Fallo de comunicación con MS_NOTIFICACIONES", tipo: 'error' })
    } finally {
      setEnviandoId(null)
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-sky-500" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando deudores de su curso...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#F8FAFC]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">Este panel de gestión de morosidad es exclusivo para el Presidente de Curso.</p>
        <button onClick={() => router.push('/dashboard/alumno/curso-alumno')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 relative">
      
      {/* NOTIFICACIÓN FLOTANTE */}
      {notificacion && (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <CheckCircle2 size={18} />
          <p className="text-[10px] font-black uppercase tracking-widest">{notificacion.msg}</p>
        </div>
      )}

      <div className="p-10 bg-sky-50/30 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <Users className="text-sky-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">
              Morosidad de Curso
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión directa con apoderados</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-175">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Folio / Apoderado</th>
              <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Descripción Cobro</th>
              <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Monto Adeudado</th>
              <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Acción Directiva</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deudores.length > 0 ? deudores.map((d, i) => {
              const idUnico = d.COBRO_ID || d.cobro_id || i
              const descripcion = d.DESCRIPCION || d.descripcion
              const fechaVencimiento = new Date(d.FECHA_VENCIMIENTO || d.fecha_vencimiento).toLocaleDateString('es-CL')
              const deuda = Number(d.MONTO_ORIGINAL || d.monto_original) - Number(d.MONTO_PAGADO || d.monto_pagado || 0)
              const apoderadoNombre = d.NOMBRE_COMPLETO || d.nombre_completo || "Apoderado Asignado"

              return (
                <tr key={idUnico} className="group hover:bg-sky-50/20 transition-colors">
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-[#1A1A2E]">{apoderadoNombre}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID Cobro: #{idUnico}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-bold text-slate-600 uppercase">{descripcion}</p>
                    <p className="text-[9px] font-black text-rose-500 uppercase mt-1 tracking-widest">
                      Venció el: {fechaVencimiento}
                    </p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-lg font-black text-rose-600 tracking-tight">
                      ${deuda.toLocaleString('es-CL')}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button 
                      onClick={() => handleNotificar(d)}
                      disabled={enviandoId === idUnico}
                      className="inline-flex items-center gap-2 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-sky-500 transition-all shadow-md disabled:opacity-50"
                    >
                      {enviandoId === idUnico ? <Loader2 size={14} className="animate-spin"/> : <Send size={12}/>}
                      {enviandoId === idUnico ? 'Enviando...' : 'Notificar'}
                    </button>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={4} className="p-24 text-center">
                  <CheckCircle2 size={64} className="mx-auto text-emerald-400 mb-4 opacity-50" />
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">El curso no tiene deudas vigentes.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}