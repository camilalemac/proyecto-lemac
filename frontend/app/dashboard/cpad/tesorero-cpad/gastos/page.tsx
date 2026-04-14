"use client"
import React, { useState, useEffect } from "react"
import { 
  Receipt, Search, Mail, CheckCircle2, Clock, 
  AlertTriangle, Loader2, Users, FileText, ShieldAlert, ArrowLeft 
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function CuotasTesoreriaPage() {
  const router = useRouter()
  const [busquedaId, setBusquedaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cuotasAlumno, setCuotasAlumno] = useState<any[]>([])
  const [resumen, setResumen] = useState<any>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  // 1. VALIDACIÓN DE IDENTIDAD AL CARGAR
  useEffect(() => {
    const verificarPermisos = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          setIsAuthorized(false)
          return
        }

        const res = await fetch(`${GATEWAY_URL}/identity/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const json = await res.json()

        if (json.status === "success") {
          const roles = json.data?.roles || []
          const esTesorero = roles.some((r: any) => 
            ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU'].includes(r.rol_code)
          )
          setIsAuthorized(esTesorero)
        } else {
          setIsAuthorized(false)
        }
      } catch (e) {
        setIsAuthorized(false)
      } finally {
        setAuthLoading(false)
      }
    }
    verificarPermisos()
  }, [])

  // 2. BÚSQUEDA TRANSACCIONAL EN MS_PAGOS
  const handleBuscarCobros = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!busquedaId.trim()) return

    setLoading(true)
    setError(null)
    setCuotasAlumno([])
    setResumen(null)

    try {
      const token = Cookies.get("auth-token")
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json' 
      }

      // Consulta a MS_PAGOS vía Gateway
      const [resCobros, resResumen] = await Promise.all([
        fetch(`${GATEWAY_URL}/pagos/cuotas/alumno/${busquedaId}`, { headers }),
        fetch(`${GATEWAY_URL}/pagos/cuotas/alumno/${busquedaId}/resumen`, { headers })
      ])

      // Escudo Anti-HTML (Previene error de token '<')
      if (!resCobros.headers.get("content-type")?.includes("application/json")) {
        throw new Error("El servicio de Pagos devolvió un error de sistema (HTML).")
      }

      const jsonCobros = await resCobros.json()
      const jsonResumen = await resResumen.json()

      if (jsonCobros.success && Array.isArray(jsonCobros.data)) {
        setCuotasAlumno(jsonCobros.data)
      } else {
        throw new Error("No se encontraron registros de cobro para este ID de alumno.")
      }

      if (jsonResumen.success) {
        setResumen(jsonResumen.data)
      }
    } catch (err: any) {
      setError(err.message || "Error al sincronizar con Oracle Cloud.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autenticando Ledger...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter italic">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">La gestión de deudas es exclusiva para la Directiva de Tesorería Institucional.</p>
        <button onClick={() => router.push('/login')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all hover:bg-rose-500">
          <ArrowLeft size={16} /> Volver al Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER DE BÚSQUEDA */}
      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="bg-[#1A1A2E] p-5 rounded-2xl text-[#FF8FAB] shadow-xl shadow-slate-900/10">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Consultoría de Alumnos</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincronizado con MS_PAGOS en Oracle
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleBuscarCobros} className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF8FAB] transition-colors" size={20} />
            <input 
              type="number" 
              placeholder="ID Alumno (Revisar tabla ACA_MATRICULAS)"
              className="w-full pl-14 pr-6 py-6 bg-slate-50 border-none rounded-4xl text-sm font-black focus:ring-4 focus:ring-[#FF8FAB]/20 outline-none transition-all placeholder:font-medium text-[#1A1A2E]"
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
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Sincronizar Datos'}
          </button>
        </form>
      </header>

      {error && (
        <div className="bg-rose-50 p-6 rounded-4xl border border-rose-100 flex items-center gap-4 text-rose-600 shadow-sm animate-in zoom-in-95">
          <AlertTriangle size={24} />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {!loading && cuotasAlumno.length > 0 && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          {resumen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-center border-b-4 border-emerald-400">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Pagado</p>
                <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tighter">
                  ${(resumen.totalPagado || resumen.TOTAL_PAGADO || 0).toLocaleString('es-CL')}
                </h3>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-center border-b-4 border-rose-400">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deuda Pendiente</p>
                <h3 className="text-3xl font-black text-rose-600 tracking-tighter">
                  ${(resumen.totalPendiente || resumen.TOTAL_PENDIENTE || 0).toLocaleString('es-CL')}
                </h3>
              </div>
              <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center relative overflow-hidden">
                <p className="text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest mb-1 z-10">Progreso Financiero</p>
                <h3 className="text-3xl font-black text-white z-10">
                  {(resumen.porcentajePagado || resumen.PORCENTAJE_PAGADO || 0).toFixed(1)}%
                </h3>
                <Receipt size={80} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-2">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-225">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Concepto de Cobro</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Fecha Vto.</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Original</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Monto Pagado</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Estatus Oracle</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Recordatorio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cuotasAlumno.map((c: any, i: number) => {
                    const status = c.ESTADO || c.estado;
                    const esVencido = new Date(c.FECHA_VENCIMIENTO || c.fecha_vencimiento) < new Date() && status !== 'PAGADO';
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-[#1A1A2E] uppercase">{c.concepto?.NOMBRE || c.DESCRIPCION || c.descripcion}</p>
                          <p className="text-[9px] font-bold text-[#FF8FAB] uppercase mt-1 tracking-widest italic">
                            Cuota {c.NUMERO_CUOTA || c.numero_cuota}/{c.TOTAL_CUOTAS || c.total_cuotas}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className={`text-xs font-bold ${esVencido ? 'text-rose-500' : 'text-slate-500'}`}>
                            {new Date(c.FECHA_VENCIMIENTO || c.fecha_vencimiento).toLocaleDateString('es-CL')}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="text-sm font-black text-[#1A1A2E]">${(c.MONTO_ORIGINAL || c.monto_original).toLocaleString('es-CL')}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className={`text-sm font-black ${Number(c.MONTO_PAGADO || c.monto_pagado) > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                            ${(c.MONTO_PAGADO || c.monto_pagado || 0).toLocaleString('es-CL')}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            status === 'PAGADO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            status === 'EXENTO' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {status === 'PAGADO' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                            {status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all border border-slate-100 shadow-sm">
                            <Mail size={18} />
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
          <div className="bg-slate-50 p-8 rounded-full mb-8 border border-slate-100 shadow-inner">
            <Search size={64} className="text-slate-300" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Ledger de Alumno Vacío</h3>
          <p className="text-sm text-slate-500 font-medium max-w-sm mt-4 leading-relaxed">
            Ingrese el identificador único del estudiante (ID) para sincronizar su historial de pagos desde el nodo principal de Oracle.
          </p>
        </div>
      )}
    </div>
  )
}