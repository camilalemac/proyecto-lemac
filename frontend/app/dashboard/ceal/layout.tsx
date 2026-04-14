"use client"
import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { User, LogOut, Shield } from "lucide-react"

export default function CentroPadresLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState({
    fullName: "Cargando...",
    roleName: "Identificando...",
    roleCode: ""
  })

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = Cookies.get("auth-token")
        const response = await fetch("http://127.0.0.1:3007/api/v1/auth/me", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()

        if (result.success) {
          // Mapeo directo de los campos de tu base de datos
          setUserData({
            fullName: `${result.data.nombres} ${result.data.apellidos}`,
            roleName: result.data.nombre_rol, // Viene de idn_catalogo_roles
            roleCode: result.data.rol_code    // Ej: 'CEN_PRES_CAP'
          })
        }
      } catch (error) {
        console.error("Error de conexión con el backend", error)
      }
    }
    fetchSession()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-[#1A1A2E] text-white px-8 py-4 shadow-xl border-b-4 border-[#FF8FAB]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo e Institución */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="text-[#FF8FAB]" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gestión LemacPay</h2>
              <p className="text-[9px] uppercase tracking-widest text-slate-400">Conectado a Oracle Cloud</p>
            </div>
          </div>

          {/* Identidad Dinámica */}
          <div className="flex items-center gap-5">
            <div className="text-right border-r border-white/10 pr-5">
              <p className="text-sm font-black tracking-tight">{userData.fullName}</p>
              <span className="text-[10px] font-bold uppercase text-[#FF8FAB] bg-[#FF8FAB]/10 px-2 py-0.5 rounded">
                {userData.roleName}
              </span>
            </div>
            
            <button className="hover:text-rose-400 transition-colors">
              <LogOut size={22} />
            </button>
          </div>

        </div>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}