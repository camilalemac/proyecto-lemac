"use client"
import { useParams } from "next/navigation"
import { ArrowLeft, GraduationCap, Users, DollarSign } from "lucide-react"
import Link from "next/link"

export default function CursoDetallePage() {
  const params = useParams()
  const cursoId = params.id // Aquí obtienes '1ba', '2bb', etc.

  return (
    <div className="p-8 bg-[#FDF2F5] min-h-screen">
      {/* Botón Volver */}
      <Link href="/directora" className="flex items-center gap-2 text-slate-500 hover:text-[#FF8FAB] transition-colors mb-8 font-black text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> Volver al Panel
      </Link>

      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-pink-100 p-4 rounded-3xl text-[#FF8FAB]">
            <GraduationCap size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase">
              Detalles del Curso: {cursoId}
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
              Gestión Académica y Financiera 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Aquí irían tus microservicios de detalles */}
          <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100">
            <Users className="text-blue-500 mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lista de Alumnos</p>
            <p className="text-2xl font-black text-[#0F172A]">32 Estudiantes</p>
          </div>

          <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100">
            <DollarSign className="text-emerald-500 mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Pagos</p>
            <p className="text-2xl font-black text-[#0F172A]">Conforme</p>
          </div>
        </div>
      </div>
    </div>
  )
}