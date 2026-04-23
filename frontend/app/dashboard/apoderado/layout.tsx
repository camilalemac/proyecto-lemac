"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link"
import { 
  LayoutDashboard, Receipt, LogOut, Home, PieChart, Users, Loader2 
} from "lucide-react"

// ARQUITECTURA LIMPIA
import { authService } from "../../../services/authService"

export default function ApoderadoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState({ nombre: "Usuario", cargo: "Apoderado" })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth-token")
      
      if (!token) {
        router.replace("/login")
        return
      }

      try {
        // Obtenemos los datos reales del backend
        const perfil = await authService.getMe()
        
        // Verificación estricta de rol
        const cargo = perfil.rol || ""
        if (!cargo.toUpperCase().includes("APO")) {
          router.replace("/dashboard/alumno") // Redirigir si no es apoderado
          return
        }

        setUserData({
          nombre: `${perfil.nombres} ${perfil.apellidos}`,
          cargo: perfil.rol || "Apoderado Titular"
        })
        setIsChecking(false)
      } catch (e) {
        console.error("Fallo de autenticación en Layout Apoderado")
        router.replace("/login")
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  if (isChecking) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#1A1A2E]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside className="w-72 bg-[#1A1A2E] text-white flex flex-col shadow-2xl fixed h-full z-50">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-2xl font-black tracking-tight text-white italic">Lemac<span className="text-[#FF8FAB]">Pay</span></h2>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#FF8FAB] to-rose-300 flex items-center justify-center text-[#1A1A2E] text-xl font-black shadow-lg shadow-rose-500/20">
              {userData.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="text-[11px] font-black uppercase text-white tracking-wider truncate">{userData.nombre}</p>
              <p className="text-[9px] font-bold text-[#FF8FAB] uppercase tracking-widest mt-0.5 opacity-80">{userData.cargo}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-8 overflow-y-auto no-scrollbar space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-6 tracking-[0.25em] opacity-50">Menú Familiar</p>
            <div className="space-y-1.5">
              <MenuLink href="/dashboard/apoderado" icon={<Home size={20} />} label="Inicio" active={pathname === "/dashboard/apoderado"} />
              <MenuLink href="/dashboard/apoderado/cuotas" icon={<Receipt size={20} />} label="Mis Cuotas" active={pathname.includes("/cuotas")} />
              <MenuLink href="/dashboard/apoderado/gastos" icon={<PieChart size={20} />} label="Transparencia" active={pathname.includes("/gastos")} />
              <MenuLink href="/dashboard/apoderado/familia" icon={<Users size={20} />} label="Grupo Familiar" active={pathname.includes("/familia")} />
              <MenuLink href="/dashboard/apoderado/historial" icon={<LayoutDashboard size={20} />} label="Historial" active={pathname.includes("/historial")} />
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#161629]">
          <button onClick={handleLogout} className="flex items-center gap-3 p-4 w-full text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] justify-center border border-rose-500/10">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}

// Pequeño componente interno para limpiar el código de los links
function MenuLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3.5 px-4 py-4 rounded-xl text-[12px] font-black uppercase tracking-tighter transition-all ${active ? 'bg-[#FF8FAB]/20 text-[#FF8FAB]' : 'text-slate-400 hover:text-white'}`}>
      {icon} {label}
    </Link>
  )
}