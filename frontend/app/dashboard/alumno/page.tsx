"use client"
import { useEffect, useState } from "react"
import { 
  Receipt, History, Wallet, ChevronRight, 
  Star, Bell, UserCircle, GraduationCap, Loader2 
} from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../services/authService"
import { pagosService } from "../../../services/pagosService"
import { formatCurrencyCLP } from "../../../utils/formatters"

export default function AlumnoDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  const [usuarioData, setUsuarioData] = useState<any>(null)
  const [resumen, setResumen] = useState<any>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      const token = Cookies.get("auth-token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const [dataDelBackendAuth, cuotasData] = await Promise.all([
          authService.getMe(),
          pagosService.getMisCuotasResumen()
        ])

        setUsuarioData(dataDelBackendAuth)
        setResumen(cuotasData)
      } catch (error) {
        console.error("Error crítico cargando dashboard:", error)
        Cookies.remove("auth-token")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#FF8FAB] mb-4" size={48} strokeWidth={1.5} />
      <p className="text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest opacity-50">Sincronizando Identidad...</p>
    </div>
  )

  // ==========================================
  // DATOS 100% REALES (SIN MOCKS)
  // ==========================================
  
  // 1. Identidad Automática
  const nombresCompletos = usuarioData?.perfil?.nombres || "Estudiante";
  const primerNombre = nombresCompletos.split(' ')[0];
  const nombreRol = usuarioData?.roles?.[0]?.nombre_rol || "Usuario del Sistema";
  
  // ¡Aquí entra el nombre de tu colegio directamente de Oracle!
  const nombreColegioReal = usuarioData?.perfil?.nombre_colegio || "Institución Educativa";

  // 2. Finanzas Automáticas
  const deudaTotal = resumen?.totalPendiente || resumen?.TOTAL_PENDIENTE || 0;
  const pagosRealizados = resumen?.totalPagado || resumen?.TOTAL_PAGADO || resumen?.cuotasPagadas || 0;
  const listaCobros = resumen?.cobros || resumen?.COBROS || [];
  const cuotasPendientes = listaCobros.filter((c: any) => c.ESTADO === 'PENDIENTE' || c.estado === 'PENDIENTE').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      
      {/* SECCIÓN DE BIENVENIDA */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-4xl font-black text-[#1A1A2E] tracking-tighter uppercase italic">
            Hola, <span className="text-[#FF8FAB]">{primerNombre}</span> 👋
          </h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.3em] mt-2">
            Panel Estudiantil • {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        {/* TARJETAS DE IDENTIDAD (ROL Y COLEGIO) */}
        <div className="flex gap-4">
          <div className="flex items-center gap-4 bg-slate-50 p-3 pr-6 rounded-3xl shadow-inner border border-slate-100">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                <UserCircle size={24} />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Rol</p>
                <p className="text-xs font-black text-[#1A1A2E] mt-1 uppercase tracking-tight">{nombreRol}</p>
             </div>
          </div>

          <div className="flex items-center gap-4 bg-[#FDF2F5] p-3 pr-6 rounded-3xl shadow-inner border border-[#FF8FAB]/20 sm:flex">
             <div className="w-12 h-12 bg-[#FF8FAB] rounded-2xl flex items-center justify-center text-white shadow-md">
                <GraduationCap size={24} />
             </div>
             <div>
                <p className="text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest leading-none">Institución</p>
                <p className="text-xs font-black text-[#1A1A2E] mt-1 uppercase tracking-tight max-w-37.5 truncate">{nombreColegioReal}</p>
             </div>
          </div>
        </div>
      </header>

      {/* TARJETAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Deuda Total" value={formatCurrencyCLP(deudaTotal)} icon={<Wallet />} color="bg-rose-500" />
        <StatCard title="Pagos Realizados" value={formatCurrencyCLP(pagosRealizados)} icon={<Star />} color="bg-emerald-500" />
        <div className="bg-[#1A1A2E] p-8 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <Bell className="absolute -right-4 -top-4 w-32 h-32 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF8FAB] relative z-10">Avisos</p>
            <p className="text-xl font-black mt-4 relative z-10 tracking-tight leading-tight">
              Tienes <span className="text-[#FF8FAB]">{cuotasPendientes}</span> cuotas esperando pago.
            </p>
            <Link href="/dashboard/alumno/cuotas" className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase text-white bg-white/10 w-fit px-5 py-3 rounded-2xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all relative z-10">
               Ir a pagar <ChevronRight size={14} />
            </Link>
        </div>
      </div>

      {/* ACCESOS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MenuAction title="Mis Cuotas y Pagos" desc="Visualiza tu estado de cuenta, descarga comprobantes y paga mensualidades pendientes." href="/dashboard/alumno/cuotas" icon={<Receipt size={32} />} />
        <MenuAction title="Historial Blockchain" desc="Consulta el registro inmutable de todas tus transacciones realizadas en el sistema." href="/dashboard/alumno/historial" icon={<History size={32} />} />
      </section>

    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:border-slate-200 transition-all duration-300">
      <div className={`p-6 ${color} text-white rounded-3xl shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-[#1A1A2E] tracking-tighter">{value}</p>
      </div>
    </div>
  )
}

function MenuAction({ title, desc, href, icon }: any) {
  return (
    <Link href={href} className="bg-white p-10 lg:p-12 rounded-[4rem] border border-slate-100 flex gap-8 items-center group hover:border-[#FF8FAB]/40 hover:shadow-xl transition-all duration-300">
      <div className="p-6 bg-slate-50 text-slate-400 rounded-4xl group-hover:bg-[#1A1A2E] group-hover:text-[#FF8FAB] transition-all shadow-sm shrink-0">{icon}</div>
      <div>
        <h4 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">{title}</h4>
        <p className="text-sm text-slate-500 font-bold mt-2 leading-relaxed">{desc}</p>
      </div>
    </Link>
  )
}