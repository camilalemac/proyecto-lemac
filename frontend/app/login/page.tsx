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

      const userRole = result.data.user.role?.toLowerCase() ?? ""

      if (userRole === "fam_apo" || userRole === "apoderado") {
        router.push("/dashboard/apoderado")
      } else if (userRole === "alu_reg" || userRole === "alumno") {
        router.push("/dashboard/alumno")
      } else {
        router.push("/dashboard/alumno")
      }
    } catch {
      alert("Credenciales incorrectas o error de conexión")
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
          <p className="text-sm text-gray-400">Inicia sesión</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="correo@lemac.cl"
            required
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8FAB]"
          />
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8FAB]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF8FAB] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8FAB]/90 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/registro" className="text-[#FF8FAB] hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
