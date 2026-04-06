"use client"
import { useState, useEffect } from "react"
import { Users, PieChart, CheckCircle, TrendingUp, BadgeAlert, Send, Clock, BookOpen, ShieldCheck, Star, Wallet } from "lucide-react"
import Cookies from "js-cookie"

export default function ProfesorDashboard() {
  const [curso, setCurso] = useState<any>(null)
  const [gastos, setGastos] = useState<any[]>([])
  const [resumenPagos, setResumenPagos] = useState({ pagados: 0, pendientes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        // 1. Datos del Curso y Alumnos (Puerto 3007)
        const resCurso = await fetch("http://127.0.0.1:3007/api/v1/academico/cursos/mi-curso", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const dataCurso = await resCurso.json()
        if (dataCurso.success) setCurso(dataCurso.data)

        // 2. Resumen de Cuotas (Puerto 3002)
        const resPagos = await fetch("http://127.0.0.1:3002/api/v1/pagos/cuentas-cobrar/resumen-curso", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const dataPagos = await resPagos.json()
        if (dataPagos.success) setResumenPagos(dataPagos.data)

        // 3. Gastos por Categoría
        const resGastos = await fetch("http://127.0.0.1:3002/api/v1/pagos/gastos/resumen-curso", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const dataGastos = await resGastos.json()
        if (dataGastos.success) setGastos(dataGastos.data)

      } catch (err) {
        console.error("Error en sincronización de microservicios:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // FUNCIÓN: Asignar Roles (Presidente/Tesorero)
  const asignarRol = async (alumnoId: number, rol: 'PRESIDENTE' | 'TESORERO') => {
    const token = Cookies.get("auth-token")
    try {
      const res = await fetch(`http://127.0.0.1:3007/api/v1/academico/cursos/asignar-rol`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alumnoId, rol, cursoId: curso.CURSO_ID })
      })
      if (res.ok) {
        alert(`Rol de ${rol} asignado correctamente en Oracle.`)
        // Opcional: Recargar datos para ver el cambio visual inmediato
        window.location.reload()
      }
    } catch (error) {
      console.error("Error al asignar rol:", error)
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.4em]">Conectando a ms-academico...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[#0F172A] p-10 rounded-[3rem] text-white shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#FF8FAB]" size={24} />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Panel de Jefatura Docente</h1>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            Sede: {curso?.NIVEL?.NOMBRE_CORTO} {curso?.LETRA}
          </p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[9px] font-black text-[#FF8FAB] uppercase">Estado Académico</p>
                <p className="text-xl font-black italic">Sincronizado</p>
            </div>
        </div>
      </header>

      {/* WIDGETS FINANCIEROS DEL CURSO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recaudación Total</p>
          <p className="text-3xl font-black text-[#0F172A]">${resumenPagos.pagados.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Morosidad del Curso</p>
          <p className="text-3xl font-black text-[#FF8FAB]">${resumenPagos.pendientes.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-[#FDF2F5] p-8 rounded-[3rem] border border-[#FF8FAB]/20">
          <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-widest mb-2">Cumplimiento</p>
          <p className="text-3xl font-black text-[#0F172A]">
            {((resumenPagos.pagados / (resumenPagos.pagados + resumenPagos.pendientes || 1)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* GESTIÓN DE ALUMNOS Y ROLES */}
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-[#0F172A] mb-8 flex items-center gap-3 uppercase tracking-tight">
            <Users className="text-[#FF8FAB]" size={24} /> Nómina y Directiva
          </h2>
          <div className="space-y-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {curso?.ALUMNOS?.map((alu: any) => (
              <div key={alu.ALUMNO_ID} className="flex items-center justify-between p-6 bg-slate-50 rounded-4xl hover:bg-white hover:shadow-md transition-all duration-300 group border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-[10px]">
                    {alu.NOMBRE[0]}{alu.APELLIDO_PATERNO[0]}
                  </div>
                  <div>
                    <p className="font-black text-[#0F172A] uppercase text-[11px] tracking-tight">{alu.NOMBRE} {alu.APELLIDO_PATERNO}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{alu.CORREO_INSTITUCIONAL}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {/* BOTÓN PRESIDENTE DINÁMICO */}
                  <button 
                    onClick={() => asignarRol(alu.ALUMNO_ID, 'PRESIDENTE')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      alu.ROL === 'PRESIDENTE' 
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-500' 
                        : 'bg-white border-slate-100 text-slate-400 hover:text-yellow-500'
                    }`}
                    title="Nombrar Presidente"
                  >
                    <Star size={16} fill={alu.ROL === 'PRESIDENTE' ? 'currentColor' : 'none'} />
                  </button>

                  {/* BOTÓN TESORERO DINÁMICO */}
                  <button 
                    onClick={() => asignarRol(alu.ALUMNO_ID, 'TESORERO')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      alu.ROL === 'TESORERO' 
                        ? 'bg-blue-50 border-blue-200 text-blue-500' 
                        : 'bg-white border-slate-100 text-slate-400 hover:text-blue-500'
                    }`}
                    title="Nombrar Tesorero"
                  >
                    <Wallet size={16} fill={alu.ROL === 'TESORERO' ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ANALÍTICA FINANCIERA */}
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-[#0F172A] mb-8 flex items-center gap-3 uppercase tracking-tight">
            <PieChart className="text-[#FF8FAB]" size={24} /> Análisis de Gastos
          </h2>
          <div className="space-y-8">
            {gastos.map((g: any) => (
              <div key={g.categoria} className="group">
                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                  <span className="text-slate-400">{g.categoria}</span>
                  <span className="text-[#0F172A]">${g.monto.toLocaleString('es-CL')}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0F172A] h-full rounded-full transition-all duration-1000 group-hover:bg-[#FF8FAB]" 
                    style={{ width: `${g.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="mt-12 p-8 bg-[#FDF2F5] rounded-[2.5rem] border border-[#FF8FAB]/10">
                <h4 className="text-[10px] font-black text-[#FF8FAB] uppercase mb-4 tracking-widest">Acciones de Auditoría</h4>
                <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 bg-white rounded-2xl text-[9px] font-black text-[#0F172A] uppercase hover:bg-[#0F172A] hover:text-white transition-all shadow-sm">
                        Exportar PDF
                    </button>
                    <button className="py-4 bg-white rounded-2xl text-[9px] font-black text-[#0F172A] uppercase hover:bg-[#0F172A] hover:text-white transition-all shadow-sm">
                        Solicitar Auditoría
                    </button>
                </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}