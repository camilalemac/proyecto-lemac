"use client"
import React, { useState, useEffect } from "react"
import { 
  Receipt, Search, Mail, CheckCircle2, Clock, 
  AlertTriangle, Loader2, Users, ShieldAlert, ArrowLeft 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function CuotasTesoreriaPage() {
  const router = useRouter()
  const [busquedaId, setBusquedaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cuotasAlumno, setCuotasAlumno] = useState<any[]>([])
  const [resumen, setResumen] = useState<any>(null)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const perfil = await authService.getMe()
        const rolesTesoreria = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU']
        const esTesorero = perfil.roles?.some((r: any) => rolesTesoreria.includes(r.rol_code))
        setIsAuthorized(!!esTesorero)
      } catch (e) {
        setIsAuthorized(false)
      } finally {
        setAuthLoading(false)
      }
    }
    verifyAuth()
  }, [])

  const handleBuscarCobros = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!busquedaId.trim()) return

    setLoading(true)
    setError(null)
    setCuotasAlumno([])
    setResumen(null)

    try {
      // 1. Obtener Detalle desde el Servicio
      const dataCobros = await pagosService.getDetalleCuotasAlumno(busquedaId)
      setCuotasAlumno(dataCobros)

      // 2. Obtener Resumen desde el Servicio
      const dataResumen = await pagosService.getResumenCuotasAlumno(busquedaId)
      setResumen(dataResumen)

    } catch (err: any) {
      setError(err.message || "No se encontraron deudas para este ID.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verificando Credenciales...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10">Solo personal de Tesorería puede auditar cobros individuales.</p>
        <button onClick={() => router.push('/dashboard/cpad/tesorero-cpad')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all hover:bg-slate-800">
          <ArrowLeft size={16} /> Volver al Panel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER DE BÚSQUEDA */}
      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6 mb-10">
          <div className="bg-[#1A1A2E] p-5 rounded-2xl text-[#FF8FAB] shadow-xl">
            <Users size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Cobros Individuales</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincronizado con Oracle Ledger
            </p>
          </div>
        </div>

        <form onSubmit={handleBuscarCobros} className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF8FAB] transition-colors" size={20} />
            <input 
              type="number" 
              placeholder="Ingrese ID del Estudiante..."
              className="w-full pl-14 pr-6 py-6 bg-slate-50 border-none rounded-4xl text-sm font-black focus:ring-4 focus:ring-[#FF8FAB]/20 outline-none transition-all text-[#1A1A2E]"
              value={busquedaId}
              onChange={(e) => setBusquedaId(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-12 bg-[#1A1A2E] text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-4xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Ejecutar Auditoría'}
          </button>
        </form>
      </header>

      {error && (
        <div className="bg-rose-50 p-6 rounded-4xl border border-rose-100 flex items-center gap-4 text-rose-600 shadow-sm animate-in zoom-in-95">
          <AlertTriangle size={24} strokeWidth={2} />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {!loading && cuotasAlumno.length > 0 && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          {resumen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ResumenCard title="Monto Pagado" value={resumen.totalPagado} color="text-emerald-500" />
              <ResumenCard title="Deuda Pendiente" value={resumen.totalPendiente} color="text-rose-600" />
              <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center relative overflow-hidden">
                <p className="text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest mb-1 z-10">Cumplimiento</p>
                <h3 className="text-3xl font-black text-white z-10">{Number(resumen.porcentajePagado || 0).toFixed(1)}%</h3>
                <Receipt size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-225">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Concepto</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Vencimiento</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Monto</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Pagado</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Estado</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Notificar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cuotasAlumno.map((c: any, i: number) => {
                    const estado = (c.ESTADO || c.estado || 'PENDIENTE').toUpperCase()
                    const esVencido = new Date(c.FECHA_VENCIMIENTO || c.fecha_vencimiento) < new Date() && estado !== 'PAGADO'
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-[#1A1A2E]">{c.DESCRIPCION || c.descripcion}</p>
                          <p className="text-[9px] font-bold text-[#FF8FAB] uppercase mt-1 tracking-widest italic">Item #{c.COBRO_ID || c.cobro_id}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className={`text-xs font-bold ${esVencido ? 'text-rose-500' : 'text-slate-500'}`}>
                            {new Date(c.FECHA_VENCIMIENTO || c.fecha_vencimiento).toLocaleDateString('es-CL')}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="text-sm font-black text-[#1A1A2E]">${Number(c.MONTO_ORIGINAL || c.monto_original || 0).toLocaleString('es-CL')}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className={`text-sm font-black ${Number(c.MONTO_PAGADO || c.monto_pagado) > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                            ${Number(c.MONTO_PAGADO || c.monto_pagado || 0).toLocaleString('es-CL')}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                            estado === 'PAGADO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            estado === 'EXENTO' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {estado === 'PAGADO' ? <CheckCircle2 size={10}/> : <Clock size={10}/>}
                            {estado}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all border border-slate-100">
                            <Mail size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ESTADO VACÍO */}
      {!loading && cuotasAlumno.length === 0 && !error && (
        <div className="bg-white rounded-[4rem] border border-slate-100 p-24 flex flex-col items-center justify-center text-center opacity-40">
          <Search size={64} className="text-slate-300 mb-6" strokeWidth={1} />
          <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter">Buscador de Cartera</h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs mt-4 leading-relaxed">
            Sincronice deudas y pagos individuales desde el microservicio central ingresando el ID del alumno.
          </p>
        </div>
      )}
    </div>
  )
}

function ResumenCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className={`text-3xl font-black ${color} tracking-tighter`}>${Number(value || 0).toLocaleString('es-CL')}</h3>
    </div>
  )
}