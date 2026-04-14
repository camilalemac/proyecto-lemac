"use client"
import React, { useState } from "react"
import { FilePlus2, ArrowLeft, Loader2, Save, CheckCircle2, PieChart, TrendingUp, TrendingDown, Users } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function GenerarReportePage() {
  const router = useRouter()
  const [procesando, setProcesando] = useState(false)
  const [tipo, setTipo] = useState("mensual")
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    try {
      const token = Cookies.get("auth-token")
      if (!token) throw new Error("No tienes una sesión activa.")

      // Payload real requerido por tu 'reporte.service.ts'
      const payload = {
        titulo: `Balance Financiero Institucional - ${tipo.toUpperCase()}`,
        colegio: "Liceo Juana Ross de Edwards",
        periodo: new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
        tipoPeriodo: tipo,
        generadoPor: "Tesorero LemacPay",
        ingresos: [], 
        egresos: [],
        cuotasPagadas: [],
        cuotasPendientes: [],
        saldoInicial: 0,
        saldoFinal: 0
      }

      const res = await fetch("http://127.0.0.1:3007/api/v1/notificaciones/reportes/generar", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (res.ok && json.success) {
        setNotificacion({ msg: "PDF generado y subido a Google Drive exitosamente", tipo: 'success' })
        // Redirigir al historial después de 2 segundos para ver el reporte nuevo
        setTimeout(() => router.push("/dashboard/apoderado/tesorero-cpad/reportes"), 2000)
      } else {
        throw new Error(json.message || "Error al procesar el reporte")
      }
    } catch (e: any) {
      setNotificacion({ msg: e.message, tipo: 'error' })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-110 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <CheckCircle2 size={20} />
          <p className="text-xs font-black uppercase tracking-widest">{notificacion.msg}</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Link href="/dashboard/apoderado/tesorero-cpad/reportes" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-colors group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Volver al Archivo
        </Link>
        <div className="flex items-center gap-6">
          <div className="bg-amber-500 p-5 rounded-4xl text-white shadow-xl shadow-amber-100"><FilePlus2 size={32} /></div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Nuevo Reporte Oficial</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generación automática de PDF con sello Oracle</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Configuración</h3>
            <form onSubmit={handleGenerar} className="space-y-6">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-xs font-bold focus:ring-2 focus:ring-amber-400 outline-none">
                <option value="mensual">Balance Mensual</option>
                <option value="trimestral">Balance Trimestral</option>
                <option value="anual">Balance Anual</option>
              </select>
              <button disabled={procesando} className="w-full py-5 bg-[#1A1A2E] text-white rounded-3xl font-black uppercase text-[10px] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                {procesando ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Generar y Firmar
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm text-center">
            <PieChart size={80} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter mb-4">Listo para Procesar</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-8 font-medium">Al presionar el botón, el microservicio consolidará todos los registros de Oracle para generar el PDF inmutable y lo guardará en el historial.</p>
            <div className="grid grid-cols-3 gap-4 border-t pt-8 border-slate-50">
              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ingresos</p><p className="font-black text-emerald-500">Pendiente</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Egresos</p><p className="font-black text-rose-500">Pendiente</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Oracle Sync</p><p className="font-black text-sky-500">OK</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}