"use client"
import React, { useState, useEffect } from "react"
import { 
  Mail, Search, AlertCircle, Loader2, Send, 
  Clock, ShieldAlert, CheckCircle2, ArrowLeft 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"
import { notificacionService } from "../../../../../services/notificacionService"

export default function CobranzaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [morosos, setMorosos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [enviandoId, setEnviandoId] = useState<number | null>(null)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Identidad y Rol
        const perfil = await authService.getMe()
        const rolesTesoreria = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU']
        const esTesorero = perfil.roles?.some((r: any) => rolesTesoreria.includes(r.rol_code))

        if (!esTesorero) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)
        const colId = perfil.COLEGIO_ID || 1

        // 2. Obtener morosos reales del Microservicio de Pagos
        const dataMorosos = await pagosService.getDeudoresInstitucionales(colId)
        
        // Filtramos deudores con saldo pendiente
        const filtrados = dataMorosos.filter((c: any) => 
          (c.ESTADO || c.estado) === 'PENDIENTE' || (c.ESTADO || c.estado) === 'VENCIDO'
        )
        setMorosos(filtrados)

      } catch (e: any) {
        console.error("Falla en carga de cobranza:", e)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }
    initPage()
  }, [])

  const handleEnviarCorreo = async (moroso: any) => {
    const idUnico = moroso.COBRO_ID || moroso.cobro_id
    setEnviandoId(idUnico) 
    setNotificacion(null)
    
    try {
      const payloadCorreo = {
        destinatario: moroso.EMAIL || moroso.email || "contacto@apoderado.cl", 
        nombreApoderado: moroso.NOMBRE_COMPLETO || moroso.nombre_completo || "Apoderado",
        concepto: moroso.DESCRIPCION || moroso.descripcion,
        totalPendiente: Number(moroso.MONTO_ORIGINAL || moroso.monto_original) - Number(moroso.MONTO_PAGADO || moroso.monto_pagado || 0),
        vencimiento: new Date(moroso.FECHA_VENCIMIENTO || moroso.fecha_vencimiento).toLocaleDateString('es-CL')
      }

      // Llamada al Microservicio de Notificaciones
      await notificacionService.enviarRecordatorioPago(payloadCorreo)

      setNotificacion({ msg: `Recordatorio enviado exitosamente.`, tipo: 'success' })
    } catch (e: any) {
      setNotificacion({ msg: e.message || "Error al enviar correo", tipo: 'error' })
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
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Escaneando Ledger de Deudas...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl text-center">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-8">Usted no tiene los privilegios para realizar gestiones de cobranza institucional.</p>
        <Link href="/dashboard/cpad/tesorero-cpad" className="bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto max-w-max">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
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

      {/* HEADER */}
      <div className="flex items-center">
        <Link href="/dashboard/cpad/tesorero-cpad" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Panel de Tesorería
        </Link>
      </div>

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-xl">
            <Mail size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none">Centro de Cobranza</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Oracle Database Ledger Active</p>
          </div>
        </div>

        {morosos.length > 0 && (
          <div className="flex items-center gap-6 bg-slate-50 px-8 py-5 rounded-4xl border border-slate-100">
            <div>
              <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1">Monto en Riesgo</p>
              <h3 className="text-2xl font-black text-rose-600 tracking-tighter">${totalDeuda.toLocaleString('es-CL')}</h3>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Cuentas Morosas</p>
              <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tighter">{morosos.length}</h3>
            </div>
          </div>
        )}
      </header>

      {/* BUSCADOR */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[#FF8FAB] transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Filtrar deudores por RUT o Nombre completo..."
          className="w-full pl-14 pr-6 py-2 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none placeholder:text-slate-300"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA DE MOROSIDAD */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {morosos.length === 0 ? (
          <div className="p-24 text-center opacity-40">
            <CheckCircle2 size={80} className="mb-6 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-[#1A1A2E]">Cartera Saneada</h3>
            <p className="text-xs font-medium text-slate-500 italic mt-1">No se detectan deudas vigentes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Apoderado Responsable</th>
                  <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Concepto de Deuda</th>
                  <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Monto Neto</th>
                  <th className="px-10 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {morososFiltrados.map((m, i) => {
                  const idUnico = m.COBRO_ID || m.cobro_id || i
                  const montoPendiente = Number(m.MONTO_ORIGINAL || m.monto_original) - Number(m.MONTO_PAGADO || m.monto_pagado || 0)
                  return (
                    <tr key={idUnico} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-[#1A1A2E]">{m.NOMBRE_COMPLETO || m.nombre_completo}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-widest">{m.RUT || m.rut}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-600 uppercase">{m.DESCRIPCION || m.descripcion}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <p className="text-sm font-black text-rose-500 tracking-tight">${montoPendiente.toLocaleString('es-CL')}</p>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <button 
                          onClick={() => handleEnviarCorreo(m)}
                          disabled={enviandoId === idUnico}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A2E] text-white rounded-2xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-md disabled:opacity-50 text-[9px] font-black uppercase tracking-widest"
                        >
                          {enviandoId === idUnico ? <Loader2 className="animate-spin" size={14} /> : <><Send size={12} /> Notificar</>}
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