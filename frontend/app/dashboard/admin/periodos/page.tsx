"use client"
import React, { useState, useEffect } from "react"
import { 
  CalendarDays, Plus, ArrowLeft, Loader2, 
  ServerOff, CheckCircle2, XCircle, Clock, 
  Trash2, Edit3, ShieldCheck, AlertTriangle 
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// IMPORTACIONES ARQUITECTURA LIMPIA
import { academicoService } from "../../../../services/academicoService"
import { IPeriodo } from "../../../../types/admin.types"

export default function GestionPeriodosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [conexionBackend, setConexionBackend] = useState(true)
  
  // Tipado estricto
  const [periodos, setPeriodos] = useState<IPeriodo[]>([])
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    ANIO: new Date().getFullYear() + 1,
    NOMBRE: "",
    FECHA_INICIO: "",
    FECHA_FIN: ""
  })

  const checkAdminAuth = () => {
    const token = Cookies.get("auth-token")
    if (!token) return false

    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      return payload.role === "SYS_ADMIN"
    } catch (e) {
      return false
    }
  }

  const fetchPeriodos = async () => {
    if (!checkAdminAuth()) {
      router.push("/login") 
      return
    }
    setAuthorized(true)

    try {
      // ✅ CONSUMO DE BACKEND REAL
      const rawData = await academicoService.getPeriodos();
      
      // Mapeo defensivo
      const mappedPeriodos = rawData.map((p: any) => ({
        ...p,
        PERIODO_ID: p.PERIODO_ID || p.periodoId,
        ANIO: p.ANIO || p.anio,
        NOMBRE: p.NOMBRE || p.nombre,
        FECHA_INICIO: p.FECHA_INICIO || p.fechaInicio,
        FECHA_FIN: p.FECHA_FIN || p.fechaFin,
        ESTADO: p.ESTADO || p.estado || "PLANIFICACION"
      }));

      setPeriodos(mappedPeriodos)
      setConexionBackend(true)
    } catch (err) {
      console.error(err);
      setConexionBackend(false)
      setPeriodos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPeriodos() }, [])

  // ✅ CREAR PERIODO (POST)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Formateamos las fechas si están vacías para evitar errores en DB
      const payload = {
        ANIO: formData.ANIO,
        NOMBRE: formData.NOMBRE,
        FECHA_INICIO: formData.FECHA_INICIO || null,
        FECHA_FIN: formData.FECHA_FIN || null
      };

      const data = await academicoService.createPeriodo(payload);
      
      if (data.success) {
        setShowModal(false);
        setFormData({ ANIO: new Date().getFullYear() + 1, NOMBRE: "", FECHA_INICIO: "", FECHA_FIN: "" });
        fetchPeriodos();
      } else {
        alert("Error al crear: " + data.message);
      }
    } catch (error) {
      alert("Error crítico de conexión con Oracle.");
    }
  }

  if (loading || !authorized) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FDF2F5] gap-4">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verificando credenciales de Administrador...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF2F5] p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* BOTÓN VOLVER */}
      <Link href="/dashboard/admin" className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al inicio
      </Link>

      {/* HEADER DE GESTIÓN */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <CalendarDays size={250} className="absolute -right-10 -bottom-10 text-pink-50 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#0F172A] p-6 rounded-3xl text-[#FF8FAB] shadow-2xl">
            <CalendarDays size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none italic">Periodos Académicos</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Control de Ciclos Escolares Registrados</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="relative z-10 bg-[#0F172A] text-white px-10 py-5 rounded-4xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-pink-600 transition-all shadow-xl shadow-slate-900/20"
        >
          <Plus size={18} className="text-[#FF8FAB]" /> Crear Nuevo Periodo
        </button>
      </header>

      {/* LISTADO DE PERIODOS REALES */}
      <div className="grid grid-cols-1 gap-6 relative z-10">
        {!conexionBackend && (
          <div className="bg-[#0F172A] text-pink-200 p-8 rounded-[3rem] flex items-center justify-center gap-4 border border-pink-500/20">
            <ServerOff size={24} className="text-pink-500" />
            <p className="text-xs font-black uppercase tracking-widest">Error: Sin acceso al microservicio académico</p>
          </div>
        )}

        {periodos.length > 0 ? periodos.map((periodo) => (
          <div key={periodo.PERIODO_ID} className="bg-white p-8 rounded-[3rem] border border-pink-50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-6 group">
            <div className="flex items-center gap-8">
              <div className="text-5xl font-black text-[#0F172A] opacity-10 group-hover:opacity-100 transition-opacity italic uppercase">
                {periodo.ANIO}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">{periodo.NOMBRE}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <Clock size={12} /> 
                    {periodo.FECHA_INICIO ? new Date(periodo.FECHA_INICIO).toLocaleDateString('es-CL') : 'S/F'} — 
                    {periodo.FECHA_FIN ? new Date(periodo.FECHA_FIN).toLocaleDateString('es-CL') : 'S/F'}
                  </div>
                  <StatusBadge status={periodo.ESTADO || "PLANIFICACION"} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all">
                  <Edit3 size={18} />
               </button>
               <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        )) : conexionBackend && (
          <div className="text-center py-20 opacity-20 flex flex-col items-center">
            <CalendarDays size={60} className="text-[#0F172A] mb-4" />
            <p className="font-black uppercase tracking-tighter text-2xl text-[#0F172A]">No hay periodos en la base de datos</p>
          </div>
        )}
      </div>

      {/* FOOTER TÉCNICO */}
      <div className="bg-[#0F172A] p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <ShieldCheck className="text-[#FF8FAB]" size={32} />
            <p className="text-[10px] font-medium max-w-md leading-relaxed text-slate-400 uppercase tracking-wider">
              Acceso Restringido: Estás operando con privilegios de <span className="text-[#FF8FAB] font-bold">SUPERADMIN</span>.
            </p>
         </div>
      </div>

      {/* MODAL DE CREACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-md bg-[#0F172A]/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl p-12 relative border border-pink-100">
            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic mb-8">Apertura Año Escolar</h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Año Académico</label>
                  <input 
                    type="number" 
                    value={formData.ANIO} 
                    onChange={(e) => setFormData({...formData, ANIO: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-pink-200 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Estado</label>
                  <div className="w-full bg-pink-50 text-[#FF8FAB] rounded-2xl px-6 py-4 font-black uppercase text-[10px] border border-pink-100 text-center">PLANIFICACIÓN</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Nombre Identificador</label>
                <input 
                  type="text" 
                  placeholder="Ej: Año Escolar 2026"
                  value={formData.NOMBRE} 
                  onChange={(e) => setFormData({...formData, NOMBRE: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-pink-200 transition-all" 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#0F172A] text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20 italic">Guardar en Oracle</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase() || "";
  const isActivo = s === "ACTIVO"
  const isCerrado = s === "CERRADO"
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
      isActivo ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
      isCerrado ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-600 border border-amber-100'
    }`}>
      {isActivo ? <CheckCircle2 size={10} /> : isCerrado ? <XCircle size={10} /> : <Clock size={10} />}
      {s || 'PENDIENTE'}
    </div>
  )
}