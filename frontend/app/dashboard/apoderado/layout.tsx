"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link"
import { 
  LayoutDashboard, Receipt, LogOut, Home, PieChart, Users
} from "lucide-react"

export default function ApoderadoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState({ nombre: "Usuario", cargo: "Apoderado" })
  const [isChecking, setIsChecking] = useState(true)

  const checkRolApoderado = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const userRole = (payload.role || "").toUpperCase();
      const userRolesArray = (payload.roles || []).map((r: string) => r.toUpperCase());
      return userRole.includes("APO") || userRolesArray.some((r: string) => r.includes("APO"));
    } catch (e) { return false; }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth-token")
      if (!token || !checkRolApoderado(token)) {
        router.replace("/login")
        return
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserData({
          nombre: payload.nombre || "Usuario",
          cargo: payload.cargo || payload.role || "Apoderado"
        })
        setIsChecking(false)
      } catch (e) { router.replace("/login") }
    }
    checkAuth()
  }, [router])

  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  if (isChecking) return null

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
              <p className="text-[11px] font-black uppercase text-white tracking-wider">{userData.nombre}</p>
              <p className="text-[9px] font-bold text-[#FF8FAB] uppercase tracking-widest mt-0.5 opacity-80">{userData.cargo}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-8 overflow-y-auto no-scrollbar space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-6 tracking-[0.25em] opacity-50">Menú Principal</p>
            <div className="space-y-1.5">
              <Link href="/dashboard/apoderado" className={`flex items-center gap-3.5 px-4 py-4 rounded-xl text-[12px] font-black uppercase tracking-tighter transition-all ${pathname === "/dashboard/apoderado" ? 'bg-[#FF8FAB]/20 text-[#FF8FAB]' : 'text-slate-400 hover:text-white'}`}>
                <Home size={20} /> Inicio
              </Link>
              <Link href="/dashboard/apoderado/cuotas" className={`flex items-center gap-3.5 px-4 py-4 rounded-xl text-[12px] font-black uppercase tracking-tighter transition-all ${pathname.includes("/cuotas") ? 'bg-[#FF8FAB]/20 text-[#FF8FAB]' : 'text-slate-400 hover:text-white'}`}>
                <Receipt size={20} /> Mis Cuotas
              </Link>
              <Link href="/dashboard/apoderado/gastos" className={`flex items-center gap-3.5 px-4 py-4 rounded-xl text-[12px] font-black uppercase tracking-tighter transition-all ${pathname.includes("/gastos") ? 'bg-[#FF8FAB]/20 text-[#FF8FAB]' : 'text-slate-400 hover:text-white'}`}>
                <PieChart size={20} /> Transparencia
              </Link>
              <Link href="/dashboard/apoderado/familia" className={`flex items-center gap-3.5 px-4 py-4 rounded-xl text-[12px] font-black uppercase tracking-tighter transition-all ${pathname.includes("/familia") ? 'bg-[#FF8FAB]/20 text-[#FF8FAB]' : 'text-slate-400 hover:text-white'}`}>
                <Users size={20} /> Grupo Familiar
              </Link>
              <Link href="/dashboard/apoderado/historial" className={`flex items-center gap-3.5 px-4 py-4 rounded-xl text-[12px] font-black uppercase tracking-tighter transition-all ${pathname.includes("/historial") ? 'bg-[#FF8FAB]/20 text-[#FF8FAB]' : 'text-slate-400 hover:text-white'}`}>
                <LayoutDashboard size={20} /> Historial
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#161629]">
          <button onClick={handleLogout} className="flex items-center gap-3 p-4 w-full text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] justify-center border border-rose-500/10">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-10 min-h-screen">{children}</main>
    </div>
  )
}