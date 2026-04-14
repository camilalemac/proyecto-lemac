"use client"
import React, { useState, useEffect } from "react"
import { 
  ShieldCheck, Wallet, TrendingUp, AlertCircle, 
  Loader2, ArrowUpRight, ArrowRightLeft, PlusCircle, 
  Send, Landmark, ShieldAlert, ArrowLeft
} from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Metrics {
  recaudado: number;
  pendiente: number;
  egresos: number;
  caja: number;
}

export default function TesoreroCpadDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics>({
    recaudado: 0,
    pendiente: 0,
    egresos: 0,
    caja: 0
  })
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [enviandoCobranza, setEnviandoCobranza] = useState(false)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchTesoreriaData = async () => {
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

        // 1. Validar Identidad y obtener Colegio
        const resMe = await fetch(`${GATEWAY_URL}/identity/me`, { headers })
        const dataMe = await resMe.json()

        if (dataMe.status === "success") {
          const roles = dataMe.data?.roles || [];
          const esTesorero = roles.some((r: any) => 
            ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU'].includes(r.rol_code)
          );

          if (!esTesorero) {
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          setIsAuthorized(true);
          const colId = dataMe.data.perfil.colegio_id || 1;

          // 2. Obtener Resumen Financiero desde MS_PAGOS (vía Gateway)
          const resResumen = await fetch(`${GATEWAY_URL}/pagos/movimientos/resumen-global/${colId}`, { headers })
          
          if (resResumen.ok) {
            const contentType = resResumen.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const json = await resResumen.json()
              if (json.success) {
                setMetrics({
                  recaudado: json.data.totalRecaudado || 0,
                  pendiente: json.data.totalPendiente || 0,
                  egresos: json.data.totalEgresos || 0,
                  caja: (json.data.totalRecaudado || 0) - (json.data.totalEgresos || 0)
                })
              }
            }
          }
        } else {
          setIsAuthorized(false)
        }
      } catch (e) {
        console.error("Error conectando con el Ledger:", e);
      } finally {
        setLoading(false)
      }
    }
    fetchTesoreriaData()
  }, [])

  const ejecutarCobranzaMasiva = async () => {
    if(!confirm("¿Enviar recordatorios a todos los morosos detectados en Oracle?")) return;
    setEnviandoCobranza(true)
    // Simulación de envío al microservicio de documentos/comunicaciones
    setTimeout(() => {
      setEnviandoCobranza(false)
      alert("Proceso de cobranza masiva enviado exitosamente.")
    }, 1500)
  }

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consultando Ledger Institucional...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl text-center">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-8">Esta sección es de uso exclusivo para el área de Tesorería y Finanzas.</p>
        <button onClick={() => router.push('/login')} className="bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Ir al Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="bg-[#1A1A2E] p-5 rounded-3xl text-[#FF8FAB] shadow-2xl">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none">Tesorería</h1>
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.3em] mt-2">Gestión de Fondos Institucionales</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push("/dashboard/apoderado/tesorero-cpad/caja")}
            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} /> Apertura
          </button>
          <button 
            onClick={ejecutarCobranzaMasiva}
            disabled={enviandoCobranza}
            className="flex-1 md:flex-none bg-[#1A1A2E] hover:bg-slate-800 text-white px-7 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {enviandoCobranza ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            Cobranza
          </button>
        </div>
      </header>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Recaudado" value={metrics.recaudado} icon={<TrendingUp size={16}/>} color="text-emerald-500" />
        <StatCard title="Morosidad" value={metrics.pendiente} icon={<AlertCircle size={16}/>} color="text-rose-500" />
        <StatCard title="Gastos" value={metrics.egresos} icon={<ArrowRightLeft size={16}/>} color="text-amber-500" />
        <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border-b-4 border-[#FF8FAB]">
          <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest z-10 mb-1 opacity-60">Balance en Caja</p>
          <h3 className="text-3xl font-black text-white z-10 tracking-tighter">${metrics.caja.toLocaleString('es-CL')}</h3>
          <Wallet size={100} className="absolute -right-6 -bottom-6 text-white/5 rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* VISTA 1: FLUJO */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
              <ArrowRightLeft size={28} />
            </div>
            <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter mb-4 italic">Libro de Caja</h2>
            <p className="text-slate-400 font-medium leading-relaxed max-w-md text-sm">
              Supervisión de transacciones inmutables. Verifique cada ingreso y egreso registrado bajo el estándar de auditoría Lemac.
            </p>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-10">
            <div className="flex gap-6">
               <div className="text-left"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Sincronización</p><p className="text-[10px] font-black text-emerald-500 uppercase italic">Online</p></div>
               <div className="text-left"><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Base de Datos</p><p className="text-[10px] font-black text-[#1A1A2E] uppercase italic">Oracle Cloud</p></div>
            </div>
            <Link href="/dashboard/apoderado/tesorero-cpad/movimientos" className="bg-[#1A1A2E] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:bg-[#FF8FAB] group-hover:text-[#1A1A2E] transition-all">
              Ver Historial <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* VISTA 2: BANCOS */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
              <Landmark size={28} />
            </div>
            <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter mb-4 italic">Cuentas</h2>
            <p className="text-slate-400 font-medium leading-relaxed text-sm">
              Gestión de cuentas bancarias institucionales para la recepción de pagos de mensualidades y materiales.
            </p>
          </div>
          <Link href="/dashboard/apoderado/tesorero-cpad/cuentas-bancarias" className="w-full bg-slate-50 text-[#1A1A2E] py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-500 hover:text-white transition-all border border-slate-100">
            Configurar Bancos
          </Link>
        </div>

        {/* VISTA 3: VALIDACIÓN */}
        <div className="lg:col-span-3 bg-[#1A1A2E] p-10 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group overflow-hidden relative border-t-4 border-[#FF8FAB]">
          <div className="z-10 text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white italic">Verificación de Cuentas</h2>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed text-sm">
              Existen solicitudes de validación pendientes. Confirme la identidad de los nuevos apoderados para habilitar sus módulos de pago.
            </p>
          </div>
          <Link href="/dashboard/apoderado/tesorero-cpad/validacion" className="z-10 bg-white text-[#1A1A2E] px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#FF8FAB] transition-all shrink-0">
            Ir a Validaciones
          </Link>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-center hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className={`${color} opacity-70`}>{icon}</span>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <h3 className={`text-2xl font-black text-[#1A1A2E]`}>${value.toLocaleString('es-CL')}</h3>
    </div>
  )
}