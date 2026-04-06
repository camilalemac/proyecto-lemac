"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Inyectado para navegación
import { 
  Users, Wallet, CreditCard, ArrowRight, Heart, 
  TrendingUp, Loader2, History, Star, ShieldCheck,
  LayoutDashboard, Receipt, PieChart, LogOut
} from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"

// Interfaces para evitar errores de TypeScript
interface Hijo {
  ALUMNO_ID: number;
  alumno: {
    NOMBRE: string;
    APELLIDO_PATERNO: string;
  };
  TIPO_RELACION: string;
  ES_TITULAR_FINAN: string;
}

export default function ApoderadoDashboard() {
  const router = useRouter() // Inyectado
  const [hijos, setHijos] = useState<Hijo[]>([])
  const [loading, setLoading] = useState(true)
  const [resumenGlobal, setResumenGlobal] = useState({ totalPendiente: 0, totalPagado: 0 })

  // Lógica de cerrar sesión inyectada
  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { setLoading(false); return; }
        
        // 1. Obtener lista de familiares (Microservicio Académico)
        const resHijos = await fetch("http://127.0.0.1:3007/api/v1/academico/familia/mis-familiares", {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const contentType = resHijos.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("El Gateway no devolvió JSON válido.");
        }

        const dataHijos = await resHijos.json()
        
        if (dataHijos.success) {
          const listaHijos = dataHijos.data
          setHijos(listaHijos)
          
          let pendienteTotal = 0
          let pagadoTotal = 0

          // 2. Consultar finanzas de cada hijo (Microservicio de Pagos)
          for (const hijo of listaHijos) {
            try {
              const resFinan = await fetch(`http://127.0.0.1:3002/api/v1/pagos/cuentas-cobrar/resumen/alumno/${hijo.ALUMNO_ID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              
              const contentTypeFinan = resFinan.headers.get("content-type");
              if (contentTypeFinan && contentTypeFinan.includes("application/json")) {
                const dataFinan = await resFinan.json()
                if (dataFinan.success) {
                  pendienteTotal += dataFinan.data.totalPendiente || 0
                  pagadoTotal += dataFinan.data.totalPagado || 0
                }
              }
            } catch (e) {
              console.warn(`Error cargando finanzas del alumno ${hijo.ALUMNO_ID}`);
            }
          }
          setResumenGlobal({ totalPendiente: pendienteTotal, totalPagado: pagadoTotal })
        }
      } catch (err) {
        console.error("Error crítico en dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    initDashboard()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} />
      <p className="text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest">Sincronizando Portal Familiar...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-[#1A1A2E] flex flex-col lg:flex shrink-0">
        <div className="p-8">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Lemac <span className="text-[#FF8FAB]">Pay</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Apoderado Titular</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-4 mb-4 tracking-widest">Menú Principal</p>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 bg-[#FF8FAB]/10 text-[#FF8FAB] rounded-2xl font-bold text-sm">
            <LayoutDashboard size={20} /> Inicio
          </Link>
          <Link href="/dashboard/apoderado/cuotas" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm">
            <Receipt size={20} /> Mis Cuotas
          </Link>
          <Link href="/dashboard/apoderado/gastos" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm">
            <PieChart size={20} /> Gastos
          </Link>
          <Link href="/dashboard/apoderado/pagos/historial" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-bold text-sm">
            <History size={20} /> Historial
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          {/* onClick inyectado aquí */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors font-bold text-sm w-full"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        
        {/* HEADER */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="bg-[#1A1A2E] p-4 rounded-3xl shadow-lg">
              <ShieldCheck className="text-[#FF8FAB]" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Portal Familiar</h1>
              <p className="text-[#FF8FAB] font-bold text-xs uppercase tracking-widest mt-1">Gestión Centralizada EDUCA+</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Recargo por servicio bancario</p>
            <span className="bg-amber-100 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black italic">
              +3.5% Comisión Transbank / Webpay incluída
            </span>
          </div>
        </header>

        {/* WIDGETS FINANCIEROS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[3rem] border-b-4 border-red-400 shadow-sm group overflow-hidden relative">
              <div className="absolute right-[-5%] top-[-5%] opacity-5 text-red-500 group-hover:scale-110 transition-transform"><Wallet size={100} /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mi Pendiente</p>
              <p className="text-4xl font-black text-[#1A1A2E]">${resumenGlobal.totalPendiente.toLocaleString('es-CL')}</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-b-4 border-green-400 shadow-sm group overflow-hidden relative">
              <div className="absolute right-[-5%] top-[-5%] opacity-5 text-green-500 group-hover:scale-110 transition-transform"><TrendingUp size={100} /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mi Pagado</p>
              <p className="text-4xl font-black text-[#1A1A2E]">${resumenGlobal.totalPagado.toLocaleString('es-CL')}</p>
          </div>

          <div className="bg-[#1A1A2E] p-8 rounded-[3rem] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <Star className="absolute right-6 top-6 text-[#FF8FAB] animate-pulse" size={24} fill="#FF8FAB" />
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-[#FF8FAB]">Bono Cooperación</p>
              <p className="text-[9px] opacity-60 mt-1">Mantenimiento y Mejoras 2026</p>
            </div>
            
            {/* BOTÓN CON CONEXIÓN A LA VISTA DE PAGO */}
            <Link href="/dashboard/apoderado/pagar-bono" className="block mt-4">
              <button className="w-full bg-[#FF8FAB] text-white font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-pink-500/20">
                Pagar Bono Ahora
              </button>
            </Link>
          </div>
        </div>

        {/* GRUPO FAMILIAR */}
        <div className="flex items-center gap-4 mb-8">
          <Users className="text-[#FF8FAB]" size={28} />
          <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Cargas Académicas</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hijos.map((hijo) => (
            <div key={hijo.ALUMNO_ID} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative">
              <div className="absolute left-0 top-1/4 w-1.5 h-1/2 bg-[#FF8FAB] rounded-r-full" />
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#F8F9FA] rounded-4xl flex items-center justify-center text-[#FF8FAB] border border-[#FF8FAB]/20 group-hover:bg-[#1A1A2E] group-hover:text-white transition-all duration-500">
                    <Heart size={36} className={hijo.ES_TITULAR_FINAN === "S" ? "fill-current" : ""} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#FF8FAB] uppercase bg-[#FF8FAB]/10 px-3 py-1 rounded-full tracking-widest mb-2 inline-block">
                      {hijo.TIPO_RELACION}
                    </span>
                    <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none mt-1">
                      {hijo.alumno.NOMBRE} <br /> {hijo.alumno.APELLIDO_PATERNO}
                    </h3>
                  </div>
                </div>
                {hijo.ES_TITULAR_FINAN === "S" && (
                  <div className="bg-amber-50 p-3 rounded-2xl text-amber-500 border border-amber-100 flex flex-col items-center">
                    <CreditCard size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">Titular</span>
                  </div>
                )}
              </div>

              <Link 
                href={`/dashboard/apoderado/pagos/${hijo.ALUMNO_ID}`}
                className="w-full flex items-center justify-between px-8 py-5 bg-[#1A1A2E] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-3xl hover:bg-[#FF8FAB] transition-all duration-300"
              >
                Ver Detalle de Pagos <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}