"use client"
import React, { useState, useEffect } from "react"
import { 
  Scale, TrendingUp, TrendingDown, Landmark, 
  Loader2, AlertCircle, FileDown, CheckCircle2,
  ExternalLink, ShieldAlert, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// SERVICIOS
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"
import { reporteService } from "../../../../../services/reporteService"

export default function BalanceAnualPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [cuentas, setCuentas] = useState<any[]>([])
  
  const [totales, setTotales] = useState({ ingresos: 0, egresos: 0, saldoFinal: 0 })
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)
  
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [urlReporte, setUrlReporte] = useState<string | null>(null)

  useEffect(() => {
    const generarBalance = async () => {
      try {
        // 1. Identidad real desde MS_AUTH (3007)
        const perfil = await authService.getMe()
        
        const rolesTesoreria = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU']
        const tienePermiso = perfil.roles?.some((r: any) => rolesTesoreria.includes(r.rol_code))

        if (!tienePermiso) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)
        // Usamos el nombre exacto que TypeScript espera
        const colId = perfil.COLEGIO_ID || 1

        // 2. Traer Movimientos para el cálculo de totales
        const movimientosData = await pagosService.getMovimientosPorColegio(colId) 
        
        const ing = movimientosData.filter((m:any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'INGRESO')
        const egr = movimientosData.filter((m:any) => (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === 'EGRESO')

        const sumIng = ing.reduce((acc:number, m:any) => acc + Number(m.MONTO || m.monto || 0), 0)
        const sumEgr = egr.reduce((acc:number, m:any) => acc + Number(m.MONTO || m.monto || 0), 0)

        // 3. Traer el estado actual de las cuentas bancarias
        const resCuentas = await pagosService.getCuentasPorColegio(colId)
        setCuentas(resCuentas)
        
        const saldoFinalTotal = resCuentas.reduce((acc: number, c: any) => acc + Number(c.SALDO_ACTUAL || c.saldo_actual || 0), 0)

        setTotales({ 
          ingresos: sumIng, 
          egresos: sumEgr, 
          saldoFinal: saldoFinalTotal 
        })

      } catch (e: any) {
        console.error("Error en balance:", e)
        setNotificacion({ msg: "Error al sincronizar con Oracle Cloud", tipo: 'error' })
      } finally {
        setLoading(false)
      }
    }

    generarBalance()
  }, [])

  const handleEmitirReporte = async () => {
    setGenerandoPDF(true)
    try {
      const payloadReporte = {
        titulo: "Balance Anual Consolidado",
        periodo: new Date().getFullYear().toString(),
        ingresos: totales.ingresos,
        egresos: totales.egresos,
        saldoFinal: totales.saldoFinal,
        tipo: 'BALANCE_FINANCIERO' // Metadata extra para el backend
      }

      // Llamada al microservicio de reportes
      const resultado = await reporteService.createActa(payloadReporte)
      
      if (resultado) {
        setNotificacion({ msg: "Documento oficial generado", tipo: 'success' })
        // Si el backend devuelve una URL de S3/Cloud, la seteamos
        if(resultado.url) setUrlReporte(resultado.url)
      }
    } catch (e) {
      setNotificacion({ msg: "Error en el Microservicio de Reportes", tipo: 'error' })
    } finally {
      setGenerandoPDF(false)
    }
  }

  // ... (Loading y Unauthorized quedan igual) ...

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consolidando Ledger Oracle...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl text-center">
        <ShieldAlert size={48} className="text-rose-500 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-8">Esta sección requiere permisos de Tesorería General.</p>
        <button onClick={() => router.push('/dashboard/cpad/tesorero-cpad')} className="bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Volver al Panel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link href="/dashboard/cpad/tesorero-cpad" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Regresar a Tesorería
        </Link>
      </div>

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-emerald-400 shadow-xl">
            <Scale size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none">Cierre Contable</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Balance Anual Consolidado</p>
          </div>
        </div>

        <button 
          onClick={handleEmitirReporte}
          disabled={generandoPDF || cuentas.length === 0}
          className="flex items-center gap-3 px-8 py-4 bg-[#1A1A2E] text-white rounded-2xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-xl disabled:opacity-50"
        >
          {generandoPDF ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {generandoPDF ? 'Generando...' : 'Emitir Reporte Oficial'}
          </span>
        </button>
      </header>

      {/* MÉTRICAS DE TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TotalBox title="Ingresos Acumulados" value={totales.ingresos} color="text-emerald-500" icon={<TrendingUp size={16}/>} />
        <TotalBox title="Egresos Ejecutados" value={totales.egresos} color="text-rose-500" icon={<TrendingDown size={16}/>} />
        <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center relative overflow-hidden border-b-4 border-[#FF8FAB]">
          <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest z-10 mb-1 opacity-60">Fondo Disponible</p>
          <h3 className="text-3xl font-black text-white z-10 tracking-tighter">${totales.saldoFinal.toLocaleString('es-CL')}</h3>
          <Scale size={100} className="absolute -right-6 -bottom-6 text-white/5 rotate-12" />
        </div>
      </div>

      {/* LISTADO DE CUENTAS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <div className="flex items-center gap-3 mb-8">
          <Landmark size={20} className="text-[#FF8FAB]" />
          <h2 className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Saldos por Cuenta Bancaria</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuentas.map((c, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-4xl border border-slate-100 flex justify-between items-center hover:bg-[#FDF2F5] transition-colors group">
              <div>
                <p className="text-sm font-black text-[#1A1A2E] group-hover:text-[#FF8FAB] transition-colors">{c.NOMBRE_CUENTA || c.nombre_cuenta}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 italic">{c.BANCO || c.banco || "BANCO ESTADO"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#1A1A2E] tracking-tight">${Number(c.SALDO_ACTUAL || c.saldo_actual || 0).toLocaleString('es-CL')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TotalBox({ title, value, color, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-3">
        <span className={color}>{icon}</span>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <h3 className={`text-3xl font-black ${color} tracking-tighter`}>${value.toLocaleString('es-CL')}</h3>
    </div>
  )
}