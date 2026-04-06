"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Receipt, 
  UserCircle, 
  History, 
  ShieldCheck,
  LogOut 
} from "lucide-react"

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userCargo, setUserCargo] = useState<string>("Alumno")

  // Obtenemos el cargo del token para saber qué mostrar en el menú
  useEffect(() => {
    const token = Cookies.get("auth-token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserCargo(payload.cargo || payload.role || "Alumno")
      } catch (e) {
        console.error("Error al decodificar token en Layout")
      }
    }
  }, [])

  // Definimos si es un cargo administrativo (Presidente, Secretario, Tesorero)
  const esDirectivo = userCargo === "Presidente" || userCargo === "Secretario" || userCargo === "Tesorero"

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      
      {/* ✅ SIDEBAR DINÁMICO */}
      <aside className="w-72 bg-[#1A1A2E] text-white flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight">
            Lemac <span className="text-[#FF8FAB]">Pay</span>
          </h2>
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mt-1 font-bold">Portal Alumno</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase px-3 mb-2 tracking-widest">General</p>
          
          <NavLink href="/dashboard/alumno" active={pathname === "/dashboard/alumno"}>
            <LayoutDashboard size={20} /> Inicio
          </NavLink>
          
          <NavLink href="/dashboard/alumno/cuotas" active={pathname.includes("/cuotas")}>
            <Receipt size={20} /> Mis Cuotas
          </NavLink>

          <NavLink href="/dashboard/alumno/historial" active={pathname.includes("/historial")}>
            <History size={20} /> Historial
          </NavLink>

          {/* ✅ SECCIÓN AUTOMÁTICA POR CARGO */}
          {esDirectivo && (
            <div className="pt-6 mt-6 border-t border-white/5">
              <p className="text-[10px] text-[#FF8FAB] font-bold uppercase px-3 mb-2 tracking-widest">
                Gestión: {userCargo}
              </p>
              
              <NavLink 
                href={`/dashboard/alumno/${userCargo.toLowerCase()}`} 
                active={pathname.includes(userCargo.toLowerCase())}
                isSpecial
              >
                <ShieldCheck size={20} /> Panel Directivo
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button className="flex items-center gap-3 p-3 w-full text-gray-400 hover:text-white transition-colors text-sm font-medium">
            <LogOut size={18} />  
          </button>
        </div>
      </aside>

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  )
}

// Componente auxiliar para los links del menú
function NavLink({ href, children, active, isSpecial = false }: any) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 p-3.5 rounded-2xl text-sm font-medium transition-all duration-200
        ${active 
          ? (isSpecial ? 'bg-[#FF8FAB] text-white shadow-lg shadow-[#FF8FAB]/20' : 'bg-white/10 text-white') 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'}
      `}
    >
      {children}
    </Link>
  )
}