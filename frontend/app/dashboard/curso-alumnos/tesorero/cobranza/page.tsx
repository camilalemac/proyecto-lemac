"use client"
import { useState, useEffect } from "react"
import { Users, Search, BellRing, CheckCircle2, AlertCircle, Loader2, Receipt, ArrowLeft, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function TesoreroCobranzaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [user, setUser] = useState<any>(null)
  const [cobros, setCobros] = useState<any[]>([])
  const [filtro, setFiltro] = useState("TODOS") // TODOS, PENDIENTE, PAGADO
  const [busqueda, setBusqueda] = useState("")
  const [notificandoMasivo, setNotificandoMasivo] = useState(false)

  const loadCobranza = async () => {
    try {
      setLoading(true)
      
      // 1. Validar Identidad y Rol de Tesorero de Curso
      const perfil = await authService.getMe()
      const rolesPermitidos = ['DIR_TES_ALU', 'CEN_TES_CAL']
      const esTesorero = perfil.roles?.some((r: any) => rolesPermitidos.includes(r.rol_code))

      if (!esTesorero) {
        setIsAuthorized(false)
        return
      }

      setIsAuthorized(true)
      
      const colegioId = perfil.COLEGIO_ID || 1
      const cursoId = (perfil as any).CONTEXTO_ID || (perfil as any).contexto_id || 1
      setUser({ colegioId, cursoId })

      // 2. Traer la cartera de cobros desde Oracle (MS_PAGOS)
      const dataCobros = await pagosService.getCuentasPorCobrar(colegioId)
      
      // 3. Filtrar estrictamente por el curso del tesorero
      const cobrosCurso = dataCobros.filter((c: any) => Number(c.CURSO_ID || c.curso_id) === Number(cursoId))
      setCobros(cobrosCurso)

    } catch (error) {
      console.error("Error al cargar módulo de cobranza:", error)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    loadCobranza()
  }, [])

  const handleNotificarMorosos = async () => {
    if (!user || !user.colegioId) {
      alert("Error de sesión: No se pudo identificar el curso.")
      return
    }

    if (!confirm("¿Confirmas el envío masivo de correos de cobranza a los alumnos/apoderados en estado PENDIENTE de tu curso?")) return
    
    setNotificandoMasivo(true)
    try {
      // Usamos el fetchClient encapsulado en notificacionService si lo tuvieras,
      // o usamos fetch nativo adaptado a tu backend de notificaciones masivas.
      const Cookies = require('js-cookie');
      const token = Cookies.get("auth-token");
      
      const res = await fetch(`http://127.0.0.1:3007/api/v1/comunicaciones/enviar-cobros`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: user.cursoId, colegioId: user.colegioId })
      })

      if (res.ok) {
        alert("Notificaciones masivas enviadas exitosamente.")
      } else {
        throw new Error("El servidor rechazó el envío de correos.")
      }
    } catch (error) {
      console.error(error)
      alert("Falla de red al intentar notificar al curso.")
    } finally {
      setNotificandoMasivo(false)
    }
  }

  // Filtrado Seguro
  const cobrosFiltrados = cobros.filter(c => {
    const estado = (c.ESTADO || c.estado || "").toUpperCase()
    const coincideEstado = filtro === "TODOS" || estado === filtro
    
    const descripcion = (c.DESCRIPCION || c.descripcion || "").toLowerCase()
    const nombre = (c.NOMBRE_COMPLETO || c.nombre_completo || "").toLowerCase()
    const coincideBusqueda = descripcion.includes(busqueda.toLowerCase()) || nombre.includes(busqueda.toLowerCase())
    
    return coincideEstado && coincideBusqueda
  })

  if (authLoading || loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-sky-500" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autenticando Ledger de Cobranza...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#F8FAFC]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">Este panel de cobranza es exclusivo para el Tesorero de Curso.</p>
        <button onClick={() => router.push('/dashboard/alumno/curso-alumno')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link href="/dashboard/alumno/curso-alumno/tesorero" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard de Finanzas
        </Link>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-sky-400 shadow-xl rotate-3">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">
              Gestión de Cobranza
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincronizado con MS_PAGOS
            </p>
          </div>
        </div>
        <button 
          onClick={handleNotificarMorosos}
          disabled={notificandoMasivo || cobrosFiltrados.length === 0}
          className="mt-6 md:mt-0 flex items-center gap-3 bg-[#1A1A2E] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl z-10 disabled:opacity-50"
        >
          {notificandoMasivo ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />} 
          {notificandoMasivo ? 'Notificando...' : 'Aviso Masivo de Cobro'}
        </button>
      </header>

      <section className="bg-white p-8 lg:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
        
        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-50 pb-8">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar apoderado o concepto..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-3xl py-4 pl-14 pr-6 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-100 shadow-inner overflow-x-auto no-scrollbar">
            {["TODOS", "PENDIENTE", "PAGADO"].map(f => (
              <button 
                key={f} 
                onClick={() => setFiltro(f)}
                className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filtro === f 
                  ? 'bg-[#1A1A2E] text-white shadow-md' 
                  : 'text-slate-400 hover:text-[#1A1A2E] hover:bg-slate-200/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* TABLA DE COBRANZAS */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsable Financiero</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Original</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado (Oracle)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold text-[#1A1A2E]">
              {cobrosFiltrados.length > 0 ? cobrosFiltrados.map((cobro: any, i: number) => {
                const idCobro = cobro.COBRO_ID || cobro.cobro_id || i
                const estado = (cobro.ESTADO || cobro.estado || "").toUpperCase()
                const fechaVencimiento = new Date(cobro.FECHA_VENCIMIENTO || cobro.fecha_vencimiento).toLocaleDateString('es-CL')
                const responsable = cobro.NOMBRE_COMPLETO || cobro.nombre_completo || "Apoderado del Alumno"
                const descripcion = cobro.DESCRIPCION || cobro.descripcion
                const original = Number(cobro.MONTO_ORIGINAL || cobro.monto_original || 0)

                return (
                  <tr key={idCobro} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-[#1A1A2E] truncate max-w-50">{responsable}</p>
                      <p className="text-[9px] font-bold text-sky-500 uppercase tracking-widest mt-1 italic">
                        ID Factura: #{idCobro}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600">{descripcion}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Vence: {fechaVencimiento}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black text-[#1A1A2E] tracking-tight">
                        ${original.toLocaleString('es-CL')}
                      </p>
                    </td>
                    <td className="px-8 py-6 flex justify-center">
                      {estado === 'PAGADO' ? (
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                          <CheckCircle2 size={12} /> Pagado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border border-rose-100">
                          <AlertCircle size={12} /> Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Receipt size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                      No hay registros que coincidan con la búsqueda.
                    </p>
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