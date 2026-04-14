"use client"
import React, { useEffect, useState } from "react"
import { User, LogOut, Shield } from "lucide-react"
import Cookies from "js-cookie"

interface UserSession {
  nombres: string;
  apellidos: string;
  rol: string;
}

export default function CentroPadresLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        if (!token) return; // Si no hay token, no hacemos la petición

        const res = await fetch("http://127.0.0.1:3007/api/v1/auth/me", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        
        const json = await res.json()

        // Leemos estrictamente lo que envía tu backend real
        if (json.status === "success" && json.data) {
          const { perfil, roles } = json.data;
          
          setUser({
            nombres: perfil.nombres,
            apellidos: perfil.apellidos,
            // Toma el nombre del rol oficial desde el catálogo de roles
            rol: roles.length > 0 ? roles[0].nombre_rol : "Usuario del Sistema"
          })
        }
      } catch (e) { 
        console.error("Error de conexión con el backend:", e) 
      }
    }
    getUserSession()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar Superior Institucional */}
      <nav className="bg-[#1A1A2E] text-white px-8 py-4 sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo y Nombre Dinámico / Genérico */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#FF8FAB] rounded-2xl flex items-center justify-center text-[#1A1A2E] font-black shadow-lg shadow-rose-500/20">
              <Shield size={24} />
            </div>
            <div className="hidden md:block">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF8FAB]">Plataforma de Gestión</p>
              <h2 className="text-lg font-bold leading-none tracking-tight">Portal Institucional</h2>
            </div>
          </div>

          {/* Identidad del Usuario desde el Backend */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block animate-in fade-in duration-500">
              <p className="text-sm font-black tracking-tight">
                {user ? `${user.nombres} ${user.apellidos}` : "Cargando sesión..."}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF8FAB] opacity-90">
                {user?.rol || "Verificando..."}
              </p>
            </div>

            {/* Avatar e Iconos */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-[#FF8FAB] transition-all duration-300 cursor-pointer shadow-inner">
                <User size={20} className="group-hover:text-[#1A1A2E] transition-colors" />
              </div>
              
              <div className="h-8 w-px bg-white/10 mx-1" /> {/* Separador */}

              <button 
                onClick={() => {
                  Cookies.remove("auth-token");
                  window.location.href = "/login";
                }}
                className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-400 group flex items-center gap-2"
                title="Cerrar Sesión"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido de las páginas (Dashboard, Cuotas, etc.) */}
      <main className="p-6 md:p-10 animate-in fade-in slide-in-from-top-2 duration-700">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}