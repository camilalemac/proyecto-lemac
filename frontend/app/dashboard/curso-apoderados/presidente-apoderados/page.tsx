"use client"
import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, PieChart, TrendingDown, 
  Loader2, ServerOff, Filter, BarChart2, ShieldAlert
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { pagosService } from "../../../../services/pagosService"

export default function PresidenteCpadGastosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [conexionBackend, setConexionBackend] = useState(true)
  
  // Estados para los datos 100% reales
  const [totalEgresos, setTotalEgresos] = useState(0)
  const [gastosPorCategoria, setGastosPorCategoria] = useState<{nombre: string, monto: number, porcentaje: number}[]>([])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 1. Validar Identidad y Permisos
      const perfil = await authService.getMe()
      const rolesPermitidos = ['DIR_PRES_APO', 'CEN_PRES_CAP']
      const esPresidente = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

      if (!esPresidente) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      const colId = perfil.COLEGIO_ID || 1
      const cursoId = (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1

      // 2. Consumir movimientos de caja desde MS_PAGOS
      const movsData = await pagosService.getMovimientosPorColegio(colId)
      
      // 3. Filtrar SOLO egresos y SOLO de este curso
      const egresosCurso = movsData.filter((m: any) => {
        const esEgreso = (m.TIPO_MOVIMIENTO || m.tipo_movimiento) === "EGRESO"
        const esDeCurso = Number(m.CURSO_ID || m.curso_id) === Number(cursoId)
        return esEgreso && esDeCurso
      })

      let sumaTotal = 0
      const agrupacion: Record<string, number> = {}

      // Agrupamos los montos por ID o Nombre de Categoría
      egresosCurso.forEach((gasto: any) => {
        const monto = Number(gasto.MONTO || gasto.monto || 0)
        // Intentamos sacar el nombre de la categoría, si no, mostramos el ID
        const categoria = gasto.categoria?.NOMBRE || gasto.categoria?.nombre || gasto.CATEGORIA_NOMBRE || gasto.categoria_nombre || `Categoría ID: ${gasto.CATEGORIA_ID || gasto.categoria_id || "Desconocida"}`
        
        sumaTotal += monto
        if (agrupacion[categoria]) {
          agrupacion[categoria] += monto
        } else {
          agrupacion[categoria] = monto
        }
      })

      setTotalEgresos(sumaTotal)

      // Convertimos el objeto en array y sacamos el porcentaje real
      const arrayCategorias = Object.keys(agrupacion).map(cat => ({
        nombre: cat,
        monto: agrupacion[cat],
        porcentaje: sumaTotal > 0 ? Math.round((agrupacion[cat] / sumaTotal) * 100) : 0
      })).sort((a, b) => b.monto - a.monto) // Orden de mayor a menor gasto

      setGastosPorCategoria(arrayCategorias)
      setConexionBackend(true)

    } catch (e: any) {
      console.error("Error al cargar gastos del presidente:", e)
      setConexionBackend(false)
      setTotalEgresos(0)
      setGastosPorCategoria([])
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#0F172A]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculando Distribución desde Oracle...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#FDF2F5]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">Este panel de auditoría de gastos es exclusivo para el Presidente del Curso.</p>
        <button onClick={() => router.push('/dashboard/apoderado/curso-apoderado')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10 bg-[#FDF2F5] min-h-screen p-4 lg:p-8">
      
      {/* ALERTA DESCONEXIÓN */}
      {!conexionBackend && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
          <ServerOff size={16} /> Interfaz sin conexión a MS_PAGOS. No se pueden cargar los datos.
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => router.push("/dashboard/apoderado/curso-apoderado")}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 max-w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver al Panel
        </button>

        {/* HEADER DE LA VISTA */}
        <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <PieChart size={250} className="absolute -right-10 -bottom-10 text-pink-50 opacity-50" />
          
          <div className="flex items-center gap-6 relative z-10 text-center md:text-left">
            <div className="bg-[#0F172A] p-6 rounded-4xl text-[#FF8FAB] shadow-2xl hidden md:block">
              <TrendingDown size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none italic">Análisis de Gastos</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Auditoría Analítica del Centro de Padres</p>
            </div>
          </div>

          <div className="relative z-10 bg-slate-50 px-10 py-6 rounded-[2.5rem] border border-slate-100 shadow-inner w-full lg:w-auto">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Total Histórico Egresos</p>
            <p className="text-4xl font-black text-rose-500 tracking-tighter text-center">${totalEgresos.toLocaleString('es-CL')}</p>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="bg-white p-8 lg:p-12 rounded-[4rem] shadow-sm border border-slate-100 relative z-10 min-h-100 flex flex-col">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-50 gap-4">
            <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-3">
              <BarChart2 className="text-[#FF8FAB]" /> Distribución por Categoría
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Filter size={14} /> Filtro Activo: Todos los Egresos
            </div>
          </div>

          {gastosPorCategoria.length > 0 ? (
            <div className="space-y-8 flex-1">
              {gastosPorCategoria.map((categoria, index) => {
                // Paleta de colores para las barras orientadas al estilo Navy/Pink
                const colores = ["bg-[#0F172A]", "bg-[#FF8FAB]", "bg-slate-400", "bg-rose-400"]
                const colorBarra = colores[index % colores.length]

                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#FF8FAB] transition-colors">{categoria.nombre}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{categoria.porcentaje}% del Total Gastado</p>
                      </div>
                      <p className="text-xl font-black text-[#0F172A] tracking-tight">
                        ${categoria.monto.toLocaleString('es-CL')}
                      </p>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${colorBarra}`} 
                        style={{ width: `${Math.min(categoria.porcentaje, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40 text-center">
              <PieChart size={80} className="mb-6 text-[#0F172A] opacity-50" />
              <p className="text-lg font-black uppercase tracking-widest text-[#0F172A]">No hay egresos registrados</p>
              <p className="text-xs font-medium text-slate-500 mt-3 max-w-md italic">La base de datos actual de Oracle no posee movimientos de caja categorizados como "EGRESO" para su curso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}