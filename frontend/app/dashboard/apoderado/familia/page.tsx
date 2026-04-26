"use client"
import React, { useState, useEffect } from "react"
import { Users, Loader2, AlertCircle, ArrowLeft, GraduationCap, Heart, Calendar, FileText } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { academicoService } from "../../../../services/academicoService"
import { IPupilo } from "../../../../types/admin.types"

export default function GrupoFamiliarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pupilos, setPupilos] = useState<IPupilo[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadFamilia = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          router.push("/login")
          return
        }

        // Llamada al microservicio académico para obtener los hijos vinculados
        const dataHijos = await academicoService.getMisHijos()
        setPupilos(dataHijos)

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al sincronizar el grupo familiar.";
        console.error("Error cargando familia:", message);
        setErrorMsg("No se pudo cargar la información del grupo familiar en este momento.");
      } finally {
        setLoading(false)
      }
    }

    loadFamilia()
  }, [router])

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A2E]/40">Cargando Registro Familiar...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* NAVEGACIÓN */}
      <Link href="/dashboard/apoderado" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Portal
      </Link>

      {/* HEADER */}
      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-[#1A1A2E] rounded-3xl text-[#FF8FAB] shadow-xl"><Users size={28} /></div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Grupo Familiar</h1>
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Gestión de pupilos y cargas académicas</p>
           </div>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-indigo-100 flex items-center gap-2 shadow-sm">
          <GraduationCap size={16} /> Registro Académico Oficial
        </div>
      </header>

      {/* MENSAJE DE ERROR CONTROLADO */}
      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-8 rounded-4xl border border-rose-100 flex items-center gap-4 shadow-sm">
          <AlertCircle size={24} />
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1">Error de Conexión</p>
            <p className="text-sm font-bold opacity-80">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {!errorMsg && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pupilos.length > 0 ? (
            pupilos.map((hijo) => (
              <div key={hijo.ALUMNO_ID} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                 {/* 🛡️ CORRECCIÓN DE TAILWIND (bg-linear-to-r) */}
                 <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#FF8FAB] to-rose-300" />
                 
                 <div className="flex justify-between items-start mb-8">
                    <div className="bg-rose-50 p-4 rounded-3xl text-rose-400 group-hover:scale-110 transition-transform shadow-inner">
                      <GraduationCap size={32} />
                    </div>
                    <span className="bg-[#1A1A2E] text-[#FF8FAB] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                      {hijo.TIPO_RELACION}
                    </span>
                 </div>
                 
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Heart size={10} /> Estudiante Regular
                    </p>
                    <h3 className="text-2xl font-black text-[#1A1A2E] leading-tight uppercase mb-4">
                      {hijo.ALUMNO_NOMBRES} <br /> {hijo.ALUMNO_APELLIDOS}
                    </h3>
                    
                    <div className="space-y-3 mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-slate-500">
                        <FileText size={16} className="text-slate-400" />
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-widest">RUT Estudiante</p>
                          <p className="text-xs font-bold text-[#1A1A2E]">{hijo.ALUMNO_RUT}-{hijo.ALUMNO_RUT_DV}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <Calendar size={16} className="text-slate-400" />
                        <div>
                          <p className="text-[9px] uppercase font-black tracking-widest">Vinculación</p>
                          {/* 🛡️ CORRECCIÓN TYPESCRIPT: Evitamos el error de IPupilo forzando un tipo genérico local */}
                          <p className="text-xs font-bold text-[#1A1A2E]">
                            {new Date((hijo as unknown as Record<string, string>).FECHA_CREACION || new Date()).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <Link 
                   href={`/dashboard/apoderado/cuotas?alumno=${hijo.ALUMNO_ID}`} 
                   className="mt-8 w-full bg-slate-50 text-[#1A1A2E] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-colors border border-slate-100"
                 >
                    Ver Estado Financiero
                 </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-20 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center opacity-70">
               <div className="p-8 bg-slate-50 rounded-full text-slate-300 mb-6">
                 <Users size={64} />
               </div>
               <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight mb-2">Sin cargas académicas</h3>
               <p className="text-xs text-slate-400 max-w-sm font-medium uppercase tracking-widest leading-relaxed">
                 Actualmente no existen estudiantes vinculados a su perfil como apoderado titular.
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}