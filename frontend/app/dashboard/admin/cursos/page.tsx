"use client"
import React, { useState, useEffect } from "react"
import { 
  LayoutGrid, Plus, ArrowLeft, Loader2, 
  ServerOff, GraduationCap, UserCheck, 
  Trash2, Edit3, ShieldCheck, Filter, 
  Users, BookOpen
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// IMPORTACIONES ARQUITECTURA LIMPIA
import { academicoService } from "../../../../services/academicoService"
import { ICurso } from "../../../../types/admin.types"

export default function GestionCursosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [conexionBackend, setConexionBackend] = useState(true)
  const [cursos, setCursos] = useState<ICurso[]>([])
  
  // Modales
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Formularios
  const [formData, setFormData] = useState({
    PERIODO_ID: "",
    NIVEL_ID: "",
    LETRA: "",
    PROFESOR_JEFE_ID: ""
  })

  const [editData, setEditData] = useState({
    CURSO_ID: 0,
    NIVEL_ID: "",
    LETRA: "",
    PROFESOR_JEFE_ID: ""
  })

  // Validación estricta de rol
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

  const fetchCursos = async () => {
    const isAdmin = checkAdminAuth()
    if (!isAdmin) {
      router.push("/login")
      return
    }

    setAuthorized(true)

    try {
      // 1. Llamada al servicio limpio
      const data = await academicoService.getCursos();
      
      // 2. Mapear datos si es necesario (Por si Oracle envía mayúsculas)
      const mappedCursos = data.map((c: any) => ({
        ...c,
        CURSO_ID: c.CURSO_ID || c.cursoId,
        LETRA: c.LETRA || c.letra,
        PERIODO_ANIO: c.PERIODO_ANIO || c.periodoAnio,
        NIVEL_NOMBRE_LARGO: c.NIVEL_NOMBRE_LARGO || c.nivelNombreLargo,
        PROFESOR_NOMBRES: c.PROFESOR_NOMBRES || c.profesorNombres,
        PROFESOR_APELLIDOS: c.PROFESOR_APELLIDOS || c.profesorApellidos,
        NIVEL_ID: c.NIVEL_ID || c.nivelId,
        PROFESOR_JEFE_ID: c.PROFESOR_JEFE_ID || c.profesorJefeId
      }));

      setCursos(mappedCursos)
      setConexionBackend(true)
    } catch (err) {
      console.error("Error cargando cursos:", err);
      setConexionBackend(false)
      setCursos([]) 
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCursos() }, [])

  // ✅ CREAR CURSO (POST)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        PERIODO_ID: parseInt(formData.PERIODO_ID),
        NIVEL_ID: parseInt(formData.NIVEL_ID),
        LETRA: formData.LETRA.toUpperCase(),
        PROFESOR_JEFE_ID: formData.PROFESOR_JEFE_ID ? parseInt(formData.PROFESOR_JEFE_ID) : null
      }

      const data = await academicoService.createCurso(payload);
      
      if (data.success) {
        setShowModal(false);
        setFormData({ PERIODO_ID: "", NIVEL_ID: "", LETRA: "", PROFESOR_JEFE_ID: "" })
        fetchCursos();
      } else {
        alert("Error al crear: " + (data.message || "Verifica si el curso ya existe (Límite UNIQUE Oracle)."));
      }
    } catch (error) {
      alert("Error crítico de conexión con Oracle.");
    }
  }

  // ✅ ABRIR MODAL EDICIÓN
  const openEditModal = (curso: ICurso) => {
    setEditData({
      CURSO_ID: curso.CURSO_ID as number,
      NIVEL_ID: String(curso.NIVEL_ID || ""),
      LETRA: curso.LETRA || "",
      PROFESOR_JEFE_ID: String(curso.PROFESOR_JEFE_ID || "")
    })
    setShowEditModal(true)
  }

  // ✅ EDITAR CURSO (PUT)
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        NIVEL_ID: parseInt(editData.NIVEL_ID),
        LETRA: editData.LETRA.toUpperCase(),
        PROFESOR_JEFE_ID: editData.PROFESOR_JEFE_ID ? parseInt(editData.PROFESOR_JEFE_ID) : null
      }

      const data = await academicoService.updateCurso(editData.CURSO_ID, payload);
      
      if (data.success) {
        setShowEditModal(false);
        fetchCursos();
      } else {
        alert("Error al actualizar: " + data.message);
      }
    } catch (error) {
      alert("Error crítico de conexión con Oracle.");
    }
  }

  // ✅ ELIMINAR CURSO (DELETE)
  const handleDelete = async (cursoId: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar el curso ID ${cursoId}? Esta acción es irreversible.`)) return;

    try {
      const data = await academicoService.deleteCurso(cursoId);
      
      if (data.success) {
        fetchCursos();
      } else {
        alert("Error al eliminar: " + data.message);
      }
    } catch (error) {
      alert("Error de red al intentar eliminar.");
    }
  }

  if (loading || !authorized) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FDF2F5] gap-4">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] opacity-60">Escaneando Estructura Académica...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF2F5] p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* NAVEGACIÓN */}
      <Link href="/dashboard/admin" className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group w-fit">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Infraestructura del Sistema
      </Link>

      {/* HEADER */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <GraduationCap size={250} className="absolute -right-10 -bottom-10 text-pink-50 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#0F172A] p-6 rounded-3xl text-white shadow-2xl">
            <LayoutGrid size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none italic">Gestión de Cursos</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Configuración de Salas y Grados Académicos</p>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
          <button className="bg-slate-50 text-[#0F172A] p-5 rounded-2xl hover:bg-pink-50 transition-colors border border-pink-100">
            <Filter size={20} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#0F172A] text-white px-10 py-5 rounded-4xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#1e293b] transition-all shadow-xl shadow-slate-900/20 italic"
          >
            <Plus size={18} className="text-[#FF8FAB]" /> Crear Curso
          </button>
        </div>
      </header>

      {/* GRILLA DE CURSOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
        {!conexionBackend && (
          <div className="col-span-full bg-[#0F172A] text-pink-200 p-10 rounded-[3rem] text-center border border-pink-500/20">
            <ServerOff size={40} className="mx-auto mb-4 text-pink-500" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">MS_ACADEMICO Offline • Oracle DB no accesible</p>
          </div>
        )}

        {cursos.length > 0 ? cursos.map((curso) => (
          <div key={curso.CURSO_ID} className="bg-white rounded-[3.5rem] border border-pink-50 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
            <div className="p-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-[#0F172A]/20">
                  {curso.LETRA}
                </div>
                <div className="text-right italic">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Año Periodo</p>
                  <p className="text-sm font-black text-[#0F172A]">{curso.PERIODO_ANIO || "Activo"}</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter mb-2">
                {curso.NIVEL_NOMBRE_LARGO || `Nivel ID ${curso.NIVEL_ID}`}
              </h3>
              
              <div className="space-y-4 mt-8 border-t border-pink-50 pt-8">
                <div className="flex items-center gap-3">
                  <UserCheck size={16} className="text-[#FF8FAB]" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Profesor Jefe</p>
                    <p className="text-xs font-bold text-[#0F172A] uppercase">
                      {curso.PROFESOR_NOMBRES 
                        ? `${curso.PROFESOR_NOMBRES} ${curso.PROFESOR_APELLIDOS}` 
                        : 'SIN ASIGNAR'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-blue-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Interno: {curso.CURSO_ID}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex gap-2 justify-end border-t border-slate-100">
               <button 
                 onClick={() => openEditModal(curso)}
                 className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase text-[#0F172A] hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
               >
                  <Edit3 size={14} /> Gestionar
               </button>
               <button 
                 onClick={() => handleDelete(curso.CURSO_ID as number)}
                 className="p-2 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-500"
               >
                  <Trash2 size={16} />
               </button>
            </div>
          </div>
        )) : conexionBackend && authorized && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-40">
            <BookOpen size={80} className="text-[#0F172A] mb-6 drop-shadow-md" />
            <p className="font-black uppercase tracking-widest text-[#0F172A] text-xl">Sin Registros</p>
            <p className="text-[11px] font-bold text-[#0F172A] mt-2 uppercase tracking-widest">Crea un curso para visualizarlo aquí.</p>
          </div>
        )}
      </div>

      {/* FOOTER DE PRIVILEGIOS */}
      <div className="bg-[#0F172A] p-10 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white/5 rounded-3xl"><ShieldCheck className="text-[#FF8FAB]" size={32} /></div>
            <div className="space-y-1">
               <p className="text-xs font-black uppercase tracking-widest text-[#FF8FAB]">Seguridad de Infraestructura</p>
               <p className="text-[10px] text-slate-400 uppercase leading-relaxed max-w-sm">
                  Esta vista altera la estructura jerárquica de <span className="text-white font-bold">MS_ACADEMICO</span>. Solo personal técnico autorizado Lemac.
               </p>
            </div>
         </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREAR CURSO (POST) */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-md bg-[#0F172A]/80 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 relative border-4 border-pink-100">
            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic mb-8">Nuevo Curso Académico</h2>
            
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">ID Periodo (Debe existir)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ej: 1"
                    value={formData.PERIODO_ID} 
                    onChange={(e) => setFormData({...formData, PERIODO_ID: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">ID Nivel (1 al 14)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ej: 5 (1° Básico)"
                    value={formData.NIVEL_ID} 
                    onChange={(e) => setFormData({...formData, NIVEL_ID: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Letra Identificadora</label>
                  <input 
                    type="text" 
                    required
                    maxLength={1}
                    placeholder="A, B, C..."
                    value={formData.LETRA} 
                    onChange={(e) => setFormData({...formData, LETRA: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all uppercase" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">ID Profesor Jefe (Opcional)</label>
                  <input 
                    type="number" 
                    placeholder="Ej: 2"
                    value={formData.PROFESOR_JEFE_ID} 
                    onChange={(e) => setFormData({...formData, PROFESOR_JEFE_ID: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-[#FF8FAB] transition-all" 
                  />
                </div>
              </div>

              <div className="col-span-full flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-[#0F172A] text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-pink-500 transition-all shadow-lg shadow-[#0F172A]/20 italic">Registrar</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDITAR CURSO (PUT) */}
      {/* ======================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 backdrop-blur-md bg-[#0F172A]/80 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 relative border-4 border-blue-100">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter italic">Editar Curso</h2>
               <div className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {editData.CURSO_ID}</div>
            </div>
            
            <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Cambiar Nivel ID</label>
                  <input 
                    type="number" 
                    required
                    value={editData.NIVEL_ID} 
                    onChange={(e) => setEditData({...editData, NIVEL_ID: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-blue-200 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Cambiar Letra</label>
                  <input 
                    type="text" 
                    required
                    maxLength={1}
                    value={editData.LETRA} 
                    onChange={(e) => setEditData({...editData, LETRA: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-blue-200 transition-all uppercase" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Actualizar Prof. Jefe ID</label>
                  <input 
                    type="number" 
                    value={editData.PROFESOR_JEFE_ID} 
                    onChange={(e) => setEditData({...editData, PROFESOR_JEFE_ID: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-[#0F172A] outline-none ring-2 ring-transparent focus:ring-blue-200 transition-all" 
                  />
                </div>
              </div>

              <div className="col-span-full flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 italic">Actualizar Curso</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-8 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}