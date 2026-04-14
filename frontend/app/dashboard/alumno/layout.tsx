"use client"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link"
import { 
  LayoutDashboard, Receipt, History, ShieldCheck,
  LogOut, Crown, Users, ArrowLeft, ArrowRightLeft,
  PieChart, BarChart3, FileText, Edit3, Wallet
} from "lucide-react"

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userCargo, setUserCargo] = useState<string>("Alumno")

  useEffect(() => {
    const token = Cookies.get("auth-token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const cargoActual = payload.role || payload.cargo || "Alumno"
        setUserCargo(cargoActual)
      } catch (e) {
        console.error("Error al decodificar token en Layout")
      }
    }
  }, [])

  // 1. Detectar Cargo
  const cargoNormalizado = userCargo.toLowerCase()
  const esCeal = cargoNormalizado === "ceal-presidente" || cargoNormalizado.includes("cen_pres")
  const esPresidenteCurso = cargoNormalizado === "presidente" || cargoNormalizado.includes("dir_pres")
  const esSecretario = cargoNormalizado === "secretario" || cargoNormalizado.includes("sec_")
  const esTesorero = cargoNormalizado === "tesorero" || cargoNormalizado.includes("tes_")
  
  const esDirectivo = esCeal || esPresidenteCurso || esSecretario || esTesorero

  // 2. Detectar dónde estamos navegando
  const estaEnPresidenteCurso = pathname.includes("/dashboard/alumno/presidente") && !pathname.includes("ceal-presidente")
  const estaEnCeal = pathname.includes("/dashboard/alumno/ceal-presidente")
  const estaEnSecretario = pathname.includes("/dashboard/alumno/secretario")
  const estaEnTesorero = pathname.includes("/dashboard/alumno/tesorero")
  
  const estaEnDirectiva = estaEnPresidenteCurso || estaEnCeal || estaEnSecretario || estaEnTesorero

  // 3. Menús Inteligentes
  const menuAlumno = [
    { name: "Inicio", path: "/dashboard/alumno", icon: <LayoutDashboard size={20} /> },
    { name: "Mis Cuotas", path: "/dashboard/alumno/cuotas", icon: <Receipt size={20} /> },
    { name: "Historial", path: "/dashboard/alumno/historial", icon: <History size={20} /> },
  ]

  const menuPresidenteCurso = [
    { name: "Panel Directiva", path: "/dashboard/alumno/presidente", icon: <Crown size={20} /> },
    { name: "Cobranza Curso", path: "/dashboard/alumno/presidente/cobranza", icon: <Users size={20} /> },
  ]

  const menuCeal = [
    { name: "Dashboard CEAL", path: "/dashboard/alumno/ceal-presidente", icon: <Crown size={20} /> },
    { name: "Libro Mayor", path: "/dashboard/alumno/ceal-presidente/ingresos-egresos", icon: <ArrowRightLeft size={20} /> },
    { name: "Gastos por Áreas", path: "/dashboard/alumno/ceal-presidente/gastos", icon: <PieChart size={20} /> },
    { name: "Balance 2026", path: "/dashboard/alumno/ceal-presidente/balance", icon: <BarChart3 size={20} /> },
    { name: "Reportes Oficiales", path: "/dashboard/alumno/ceal-presidente/reportes", icon: <FileText size={20} /> },
  ]

  const menuSecretario = [
    { name: "Actas de Reuniones", path: "/dashboard/alumno/secretario", icon: <Edit3 size={20} /> },
  ]

  // EL NUEVO MENÚ PARA EL TESORERO
  const menuTesorero = [
    { name: "Panel Financiero", path: "/dashboard/alumno/tesorero", icon: <Wallet size={20} /> },
    { name: "Gestión de Cobranza", path: "/dashboard/alumno/tesorero/cobranza", icon: <Users size={20} /> },
    { name: "Reportes Oficiales", path: "/dashboard/alumno/tesorero/reportes", icon: <FileText size={20} /> }, // ¡Aquí está la opción agregada!
  ]
  

  // 4. Decidimos qué mostrar en el Sidebar
  let menuActivo = menuAlumno
  let tituloPortal = "PORTAL ALUMNO"
  
  if (estaEnCeal) {
    menuActivo = menuCeal
    tituloPortal = "PORTAL CEAL"
  } else if (estaEnPresidenteCurso) {
    menuActivo = menuPresidenteCurso
    tituloPortal = "PORTAL DIRECTIVA"
  } else if (estaEnSecretario) {
    menuActivo = menuSecretario
    tituloPortal = "PORTAL SECRETARÍA"
  } else if (estaEnTesorero) {
    menuActivo = menuTesorero
    tituloPortal = "PORTAL TESORERÍA"
  }

  // Determinar a qué ruta debe llevar el botón especial de "Entrar a Gestión"
  let rutaDirectiva = "/dashboard/alumno/presidente"
  if (esCeal) rutaDirectiva = "/dashboard/alumno/ceal-presidente"
  if (esSecretario) rutaDirectiva = "/dashboard/alumno/secretario"
  if (esTesorero) rutaDirectiva = "/dashboard/alumno/tesorero"

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      
      <aside className="w-72 bg-[#1A1A2E] text-white flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-2xl font-black tracking-tight">
            Lemac<span className="text-[#FF8FAB]">Pay</span>
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-1 font-bold">
            {tituloPortal}
          </p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase px-3 mb-4 tracking-widest">General</p>
          
          {menuActivo.map((item, i) => {
            const isActive = pathname === item.path || 
              (item.path !== "/dashboard/alumno" && 
               item.path !== "/dashboard/alumno/presidente" && 
               item.path !== "/dashboard/alumno/ceal-presidente" && 
               item.path !== "/dashboard/alumno/secretario" &&
               item.path !== "/dashboard/alumno/tesorero" &&
               pathname.startsWith(item.path))

            return (
              <NavLink key={i} href={item.path} active={isActive}>
                {item.icon} {item.name}
              </NavLink>
            )
          })}

          {esDirectivo && !estaEnDirectiva && (
            <div className="pt-6 mt-6 border-t border-white/5">
              <p className="text-[10px] text-[#FF8FAB] font-bold uppercase px-3 mb-4 tracking-widest">
                Gestión
              </p>
              <NavLink href={rutaDirectiva} active={false} isSpecial>
                <ShieldCheck size={20} /> Entrar a Panel Oficial
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          {estaEnDirectiva && (
             <Link href="/dashboard/alumno" className="flex items-center gap-3 p-3 w-full text-gray-400 hover:text-white transition-colors text-sm font-medium">
               <ArrowLeft size={18} /> Volver a Alumno
             </Link>
          )}

          <button className="flex items-center gap-3 p-3 w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto">
        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, children, active, isSpecial = false }: any) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 p-3.5 rounded-2xl text-sm font-medium transition-all duration-200
        ${active 
          ? 'bg-[#FF8FAB]/10 text-[#FF8FAB]'
          : (isSpecial ? 'bg-white/5 text-[#FF8FAB] hover:bg-[#FF8FAB]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white')}
      `}
    >
      {children}
    </Link>
  )
}