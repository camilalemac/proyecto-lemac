"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { Mail, Lock, ArrowLeft, LogIn, Loader2, GraduationCap } from "lucide-react";

// 1. Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email("Por favor, ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // 2. Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 3. Función que conecta con el Backend
  const onSubmit = async (data: LoginFormValues) => {
    setErrorGlobal(null);
    
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

        const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: data.email,
            password: data.password,
        }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error del servidor (Código ${response.status})`);
        }

      const result = await response.json();

      const tokenRecibido = result.data?.token || result.data?.accessToken;

      if (result.success && tokenRecibido) {
        // Guardamos el token
        Cookies.set("authToken", tokenRecibido, { expires: 1, secure: true }); 
        
        // Decodificamos el token
        const decodedToken = parseJwt(tokenRecibido);

        const rolesArray = decodedToken?.roles?.map((r: string) => r.toUpperCase()) || [];
        const roleString = decodedToken?.role?.toUpperCase();

        // Redirigimos
        if (rolesArray.includes("FAM_APO") || roleString === "FAM_APO") {
          router.push("/apoderado");
        } else if (rolesArray.includes("ALU_REG") || roleString === "ALU_REG") {
          router.push("/alumno"); 
        } else if (rolesArray.includes("STF_PROF") || roleString === "STF_PROF") {
          router.push("/profesor"); 
        } else if (rolesArray.includes("DIR_TES_APO") || roleString === "DIR_TES_APO") {
          router.push("/tesorero-apo");
        } else if (rolesArray.includes("DIR_TES_ALU") || roleString === "DIR_TES_ALU") {
          router.push("/tesorero-alu");  
        } else if (rolesArray.includes("DIR_SEC_APO") || roleString === "DIR_SEC_APO") {
          router.push("/secretario-apo"); 
        } else if (rolesArray.includes("DIR_SEC_ALU") || roleString === "DIR_SEC_ALU") {
          router.push("/secretario-alu");
        } else if (rolesArray.includes("DIR_PRES_APO") || roleString === "DIR_PRES_APO") {
          router.push("/presidente-apo");
        } else if (rolesArray.includes("DIR_PRES_ALU") || roleString === "DIR_PRES_ALU") {
          router.push("/presidente-alu");
        } else if (rolesArray.includes("CEN_PRES_CAL") || roleString === "CEN_PRES_CAL") {
        router.push("/presidente-cea");
        } else if (rolesArray.includes("CEN_TES_CAL") || roleString === "CEN_TES_CAL") {
        router.push("/tesorero-cea");
        } else if (rolesArray.includes("CEN_SEC_CAL") || roleString === "CEN_SEC_CAL") {
        router.push("/secretario-cea");
        } else if (rolesArray.includes("CEN_PRES_CAP") || roleString === "CEN_PRES_CAP") {
        router.push("/presidente-cep");
        } else if (rolesArray.includes("CEN_TES_CAP") || roleString === "CEN_TES_CAP") {
        router.push("/tesorero-cep");
        } else if (rolesArray.includes("CEN_SEC_CAP") || roleString === "CEN_SEC_CAP") {
        router.push("/secretario-cep");
        
        } else if (rolesArray.includes("STF_DIR") || roleString === "STF_DIR") {
        router.push("/directora");
        } else {
          router.push("/dashboard");
        }
      } else {
        throw new Error("El servidor no devolvió un token de acceso válido.");
      }
      
    } catch (error: any) {
      setErrorGlobal(error.message || "Ocurrió un error al intentar conectarse al servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      
      {/* Botón de volver */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
            <GraduationCap className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ingresa tus credenciales para acceder al portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Mensaje de Error Global */}
            {errorGlobal && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700">{errorGlobal}</p>
              </div>
            )}

            {/* Input Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none sm:text-sm transition-colors placeholder-black text-black`}
                  placeholder="ejemplo@correo.cl"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Input Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none sm:text-sm transition-colors placeholder-black text-black`}
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Botón Submit */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="-ml-1 mr-2 h-5 w-5" />
                    Ingresar
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enlace al registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}