"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link"
import { 
  LayoutDashboard, Receipt, History, ShieldCheck,
  LogOut, Users, ArrowLeft,
  FileText, Wallet, Loader2
} from "lucide-react"

import { authService } from "../../../services/authService"

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userCargo, setUserCargo] = useState<string>("Alumno")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth-token")
      
      // Si no hay token, directo al login sin preguntar
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // 1. Cargamos de caché local para que la pantalla cargue rápido
        const cached = localStorage.getItem("user-profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          setUserCargo(parsed.rol || parsed.roles?.[0]?.rol_code || "ALU_REG");
        }

        // 2. Validamos con el backend
        const perfil = await authService.getMe()
        
        // Extraemos el rol correctamente basado en cómo lo devuelve tu Oracle
        const rolReal = perfil.rol || perfil.roles?.[0]?.rol_code || "ALU_REG"
        setUserCargo(rolReal)
        
      } catch {
        console.warn("🛡️ Seguridad: Sesión expirada o token inválido. Limpiando datos...")
        // Limpiamos los datos viejos para que no haya bucles
        Cookies.remove("auth-token")
        localStorage.removeItem("user-profile")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [pathname, router])

  // 1. Lógica de Detección de Roles (Normalizada)
  const cargo = userCargo.toUpperCase()
  const esCeal = cargo.includes("CEN_PRES") || cargo.includes("CEAL")
  const esPresidente = cargo.includes("DIR_PRES")
  const esSecretario = cargo.includes("SEC")
  const esTesorero = cargo.includes("TES")
  
  const esDirectivo = esCeal || esPresidente || esSecretario || esTesorero

  // 2. Menús según ubicación
  const menuAlumno = [
    { name: "Inicio", path: "/dashboard/alumno", icon: <LayoutDashboard size={20} /> },
    { name: "Mis Cuotas", path: "/dashboard/alumno/cuotas", icon: <Receipt size={20} /> },
    { name: "Historial", path: "/dashboard/alumno/historial", icon: <History size={20} /> },
  ]

  const menuTesorero = [
    { name: "Panel Financiero", path: "/dashboard/alumno/tesorero", icon: <Wallet size={20} /> },
    { name: "Gestión de Cobranza", path: "/dashboard/alumno/tesorero/cobranza", icon: <Users size={20} /> },
    { name: "Reportes Oficiales", path: "/dashboard/alumno/tesorero/reportes", icon: <FileText size={20} /> },
  ]

  // 3. Selección de Menú Activo
  let menuActivo = menuAlumno
  let tituloPortal = "PORTAL ALUMNO"
  let rutaGestion = ""

  if (pathname.includes("/tesorero")) {
    menuActivo = menuTesorero
    tituloPortal = "TESORERÍA"
  } 

  // Determinar ruta para el botón de "Entrar a Gestión"
  if (esTesorero) rutaGestion = "/dashboard/alumno/tesorero"
  else if (esPresidente) rutaGestion = "/dashboard/alumno/presidente"
  else if (esCeal) rutaGestion = "/dashboard/alumno/ceal-presidente"

  const handleLogout = () => {
    Cookies.remove("auth-token")
    localStorage.removeItem("user-profile")
    router.push("/login")
  }

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#1A1A2E]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      
      <aside className="w-72 bg-[#1A1A2E] text-white flex flex-col shadow-2xl sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-2xl font-black tracking-tight">
            Lemac<span className="text-[#FF8FAB]">Pay</span>
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-1 font-bold">
            {tituloPortal}
          </p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuActivo.map((item, i) => (
            <NavLink key={i} href={item.path} active={pathname === item.path}>
              {item.icon} {item.name}
            </NavLink>
          ))}

          {/* Botón especial si es directivo pero está en la vista normal */}
          {esDirectivo && !pathname.includes("/presidente") && !pathname.includes("/tesorero") && (
            <div className="pt-6 mt-6 border-t border-white/5">
              <p className="text-[10px] text-[#FF8FAB] font-bold uppercase px-3 mb-4 tracking-widest">Gestión</p>
              <NavLink href={rutaGestion} active={false} isSpecial>
                <ShieldCheck size={20} /> Entrar a Panel Oficial
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          {/* Botón para volver desde paneles de gestión */}
          {(pathname.includes("/tesorero") || pathname.includes("/presidente")) && (
             <Link href="/dashboard/alumno" className="flex items-center gap-3 p-3 w-full text-gray-400 hover:text-white transition-colors text-sm font-medium">
               <ArrowLeft size={18} /> Volver a Alumno
             </Link>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active: boolean;
  isSpecial?: boolean;
}

function NavLink({ href, children, active, isSpecial = false }: NavLinkProps) {
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