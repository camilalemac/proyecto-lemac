"use client"
import React, { useState, useEffect } from "react"
import { 
  Scale, TrendingUp, TrendingDown, Landmark, 
  Loader2, AlertCircle, FileDown, CheckCircle2,
  ExternalLink, ShieldAlert, ArrowLeft
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function BalanceAnualPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [cuentas, setCuentas] = useState<any[]>([])
  
  // Listas detalladas para el reporte PDF
  const [listaIngresos, setListaIngresos] = useState<any[]>([])
  const [listaEgresos, setListaEgresos] = useState<any[]>([])
  
  const [totales, setTotales] = useState({ ingresos: 0, egresos: 0, saldoFinal: 0 })
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)
  
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [urlReporte, setUrlReporte] = useState<string | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const generarBalance = async () => {
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

        // 1. Validar Identidad y Rol (Gateway -> MS_IDENTITY)
        const resMe = await fetch(`${GATEWAY_URL}/identity/me`, { headers })
        const dataMe = await resMe.json()

        if (dataMe.status !== "success") {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        // Validación de rol directivo
        const roles = dataMe.data?.roles || []
        const esDirectiva = roles.some((r: any) => 
          ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU'].includes(r.rol_code)
        )

        if (!esDirectiva) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)
        const colId = dataMe.data.perfil.colegio_id || 1

        // 2. Traer Cuentas Bancarias (Gateway -> MS_PAGOS)
        const resCuentas = await fetch(`${GATEWAY_URL}/pagos/cuentas-bancarias/colegio/${colId}`, { headers })
        
        // Escudo Anti-HTML
        const contentTypeC = resCuentas.headers.get("content-type")
        if (!contentTypeC || !contentTypeC.includes("application/json")) {
           throw new Error("El servicio de Pagos no está respondiendo correctamente (HTML Error)")
        }

        const jsonCuentas = await resCuentas.json()
        
        if (jsonCuentas.success && Array.isArray(jsonCuentas.data)) {
          const cuentasData = jsonCuentas.data
          setCuentas(cuentasData)
          const saldoFinalTotal = cuentasData.reduce((acc: number, c: any) => acc + Number(c.SALDO_ACTUAL || 0), 0)

          // 3. Traer Resumen de Movimientos (Nueva Ruta sugerida para evitar múltiples fetch)
          // Si no tienes esta ruta, se usa el fallback de movimientos por cuenta
          const resMovs = await fetch(`${GATEWAY_URL}/pagos/movimientos/colegio/${colId}`, { headers })
          
          if (resMovs.ok && resMovs.headers.get("content-type")?.includes("application/json")) {
            const jsonMovs = await resMovs.json()
            const dataList = jsonMovs.data || []

            const ing = dataList.filter((m:any) => m.TIPO_MOVIMIENTO === 'INGRESO')
            const egr = dataList.filter((m:any) => m.TIPO_MOVIMIENTO === 'EGRESO')

            const sumIng = ing.reduce((acc:number, m:any) => acc + Number(m.MONTO), 0)
            const sumEgr = egr.reduce((acc:number, m:any) => acc + Number(m.MONTO), 0)

            setListaIngresos(ing.map((m:any) => ({ descripcion: m.GLOSA, monto: m.MONTO, fecha: m.FECHA_MOVIMIENTO })))
            setListaEgresos(egr.map((m:any) => ({ descripcion: m.GLOSA, monto: m.MONTO, fecha: m.FECHA_MOVIMIENTO })))
            setTotales({ ingresos: sumIng, egresos: sumEgr, saldoFinal: saldoFinalTotal })
          }
        }
      } catch (e) {
        console.error("Error al generar el balance institucional:", e)
        setNotificacion({ msg: "Error al consolidar datos de Oracle", tipo: 'error' })
      } finally {
        setLoading(false)
      }
    }

    generarBalance()
  }, [])

  const handleDescargarReporte = async () => {
    setGenerandoPDF(true)
    try {
      const token = Cookies.get("auth-token")
      const payloadReporte = {
        titulo: "Balance Anual Consolidado",
        colegio: "Liceo Juana Ross de Edwards",
        periodo: new Date().getFullYear().toString(),
        tipoPeriodo: "anual",
        generadoPor: "Tesorería General",
        ingresos: listaIngresos,
        egresos: listaEgresos,
        saldoFinal: totales.saldoFinal
      }

      // IMPORTANTE: MS_DOCUMENTOS en puerto 3006 vía Gateway 3007
      const res = await fetch(`${GATEWAY_URL}/documentos/generar`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadReporte)
      })

      const json = await res.json()
      if (json.success && json.data?.urlReporte) {
        setUrlReporte(json.data.urlReporte)
        setNotificacion({ msg: "Reporte generado en Oracle Cloud", tipo: 'success' })
      }
    } catch (e) {
      setNotificacion({ msg: "Falla en MS_DOCUMENTOS", tipo: 'error' })
    } finally {
      setGenerandoPDF(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consolidando Ledger Oracle...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl text-center animate-in zoom-in-95">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-8">Esta sección requiere permisos de Tesorería General.</p>
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
          {notificacion.tipo === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-emerald-400 shadow-xl shadow-slate-900/10">
            <Scale size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none">Cierre Contable</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Balance Anual Consolidado</p>
          </div>
        </div>

        <div className="flex gap-4">
          {urlReporte && (
            <a href={urlReporte} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all font-black uppercase tracking-widest text-[10px] border border-emerald-200">
              <ExternalLink size={16} /> Abrir PDF
            </a>
          )}
          <button 
            onClick={handleDescargarReporte}
            disabled={generandoPDF || cuentas.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-[#1A1A2E] text-white rounded-2xl hover:bg-[#2A2A4E] transition-all shadow-xl disabled:opacity-50"
          >
            {generandoPDF ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {generandoPDF ? 'Generando...' : 'Emitir Reporte Oficial'}
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos Acumulados</p>
          </div>
          <h3 className="text-3xl font-black text-emerald-500 tracking-tighter">${totales.ingresos.toLocaleString('es-CL')}</h3>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-rose-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Egresos Ejecutados</p>
          </div>
          <h3 className="text-3xl font-black text-rose-500 tracking-tighter">${totales.egresos.toLocaleString('es-CL')}</h3>
        </div>

        <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center relative overflow-hidden border-b-4 border-[#FF8FAB]">
          <div className="flex items-center gap-2 mb-3 z-10">
            <Landmark size={16} className="text-amber-400" />
            <p className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest">Saldo Real Bancario</p>
          </div>
          <h3 className="text-4xl font-black text-white z-10 tracking-tighter">${totales.saldoFinal.toLocaleString('es-CL')}</h3>
          <Scale size={100} className="absolute -right-6 -bottom-6 text-white/5 rotate-12" />
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden p-4">
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
          <Landmark size={20} className="text-slate-400" />
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Desglose de Auditoría por Institución</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {cuentas.map((c, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-4xl border border-slate-100 flex justify-between items-center hover:bg-[#FDF2F5] transition-colors group">
              <div>
                <p className="text-sm font-black text-[#1A1A2E] group-hover:text-[#FF8FAB] transition-colors">{c.NOMBRE_CUENTA}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 italic">{c.BANCO || "ENTIDAD SIN ASIGNAR"}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 opacity-50">Cierre de Caja</p>
                <p className="text-xl font-black text-[#1A1A2E] tracking-tight">${Number(c.SALDO_ACTUAL).toLocaleString('es-CL')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}