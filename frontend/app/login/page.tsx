"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { useLogin } from "@/hooks/useLogin"

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useLogin()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    try {
      const result = await login({
        email: email.toLowerCase().trim(),
        password,
      })

      // El role viene desde el payload decodificado en tu ruta de API (NextResponse)
      // Lo normalizamos a mayúsculas para que coincida exactamente con el script SQL
      const userRole = result.data.user.role?.toUpperCase() ?? ""

      console.log("Iniciando sesión con rol:", userRole);

      // --- LÓGICA DE REDIRECCIÓN BASADA EN TUS ROLES SQL ---
      
      // 1. Administradores del Sistema
      if (userRole === 'SYS_ADMIN' || userRole === 'SUPERADMIN') {
        router.push('/dashboard/admin');
      } 
      
      // 2. Personal Directivo (Staff)
      else if (userRole === 'STF_DIR') {
        router.push('/dashboard/direccion');
      } 
      
      // 3. Profesores
      else if (userRole === 'STF_PROF') {
        router.push('/dashboard/profesor');
      } 
      
      // 4. Apoderados (Titulares y Directiva)
      else if (userRole === 'FAM_APO' || userRole.startsWith('DIR_') && userRole.endsWith('_APO')) {
        // Si es un tesorero/presidente de apoderados, podrías mandarlo a una vista especial
        // o al dashboard general de apoderados con permisos extra.
        router.push('/dashboard/apoderado');
      } 
      
      // 5. Alumnos (Regulares y Directiva)
      else if (userRole === 'ALU_REG' || userRole.startsWith('DIR_') && userRole.endsWith('_ALU')) {
        router.push('/dashboard/alumno');
      } 
      
      // 6. Centros Generales (CAL / CAP)
      else if (userRole.startsWith('CEN_')) {
        router.push('/dashboard/centros');
      }

      // Caso por defecto
      else {
        console.warn("Rol no mapeado a una ruta:", userRole);
        router.push('/dashboard/general'); 
      }

    } catch (error: any) {
      console.error("Login error:", error)
      // Capturamos el mensaje que devuelve tu NextResponse
      alert(error.message || "Credenciales incorrectas o error de servidor");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#FF8FAB] p-3 rounded-xl text-white mb-3 shadow-lg">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Gestión Lemac</h1>
          <p className="text-sm text-gray-400">Plataforma Educativa 2026</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="correo@lemac.cl"
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8FAB] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8FAB] outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF8FAB] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8FAB]/90 disabled:opacity-50 shadow-md transition-colors"
          >
            {loading ? "Verificando..." : "Ingresar al Sistema"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta? {" "}
          <Link href="/registro" className="text-[#FF8FAB] font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}