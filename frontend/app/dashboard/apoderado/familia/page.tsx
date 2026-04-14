"use client"
import React, { useState, useEffect } from "react"
import { Users, Loader2, Heart, ArrowLeft, GraduationCap, MapPin, Search, AlertCircle, ChevronRight, Mail } from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Interfaz ajustada a lo que devuelve tu familia.repository (QueryTypes.SELECT)
interface Hijo {
  RELACION_ID: number;
  ALUMNO_ID: number;
  ALUMNO_NOMBRES: string;
  ALUMNO_APELLIDOS: string;
  ALUMNO_RUT: string;
  ALUMNO_RUT_DV: string;
  TIPO_RELACION: string;
  ES_TITULAR_FINAN: string;
  ES_APODERADO_ACAD: string;
  CURSO?: string; // Viene del JOIN si lo agregas o se deja opcional
}

export default function MiFamiliaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pupilos, setPupilos] = useState<Hijo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchHijos = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        // 🔒 BLOQUEO DE SEGURIDAD: Redirigir si no hay sesión
        if (!token) {
          router.push("/login")
          return
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }

        // ✅ Petición al backend real (Usa la ruta de tu familia.routes.ts)
        const res = await fetch(`${GATEWAY_URL}/academico/familias/mis-hijos`, { headers })
        const contentType = res.headers.get("content-type")
        
        if (contentType && contentType.includes("application/json")) {
           const json = await res.json()
           if (json.success) {
              setPupilos(json.data || [])
           } else {
              setErrorMsg(json.message || "No se pudo cargar la información familiar.")
           }
        } else {
           throw new Error("Error de comunicación con el servidor (Respuesta no JSON).")
        }

      } catch (err: any) {
        console.error("Error cargando familia:", err)
        setErrorMsg("Problemas al conectar con el microservicio académico.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchHijos()
  }, [router])

  const pupilosFiltrados = pupilos.filter(p => {
    const nombreCompleto = `${p.ALUMNO_NOMBRES} ${p.ALUMNO_APELLIDOS}`.toLowerCase();
    return nombreCompleto.includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FDF2F5] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/60">Consultando Oracle Académico...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF2F5] p-8 space-y-10 animate-in fade-in duration-700">
      
      <Link href="/dashboard/apoderado" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al Portal
      </Link>

      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <Heart size={250} className="absolute -right-10 -bottom-10 text-pink-50 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <Users size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Mi Familia</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Cargas Académicas Registradas</p>
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-96">
           <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
           </div>
           <input 
             type="text" 
             placeholder="Buscar alumno por nombre..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-50 border border-slate-100 rounded-4xl pl-14 pr-6 py-5 font-bold text-[#1A1A2E] text-sm outline-none focus:ring-2 focus:ring-pink-200 transition-all placeholder:text-slate-300"
           />
        </div>
      </header>

      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl mb-8 flex items-center gap-4 border border-rose-100 font-bold text-xs uppercase tracking-tight">
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10 pb-20">
        {pupilosFiltrados.length > 0 ? pupilosFiltrados.map((hijo) => (
          <div key={hijo.RELACION_ID} className="bg-white rounded-[3.5rem] border border-pink-50 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col justify-between">
            <div className="p-10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-pink-50 p-4 rounded-2xl text-rose-400 border border-pink-100">
                   <GraduationCap size={28} />
                </div>
                <span className="bg-[#1A1A2E] text-[#FF8FAB] px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                   {hijo.TIPO_RELACION}
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter mb-1">
                 {hijo.ALUMNO_NOMBRES} <br /> {hijo.ALUMNO_APELLIDOS}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                 RUT: {hijo.ALUMNO_RUT}-{hijo.ALUMNO_RUT_DV}
              </p>
              
              <div className="space-y-4 border-t border-pink-50 pt-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Registro</p>
                  <p className="text-sm font-black text-[#1A1A2E] uppercase">VÍNCULO ACTIVO</p>
                </div>
                
                <div className="flex gap-2">
                   <div className={`flex-1 p-3 rounded-xl border text-center text-[8px] font-black uppercase tracking-widest ${hijo.ES_TITULAR_FINAN === 'S' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      Sostenedor Finan.
                   </div>
                   <div className={`flex-1 p-3 rounded-xl border text-center text-[8px] font-black uppercase tracking-widest ${hijo.ES_APODERADO_ACAD === 'S' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      Apoderado Acad.
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100">
               <Link href={`/dashboard/apoderado/cuotas?alumno=${hijo.ALUMNO_ID}`} className="w-full bg-white text-[#1A1A2E] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-colors shadow-sm border border-slate-200">
                  Estado de Cuenta <ChevronRight size={14} />
               </Link>
            </div>
          </div>
        )) : !loading && !errorMsg && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-40">
            <Users size={80} className="text-[#1A1A2E] mb-6" />
            <p className="font-black uppercase tracking-widest text-[#1A1A2E] text-xl">Sin hijos vinculados</p>
          </div>
        )}
      </div>
    </div>
  )
}