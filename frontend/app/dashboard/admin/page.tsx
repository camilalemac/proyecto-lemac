"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Settings, Wallet, LayoutGrid, Loader2, 
  History, CheckCircle2, User, LogOut, ShieldAlert, 
  ServerOff, Database, Globe, CreditCard, CalendarDays
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [transacciones, setTransacciones] = useState<any[]>([])
  const [metrics, setMetrics] = useState({ totalRecaudado: 0, totalTransacciones: 0 })
  const [loading, setLoading] = useState(true)
  const [conexionBackend, setConexionBackend] = useState(true)
  
  const [userProfile, setUserProfile] = useState({
    nombre: "Cargando...",
    rol: "Super Administrador"
  })

  const fetchData = async () => {
    const token = Cookies.get("auth-token")
      
    // ✅ VALIDACIÓN ESTRICTA: Si no hay token, expulsar al login inmediatamente
    if (!token) {
      router.push("/login")
      return;
    }

    try {
      const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` }
      
      // 1. Perfil Real (Verificando identidad en el backend)
      const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
      const dataMe = await resMe.json()
      
      if (dataMe.success && dataMe.data) {
        setUserProfile({
          nombre: `${dataMe.data.nombres} ${dataMe.data.apellidos}`,
          rol: "Administrador de Sistema (Nivel 9)"
        })

        // 2. Monitoreo Global de Transacciones del Colegio
        const resTrans = await fetch(`http://127.0.0.1:3007/api/v1/pagos/transaccion/colegio/${dataMe.data.colegioId}`, { headers }).catch(() => null)
        
        if (resTrans && resTrans.ok) {
          const dataTrans = await resTrans.json()
          const arrTransacciones = Array.isArray(dataTrans) ? dataTrans : (dataTrans.data || [])
          setTransacciones(arrTransacciones)
          
          // Calcular métricas
          const total = arrTransacciones.reduce((acc: number, t: any) => acc + Number(t.MONTO_PAGO || t.montoPago || 0), 0)
          setMetrics({ totalRecaudado: total, totalTransacciones: arrTransacciones.length })
        }
        setConexionBackend(true)
      } else {
        // Si el token es inválido o caducó en el backend
        Cookies.remove("auth-token")
        router.push("/login")
      }
    } catch (err) {
      console.error("Error conectando con el backend:", err)
      setConexionBackend(false)
      setMetrics({ totalRecaudado: 0, totalTransacciones: 0 })
      setTransacciones([])
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FDF2F5] gap-4">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accediendo al Core del Sistema...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF2F5]">
      
      {!conexionBackend && (
        <div className="bg-[#0F172A] text-pink-200 p-3 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border-b border-pink-500/20">
          <ServerOff size={16} className="text-pink-500" /> Error de enlace: MS_GATEWAY (3007) fuera de línea
        </div>
      )}

      {/* HEADER AZUL MARINO */}
      <header className="bg-[#0F172A] text-white py-4 px-10 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF8FAB] rounded-lg flex items-center justify-center text-[#0F172A] font-black text-xs shadow-lg shadow-pink-500/20">SYS</div>
          <p className="text-[11px] font-black tracking-[0.4em] uppercase text-white/40">Lemac Infrastructure Manager</p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 py-1 px-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-right">
              <p className="text-xs font-black tracking-tight leading-tight">{userProfile.nombre}</p>
              <p className="text-[9px] font-bold text-[#FF8FAB] uppercase tracking-widest">{userProfile.rol}</p>
            </div>
            <div className="h-10 w-10 bg-[#1e293b] rounded-xl flex items-center justify-center text-[#FF8FAB] border border-pink-500/30">
              <ShieldAlert size={20} />
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 hover:bg-pink-500/20 text-white/40 hover:text-[#FF8FAB] rounded-2xl transition-all cursor-pointer">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-10 p-8 pt-12">
        
        {/* BANNER DE ESTADO */}
        <div className="bg-white border border-pink-100 rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="flex items-center gap-8 z-10">
            <div className="bg-[#0F172A] p-6 rounded-3xl text-white shadow-2xl">
              <Database size={40} className="text-[#FF8FAB]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none uppercase italic">Administración Core</h1>
              <p className="text-[#FF8FAB] font-bold text-xs uppercase tracking-[0.3em] mt-2">Control Maestro • Conexión Oracle Active</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-6 py-3 bg-pink-50 text-[#0F172A] rounded-2xl border border-pink-100 font-black text-[10px] uppercase">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                Sincronizado
             </div>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatCard title="Recaudación Global" value={`$${metrics.totalRecaudado.toLocaleString('es-CL')}`} icon={<Wallet/>} />
          <AdminStatCard title="Total Transacciones" value={metrics.totalTransacciones} icon={<History/>} />
          <AdminStatCard title="Uptime Engine" value="100%" icon={<Globe/>} />
          <AdminStatCard title="Nivel de Sistema" value="ROOT" icon={<ShieldAlert/>} />
        </div>

        {/* MÓDULOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <section className="lg:col-span-2 space-y-8">
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-3">
               <Settings className="text-[#FF8FAB]" /> Configuración de Estructura Escolar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ActionCard 
                title="Apertura de Periodos" 
                desc="Crear y activar años escolares (Tabla ACA_PERIODOS). Define fechas de inicio y cierre." 
                icon={<CalendarDays size={24}/>} 
                href="/dashboard/admin/periodos"
               />
               <ActionCard 
                title="Definición de Cursos" 
                desc="Poblar la institución con Niveles y Cursos (Tabla ACA_CURSOS). Asignar letras y grados." 
                icon={<LayoutGrid size={24}/>} 
                href="/dashboard/admin/cursos"
               />
               <ActionCard 
                title="Configurar Pasarelas" 
                desc="Administrar comisiones y estados de MercadoPago, Webpay y Khipu (Tabla PAG_METODOS)." 
                icon={<CreditCard size={24}/>} 
                href="/dashboard/admin/metodos-pago"
               />
               <ActionCard 
                title="Auditoría Blockchain" 
                desc="Verificar inmutabilidad en PAG_TRANSACCIONES y bitácora de accesos de seguridad." 
                icon={<FileText size={24}/>} 
                href="/dashboard/admin/logs"
               />
            </div>
          </section>

          {/* MONITOR DE TRÁFICO */}
          <section className="bg-[#0F172A] rounded-[3.5rem] p-8 shadow-2xl text-white flex flex-col h-130">
             <div className="mb-8 border-b border-white/10 pb-6 text-center">
                <h3 className="text-lg font-black uppercase tracking-tighter flex items-center justify-center gap-3">
                   <History className="text-[#FF8FAB]" size={20} /> Traffic Monitor
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">Registros de Oracle en tiempo real</p>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {transacciones.length > 0 ? transacciones.map((t, i) => (
                  <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-[#FF8FAB] uppercase">{t.METODO_PAGO || t.metodoPago || "DB_RECORD"}</p>
                      <p className="text-[11px] font-bold text-white/70 mt-1 uppercase">Folio: {t.COBRO_ID || t.cobroId}</p>
                    </div>
                    <p className="font-black text-pink-400 text-sm italic">+${Number(t.MONTO_PAGO || t.montoPago || 0).toLocaleString('es-CL')}</p>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 text-center px-10">
                    <Database size={48} className="mb-4 text-white" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No se detectan movimientos en el Ledger</p>
                  </div>
                )}
             </div>
          </section>

        </div>
      </div>
    </div>
  )
}

function AdminStatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-7 rounded-3xl border border-pink-100 flex items-center gap-5 hover:scale-105 transition-transform shadow-sm">
      <div className="p-4 bg-[#0F172A] text-[#FF8FAB] rounded-2xl shadow-lg">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-[#0F172A] tracking-tighter">{value}</p>
      </div>
    </div>
  )
}

function ActionCard({ title, desc, icon, href }: any) {
  return (
    <Link href={href} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#FF8FAB]/30 transition-all group flex flex-col justify-between">
      <div>
        <div className="p-4 bg-pink-50 text-[#0F172A] rounded-2xl w-fit group-hover:bg-[#0F172A] group-hover:text-[#FF8FAB] transition-all mb-4 shadow-inner">
          {icon}
        </div>
        <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-tight italic">{title}</h4>
        <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 text-[9px] font-black uppercase text-[#FF8FAB] flex items-center gap-2 group-hover:gap-4 transition-all">
        Inicializar Módulo <LayoutGrid size={12}/>
      </div>
    </Link>
  )
}