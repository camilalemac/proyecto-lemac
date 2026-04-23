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
      // 1. AUTENTICACIÓN: Obtener el accessToken
      const loginResult = await login({
        email: email.toLowerCase().trim(),
        password,
      })

      const token = loginResult.data.accessToken;

      if (!token) {
        throw new Error("No se pudo obtener el token de acceso.");
      }

      // 2. IDENTIDAD DINÁMICA: Consulta al puerto 3003 (MS_IDENTITY)
      // Usamos la ruta /me que configuramos en tu identity.controller.ts
      const responseMe = await fetch(`http://localhost:3003/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Si la respuesta no es OK, probablemente el token no es válido para el MS
      if (!responseMe.ok) {
        throw new Error("Error al validar identidad en el microservicio.");
      }

      const identity = await responseMe.json();

      // 3. ENRUTAMIENTO INTELIGENTE: Basado en tus tablas de Oracle
      // Accedemos a identity.data.roles[0].rol_code
      const primaryRole = identity.data.roles[0]?.rol_code?.toUpperCase() ?? "";
      
      console.log("Conexión exitosa. Rol detectado:", primaryRole);

      switch (true) {
        case (primaryRole === 'SYS_ADMIN' || primaryRole === 'SUPERADMIN'):
          router.push('/dashboard/admin');
          break;
        
        case (primaryRole === 'STF_DIR'):
          router.push('/dashboard/direccion');
          break;

        case (primaryRole === 'STF_PROF'):
          router.push('/dashboard/profesor');
          break;

        // Si es Apoderado regular o Directiva de Apoderados (Tesorero, Presidente, etc.)
        case (primaryRole === 'FAM_APO' || (primaryRole.startsWith('DIR_') && primaryRole.endsWith('_APO'))):
          router.push('/dashboard/apoderado');
          break;

        // Si es Alumno regular o Directiva de Alumnos
        case (primaryRole === 'ALU_REG' || (primaryRole.startsWith('DIR_') && primaryRole.endsWith('_ALU'))):
          router.push('/dashboard/alumno');
          break;

        case (primaryRole.startsWith('CEN_')):
          router.push('/dashboard/centros');
          break;

        default:
          router.push('/dashboard/general');
      }

    } catch (error: any) {
      console.error("Error en el flujo:", error);
      alert(error.message || "Error al conectar con MS_IDENTITY");
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