"use client"
import React, { useState, useEffect } from "react"
import { 
  ShieldCheck, Wallet, TrendingUp, AlertCircle, 
  Loader2, ArrowUpRight, ArrowRightLeft, PlusCircle, 
  Send, Landmark, ShieldAlert, ArrowLeft, PieChart, 
  FileText, ClipboardCheck, UserCheck, Receipt, BarChart3
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { pagosService } from "../../../../services/pagosService"

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

  useEffect(() => {
    const fetchTesoreriaData = async () => {
      try {
        const perfil = await authService.getMe();
        const rolesPermitidos = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU'];
        const esTesorero = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code));

        if (!esTesorero) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setIsAuthorized(true);
        const colId = perfil.COLEGIO_ID || 1;

        const dataResumen = await pagosService.getResumenGlobal(colId);
        setMetrics({
          recaudado: dataResumen.totalRecaudado || 0,
          pendiente: dataResumen.totalPendiente || 0,
          egresos: dataResumen.totalEgresos || 0,
          caja: (dataResumen.totalRecaudado || 0) - (dataResumen.totalEgresos || 0)
        });

      } catch (e: any) {
        console.error("Error en Dashboard Tesorero:", e);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    fetchTesoreriaData()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consultando Finanzas...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl text-center">
        <ShieldAlert size={48} className="text-rose-500 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-8">Esta sección es de uso exclusivo para Tesorería.</p>
        <button onClick={() => router.push('/dashboard/cpad/centro-padres')} className="bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER */}
      <header className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-4 rounded-2xl text-[#FF8FAB] shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Panel de Tesorería</h1>
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mt-1">Control Financiero General</p>
          </div>
        </div>
        <div className="flex gap-2">
          <HeaderAction icon={<PlusCircle size={14}/>} label="Nueva Carga" href="/dashboard/cpad/tesorero-cpad/nuevo" />
          <HeaderAction icon={<Send size={14}/>} label="Cobranza" href="/dashboard/cpad/tesorero-cpad/cobranza" />
        </div>
      </header>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Recaudado" value={metrics.recaudado} icon={<TrendingUp size={16}/>} color="text-emerald-500" />
        <MetricCard title="Por Cobrar" value={metrics.pendiente} icon={<Receipt size={16}/>} color="text-rose-500" />
        <MetricCard title="Egresos" value={metrics.egresos} icon={<ArrowRightLeft size={16}/>} color="text-amber-500" />
        <div className="bg-[#1A1A2E] p-6 rounded-4xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center border-b-4 border-[#FF8FAB]">
          <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest z-10 mb-1 opacity-60">Balance en Caja</p>
          <h3 className="text-xl font-black text-white z-10 tracking-tight">${metrics.caja.toLocaleString('es-CL')}</h3>
          <Wallet size={60} className="absolute -right-2 -bottom-2 text-white/5 rotate-12" />
        </div>
      </div>

      {/* GRILLA DE MÓDULOS (Conectando tus carpetas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <MenuCard 
          icon={<ArrowRightLeft />} 
          title="Movimientos" 
          desc="Registro histórico de ingresos y egresos de caja." 
          href="/dashboard/cpad/tesorero-cpad/movimientos" 
          color="bg-blue-50 text-blue-600"
        />

        <MenuCard 
          icon={<PieChart />} 
          title="Análisis de Gastos" 
          desc="Gráficos estadísticos de la distribución del dinero." 
          href="/dashboard/cpad/tesorero-cpad/gastos" 
          color="bg-rose-50 text-rose-600"
        />

        <MenuCard 
          icon={<Landmark />} 
          title="Cuentas Bancarias" 
          desc="Configuración de cuentas para depósitos y transferencias." 
          href="/dashboard/cpad/tesorero-cpad/cuentas-bancarias" 
          color="bg-amber-50 text-amber-600"
        />

        <MenuCard 
          icon={<ClipboardCheck />} 
          title="Exenciones" 
          desc="Gestión de solicitudes de becas o exención de cuotas." 
          href="/dashboard/cpad/tesorero-cpad/exenciones" 
          color="bg-indigo-50 text-indigo-600"
        />

        <MenuCard 
          icon={<BarChart3 />} 
          title="Balance Anual" 
          desc="Generación de estados financieros de fin de periodo." 
          href="/dashboard/cpad/tesorero-cpad/balance" 
          color="bg-emerald-50 text-emerald-600"
        />

        <MenuCard 
          icon={<UserCheck />} 
          title="Validaciones" 
          desc="Verificación de identidad de nuevos apoderados." 
          href="/dashboard/cpad/tesorero-cpad/validacion" 
          color="bg-slate-100 text-slate-600"
        />

        <MenuCard 
          icon={<FileText />} 
          title="Documentos" 
          desc="Repositorio de actas y certificados contables." 
          href="/dashboard/cpad/tesorero-cpad/reportes" 
          color="bg-purple-50 text-purple-600"
        />

        <MenuCard 
          icon={<Wallet />} 
          title="Caja Física" 
          desc="Control de efectivo y aperturas de caja diaria." 
          href="/dashboard/cpad/tesorero-cpad/caja" 
          color="bg-orange-50 text-orange-600"
        />

        <MenuCard 
          icon={<Receipt />} 
          title="Cuotas Generales" 
          desc="Vista global de la recaudación por cursos." 
          href="/dashboard/cpad/tesorero-cpad/cuotas" 
          color="bg-pink-50 text-pink-600"
        />

      </div>
    </div>
  )
}

// --- SUBCOMPONENTES ---

function HeaderAction({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="bg-slate-50 border border-slate-100 text-[#1A1A2E] px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-all flex items-center gap-2">
      {icon} {label}
    </Link>
  )
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-2">
        <span className={`${color} opacity-60`}>{icon}</span>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <h3 className="text-xl font-black text-[#1A1A2E] tracking-tight">${value.toLocaleString('es-CL')}</h3>
    </div>
  )
}

function MenuCard({ icon, title, desc, href, color }: { icon: React.ReactNode, title: string, desc: string, href: string, color: string }) {
  return (
    <Link href={href} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#FF8FAB]/20 transition-all group flex flex-col justify-between h-full">
      <div>
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
          {icon}
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E] uppercase tracking-tighter mb-2 group-hover:text-[#FF8FAB] transition-colors">{title}</h3>
        <p className="text-xs font-medium text-slate-400 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[#1A1A2E] transition-colors">
        Acceder al módulo <ArrowUpRight size={12} />
      </div>
    </Link>
  )
}