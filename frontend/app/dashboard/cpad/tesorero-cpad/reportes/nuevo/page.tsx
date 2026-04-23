"use client"
import React, { useState } from "react"
import { FilePlus2, ArrowLeft, Loader2, Save, CheckCircle2, PieChart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA (Sube 6 niveles)
import { reporteService } from "../../../../../../services/reporteService"

export default function GenerarReportePage() {
  const router = useRouter()
  const [procesando, setProcesando] = useState(false)
  const [tipo, setTipo] = useState("mensual")
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    try {
      // Usamos el payload que tu microservicio espera
      const payload = {
        titulo: `Balance Financiero Institucional - ${tipo.toUpperCase()}`,
        periodo: new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
        tipoPeriodo: tipo,
        // Al enviar esto, el backend debería encargarse de calcular los totales
        // consultando a MS_PAGOS internamente (o puedes enviar ingresos/egresos si ya los calculaste antes)
        ingresos: [], 
        egresos: [],
        cuotasPagadas: [],
        cuotasPendientes: [],
        saldoInicial: 0,
        saldoFinal: 0
      }

      // 1. Llamar al servicio limpio
      const resultado = await reporteService.createActa(payload)

      if (resultado) {
        setNotificacion({ msg: "PDF generado y archivado exitosamente", tipo: 'success' })
        
        // 2. Redirigir al historial después de 2 segundos
        setTimeout(() => router.push("/dashboard/cpad/tesorero-cpad/reportes"), 2000)
      }
    } catch (e: any) {
      setNotificacion({ msg: e.message || "Error al procesar el reporte", tipo: 'error' })
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
        <Link href="/dashboard/cpad/tesorero-cpad/reportes" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-colors group text-[10px] font-black uppercase tracking-widest max-w-max bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver al Archivo
        </Link>
        <div className="flex items-center gap-6 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
          <div className="bg-amber-500 p-5 rounded-3xl text-white shadow-xl shadow-amber-200"><FilePlus2 size={32} /></div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Nuevo Reporte Oficial</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Generación automática de PDF con sello Oracle
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL DE CONFIGURACIÓN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b border-slate-50 pb-4">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
              Configuración
            </h3>
            
            <form onSubmit={handleGenerar} className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest ml-2">Periodo Fiscal</label>
                <select 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)} 
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl text-xs font-bold focus:ring-2 focus:ring-amber-400 outline-none text-[#1A1A2E] cursor-pointer transition-all"
                >
                  <option value="mensual">Balance Mensual</option>
                  <option value="trimestral">Balance Trimestral</option>
                  <option value="anual">Balance Anual</option>
                </select>
              </div>

              <button 
                disabled={procesando} 
                className="w-full py-6 bg-[#1A1A2E] text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
              >
                {procesando ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                {procesando ? 'Sincronizando...' : 'Generar y Firmar'}
              </button>
            </form>
          </div>
        </div>

        {/* PANEL INFORMATIVO */}
        <div className="lg:col-span-2">
          <div className="bg-[#1A1A2E] p-12 rounded-[3.5rem] border shadow-2xl text-center h-full flex flex-col justify-center relative overflow-hidden border-b-8 border-amber-500">
            <PieChart size={120} className="absolute -right-6 -top-6 text-white/5" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 z-10">Listo para Procesar</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-8 font-medium z-10">
              Al presionar el botón, el microservicio de reportes consolidará todos los registros contables de Oracle para generar un documento PDF inmutable.
            </p>
            
            <div className="grid grid-cols-3 gap-4 border-t border-slate-800/50 pt-8 z-10 max-w-lg mx-auto w-full">
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Ingresos</p>
                <p className="font-black text-emerald-400 text-sm">Automático</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Egresos</p>
                <p className="font-black text-rose-400 text-sm">Automático</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Oracle Sync</p>
                <p className="font-black text-sky-400 text-sm">OK</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}