"use client"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { GraduationCap, LogOut, Home, Receipt, History } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-plomo">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-8 flex items-center gap-3">
          {/* Color Brand (Púrpura) */}
          <div className="bg-brand p-2 rounded-xl text-white shadow-lg shadow-purple-100">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Lemac</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {/* Botón activo con color Brand */}
          <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl bg-purple-50 text-brand font-bold transition-all">
            <Home size={18} /> Inicio
          </button>
          <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all font-medium">
            <Receipt size={18} /> Mis Cuotas
          </button>
          <button className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all font-medium">
            <History size={18} /> Historial
          </button>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-50 rounded-2xl transition-all group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-bold text-gray-800">Panel Principal</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Bárbara Quezada</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Informatica</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-brand font-bold">
              B
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}