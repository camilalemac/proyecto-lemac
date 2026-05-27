"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { validarRut, desagregarRut } from "@/lib/utils";
import { 
  User, Mail, Lock, MapPin, Building, Map, 
  ArrowLeft, UserPlus, Loader2, CreditCard 
} from "lucide-react";

// --- ESQUEMA DE VALIDACIÓN (ZOD) ---
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const registroSchema = z.object({
  rol: z.enum(["ALU_REG", "FAM_APO"], { errorMap: () => ({ message: "Seleccione un rol válido" }) }),
  rut: z.string().min(1, "El RUT es obligatorio").refine(validarRut, { message: "RUT inválido" }),
  nombres: z.string().min(2, "Mínimo 2 caracteres"),
  apellidos: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Correo inválido"),
  regionId: z.string().min(1, "Seleccione una región"),
  provinciaId: z.string().min(1, "Seleccione una provincia"),
  comunaId: z.string().min(1, "Seleccione una comuna"),
  password: z.string().regex(passwordRegex, "Mín. 8 chars, 1 mayúscula, 1 número, 1 símbolo"),
  confirmPassword: z.string().min(1, "Confirme su contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof registroSchema>;

export default function RegistroPage() {
  const router = useRouter();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);
  

  // Estados para datos geográficos
  const [regiones, setRegiones] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [comunas, setComunas] = useState<any[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset }  = useForm<FormValues>({
    resolver: zodResolver(registroSchema),
  });

  // Observar cambios en los selects geográficos
  const regionId = watch("regionId");
  const provinciaId = watch("provinciaId");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

  // --- CARGA DE DATOS GEO ---
  useEffect(() => {
    fetch(`${API_URL}/geo/regiones`)
      .then(async (res) => {
        if (!res.ok) {
          const texto = await res.text();
          throw new Error(`Ruta no encontrada o error del servidor. Respuesta: ${texto.substring(0, 50)}...`);
        }
        return res.json();
      })
      .then((result) => setRegiones(result.data || []))
      .catch((err) => console.error("Error cargando regiones:", err));
  }, []);

  useEffect(() => {
    // 2. Cargar Provincias cuando cambia la Región
    if (regionId) {
      // Cambio clave: Usamos Path Parameters /:idRegion
      fetch(`${API_URL}/geo/provincias/${regionId}`) 
        .then((res) => res.json())
        .then((result) => {
          setProvincias(result.data || []);
          setValue("provinciaId", ""); // Resetear dependientes
          setValue("comunaId", "");
          setComunas([]);
        })
        .catch((err) => console.error("Error cargando provincias:", err));
    }
  }, [regionId, setValue]);

  useEffect(() => {
    // 3. Cargar Comunas cuando cambia la Provincia
    if (provinciaId) {
      // Cambio clave: Usamos Path Parameters /:idProvincia
      fetch(`${API_URL}/geo/comunas/${provinciaId}`) 
        .then((res) => res.json())
        .then((result) => setComunas(result.data || []))
        .catch((err) => console.error("Error cargando comunas:", err));
    }
  }, [provinciaId]);

  // --- ENVÍO DEL FORMULARIO ---
  const onSubmit = async (data: any) => {
    try {
      let rutCuerpo = "";
      let rutDv = "";
      
      if (data.rut && typeof data.rut === 'string') {
        // 1. Primero removemos TODO lo que no sea número o letra K/k
        // Esto elimina automáticamente puntos, guiones, espacios o cualquier otra cosa.
        const textoLimpio = data.rut.replace(/[^0-9kK]/g, "").trim();

        if (textoLimpio.length > 1) {
          // 2. El último carácter siempre será el Dígito Verificador (DV)
          rutDv = textoLimpio.slice(-1).toUpperCase(); // Lo forzamos a mayúscula ('K') por si acaso
          
          // 3. Todo lo anterior es el cuerpo numérico
          rutCuerpo = textoLimpio.slice(0, -1);
        }
      }

      // Preparamos el payload exacto
      const payload = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: data.password,
        rol: data.rol,
        colegioId: 1, 
        rutCuerpo: String(rutCuerpo), 
        rutDv: String(rutDv),
        regionId: Number(data.regionId),
        provinciaId: Number(data.provinciaId),
        comunaId: Number(data.comunaId),
      };

      console.log("🚀 Payload corregido y enviado al backend:", payload); 

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("❌ Error de validación del backend:", result);
        const detalles = result.errors ? JSON.stringify(result.errors) : result.message;
        throw new Error(`Error ${response.status}: ${detalles || "Datos inválidos"}`);
      }

      alert("¡Registro exitoso!");
      reset(); 

    } catch (error: any) {
      console.error("Excepción capturada:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-white text-center">
            <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <h2 className="text-3xl font-extrabold tracking-tight">Crear Nueva Cuenta</h2>
            <p className="mt-2 text-blue-100 text-sm">Complete el formulario para registrarse en el portal</p>
          </div>

          <div className="p-8">
            {exito ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                  <UserPlus className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h3>
                <p className="text-slate-600">Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {errorGlobal && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-sm text-red-700">
                    {errorGlobal}
                  </div>
                )}

                {/* Sección: Identificación */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rol de Usuario</label>
                    <select {...register("rol")} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400">
                      <option value="">Seleccione un rol...</option>
                      <option value="ALU_REG">Alumno</option>
                      <option value="FAM_APO">Apoderado</option>
                    </select>
                    {errors.rol && <p className="mt-1 text-xs text-red-600">{errors.rol.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CreditCard className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" {...register("rut", { onChange: (e) => { e.target.value = e.target.value.replace(/[^0-9kK.\-]/g, "");}})} placeholder="12345678-9" maxLength={12} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400" />
                      
                    </div>
                    <p className="mt-1 text-xs text-slate-500 pl-1">Sin puntos y con guión</p>
                    {errors.rut && <p className="mt-1 text-xs text-red-600">{errors.rut.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombres</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" {...register("nombres")} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400" />
                    </div>
                    {errors.nombres && <p className="mt-1 text-xs text-red-600">{errors.nombres.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" {...register("apellidos")} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400" />
                    </div>
                    {errors.apellidos && <p className="mt-1 text-xs text-red-600">{errors.apellidos.message}</p>}
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Sección: Ubicación Geográfica */}
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Ubicación</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Región</label>
                    <select {...register("regionId")} className="block w-full border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400">
                      <option value="">Seleccione...</option>
                      {regiones.map((r: any) => (
                        // Corrección: Usamos r.regionId
                        <option key={`reg-${r.regionId}`} value={r.regionId}>{r.nombre}</option>
                      ))}
                    </select>
                    {errors.regionId && <p className="mt-1 text-xs text-red-600">{errors.regionId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
                    <select {...register("provinciaId")} disabled={!regionId} className="block w-full border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 text-slate-900 bg-white placeholder:text-slate-400">
                      <option value="">Seleccione...</option>
                      {provincias.map((p: any) => (
                        // Corrección: Usamos p.provinciaId
                        <option key={`prov-${p.provinciaId}`} value={p.provinciaId}>{p.nombre}</option>
                      ))}
                    </select>
                    {errors.provinciaId && <p className="mt-1 text-xs text-red-600">{errors.provinciaId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Comuna</label>
                    <select {...register("comunaId")} disabled={!provinciaId} className="block w-full border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 text-slate-900 bg-white placeholder:text-slate-400">
                      <option value="">Seleccione...</option>
                      {comunas.map((c: any) => (
                        // Corrección: Usamos c.comunaId
                        <option key={`com-${c.comunaId}`} value={c.comunaId}>{c.nombre}</option>
                      ))}
                    </select>
                    {errors.comunaId && <p className="mt-1 text-xs text-red-600">{errors.comunaId.message}</p>}
                  </div>
                </div>
                <hr className="border-slate-200" />

                {/* Sección: Credenciales */}
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Credenciales de Acceso</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-400" /></div>
                      <input type="email" {...register("email")} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400" />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                      <input type="password" {...register("password")} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 pl-1">Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial</p>
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                      <input type="password" {...register("confirmPassword")} className="block w-full pl-10 border border-slate-300 rounded-lg py-2.5 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 bg-white placeholder:text-slate-400" />
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Procesando...</> : "Crear Cuenta"}
                  </button>
                </div>

                <div className="text-center text-sm text-slate-600">
                  ¿Ya tienes una cuenta? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">Inicia sesión aquí</Link>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}