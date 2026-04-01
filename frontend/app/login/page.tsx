"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // Importamos Link para la navegación
import Cookies from "js-cookie"
import { GraduationCap, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) 
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "", code: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MS_AUTH_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })

      if (res.ok) {
        setStep(2) 
      } else {
        alert("Credenciales incorrectas")
      }
    } catch (error) {
      alert("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MS_AUTH_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: formData.code })
      })

      const data = await res.json()

      if (res.ok) {
        Cookies.set("auth-token", data.token, { expires: 1 })
        router.push("/dashboard")
      } else {
        alert("Código incorrecto o expirado")
      }
    } catch (error) {
      alert("Error al verificar el código")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-plomo flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-sm border border-gray-100 p-10">
        <div className="flex flex-col items-center mb-8">
          {/* Cambiado a bg-brand (púrpura) */}
          <div className="bg-brand p-3 rounded-2xl text-white mb-4 shadow-lg shadow-purple-100">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión Lemac</h1>
          <p className="text-gray-400 text-sm">Portal de Administración Institucional</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                <input name="email" type="email" required onChange={handleChange} className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 transition-all" placeholder="nombre@lemac.cl" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                {/* Enlace de Olvidar Contraseña */}
                <Link href="/recuperar" className="text-[11px] font-bold text-brand hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
                <input name="password" type="password" required onChange={handleChange} className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 transition-all" placeholder="••••••••" />
              </div>
            </div>

            {/* Botón con color brand */}
            <button disabled={loading} className="w-full py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-purple-100 disabled:bg-gray-300 mt-2">
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>

            {/* Enlace para crear cuenta */}
            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-brand font-bold hover:underline">
                Crea una aquí
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verifica tu correo</h2>
              <p className="text-sm text-gray-400 px-4">Hemos enviado un código de seguridad a <span className="text-gray-600 font-medium">{formData.email}</span></p>
            </div>
            <input 
              name="code" 
              required 
              maxLength={6}
              onChange={handleChange}
              className="w-full p-5 text-center text-3xl font-black tracking-[1rem] bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20" 
              placeholder="000000" 
            />
            <button disabled={loading} className="w-full py-4 bg-brand text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-all">
              Confirmar Acceso <ArrowRight size={20} />
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">Volver al inicio</button>
          </form>
        )}
      </div>
    </div>
  )
}