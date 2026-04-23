"use client"
import React, { useEffect, useState } from "react"
import { Shield, LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA (Sube 3 niveles: ceal -> dashboard -> app -> raíz)
import { authService } from "../../../services/authService"

export default function CealLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    fullName: "Cargando...",
    roleName: "Identificando...",
    roleCode: ""
  })

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const perfil = await authService.getMe()
        
        setUserData({
          fullName: `${perfil.nombres} ${perfil.apellidos}`,
          // Busca el nombre del rol, si no lo encuentra usa un texto por defecto
          roleName: perfil.roles?.[0]?.nombre_rol || perfil.rol || "Directiva CEAL", 
          roleCode: perfil.roles?.[0]?.rol_code || ""
        })
      } catch (error) {
        console.error("Error de sesión o token inválido", error)
        router.push('/login') // Protege la ruta expulsando al login
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-[#1A1A2E] text-white px-8 py-4 shadow-xl border-b-4 border-[#FF8FAB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo e Institución */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="text-[#FF8FAB]" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Portal CEAL</h2>
              <p className="text-[9px] uppercase tracking-widest text-slate-400">Gestión LemacPay</p>
            </div>
          </div>

          {/* Identidad Dinámica */}
          <div className="flex items-center gap-5">
            <div className="text-right border-r border-white/10 pr-5 hidden md:block">
              <p className="text-sm font-black tracking-tight">{userData.fullName}</p>
              <span className="text-[10px] font-bold uppercase text-[#FF8FAB] bg-[#FF8FAB]/10 px-2 py-0.5 rounded">
                {userData.roleName}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="hover:text-rose-400 transition-colors p-2"
              title="Cerrar Sesión"
            >
              <LogOut size={22} />
            </button>
          </div>

        </div>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}