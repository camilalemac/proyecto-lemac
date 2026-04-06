"use client"
import { useState, useEffect } from "react"
import { LayoutGrid, UserPlus, Settings, Search, MoreVertical, GraduationCap, Users, MapPin } from "lucide-react"
import Cookies from "js-cookie"

export default function AdminDashboard() {
  const [cursos, setCursos] = useState<any[]>([])
  const [stats, setStats] = useState({ totalAlumnos: 0, totalCursos: 0, profesoresSinCurso: 0 })
  const [loading, setLoading] = useState(true)

  // 1. Función para cargar datos (la envolvemos para poder reutilizarla)
  const fetchAdminData = async () => {
    try {
      const token = Cookies.get("auth-token")
      const res = await fetch("http://127.0.0.1:3007/api/v1/academico/cursos", {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await res.json()
      if (result.success) {
        setCursos(result.data)
        setStats({
          totalAlumnos: result.data.reduce((acc: number, c: any) => acc + (c._count?.ALUMNOS || 0), 0),
          totalCursos: result.data.length,
          profesoresSinCurso: 5 
        })
      }
    } catch (err) {
      console.error("Error en Admin:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // 2. Función para crear el curso (manejador del botón)
  const handleCrearCurso = async () => {
    try {
      const token = Cookies.get("auth-token")
      const res = await fetch("http://127.0.0.1:3007/api/v1/academico/cursos", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PERIODO_ID: 1, 
          NIVEL_ID: 1,   
          LETRA: "B",
          PROFESOR_JEFE_ID: null
        })
      })

      const result = await res.json()
      if (result.success) {
        alert("¡Curso creado con éxito!")
        fetchAdminData() // Refrescamos la lista automáticamente
      } else {
        alert("Error: " + (result.message || "No se pudo crear el curso"))
      }
    } catch (err) {
      console.error("Error al crear:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8FAB]"></div>
        <p className="text-gray-400 font-medium animate-pulse">Cargando administración...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-6 pt-6 bg-[#fcfcfd]">
      
      {/* Banner Superior */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="bg-[#1A1A2E] p-4 rounded-3xl text-white shadow-xl">
            <GraduationCap size={35} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight">Administración Central</h1>
            <p className="text-[#FF8FAB] font-bold text-xs uppercase tracking-widest mt-1">Gestión Centralizada Colegio Lemac</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 z-10">
           <div className="bg-orange-50 text-orange-400 px-4 py-2 rounded-full text-[10px] font-black border border-orange-100 italic">
              Sede Principal Lemac • 2026
           </div>
           {/* Botón corregido con handleCrearCurso */}
           <button 
            onClick={handleCrearCurso}
            className="bg-[#FF8FAB] hover:bg-[#ff7a9e] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-[#FF8FAB]/30 transition-all active:scale-95"
           >
            + Nuevo Curso
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "MATRÍCULA TOTAL", val: stats.totalAlumnos, icon: <Users size={28}/>, color: "border-b-[#8B5CF6]", light: "text-purple-500" },
          { label: "CURSOS ACTIVOS", val: stats.totalCursos, icon: <LayoutGrid size={28}/>, color: "border-b-[#FF8FAB]", light: "text-[#FF8FAB]" },
          { label: "DOCENTES DISPONIBLES", val: stats.profesoresSinCurso, icon: <UserPlus size={28}/>, color: "border-b-[#10B981]", light: "text-emerald-500" }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 border-b-4 ${s.color} flex justify-between items-center transition-transform hover:-translate-y-1`}>
            <div>
              <p className="text-[11px] font-black text-gray-400 tracking-[0.15em] mb-2">{s.label}</p>
              <p className="text-5xl font-black text-[#1A1A2E]">{s.val}</p>
            </div>
            <div className={`${s.light} opacity-20`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 px-2">
        <Users className="text-[#FF8FAB]" size={24} />
        <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Estructura Académica</h2>
      </div>

      {/* Tabla */}
      <section className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-10 py-7">Curso e Información</th>
                <th className="px-10 py-7">Profesor Jefe</th>
                <th className="px-10 py-7 text-center">Estado Alumnos</th>
                <th className="px-10 py-7 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cursos.length > 0 ? cursos.map((c) => (
                <tr key={c.CURSO_ID} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-[#1A1A2E] text-2xl tracking-tighter">
                        {c.NIVEL_NOMBRE_CORTO || c.NIVEL?.NOMBRE_CORTO} {c.LETRA}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Periodo Lectivo 2026</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-[#1A1A2E] flex items-center justify-center text-white text-xs font-black">
                        {c.PROFESOR_NOMBRES?.charAt(0) || 'P'}
                      </div>
                      <span className="text-sm font-bold text-gray-600">
                        {c.PROFESOR_NOMBRES ? `${c.PROFESOR_NOMBRES} ${c.PROFESOR_APELLIDOS}` : "Pendiente Asignación"}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                       <span className="text-xs font-black text-gray-700 mb-2">{c._count?.ALUMNOS || 0} / 45</span>
                       <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] w-2/3"></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="text-gray-300 hover:text-[#FF8FAB] p-2 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center border-none">
                    <div className="flex flex-col items-center opacity-20">
                      <LayoutGrid size={60} className="mb-4" />
                      <p className="font-black text-xl">Sin registros actuales</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}