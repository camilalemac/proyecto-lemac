"use client"
import { useState, useEffect } from "react"
import { Users, Search, BellRing, CheckCircle2, AlertCircle, Loader2, Receipt } from "lucide-react"
import Cookies from "js-cookie"

export default function TesoreroCobranzaPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [cobros, setCobros] = useState<any[]>([])
  const [filtro, setFiltro] = useState("TODOS") // TODOS, PENDIENTE, PAGADO
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    const fetchCobranza = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return setLoading(false)
        const headers = { 'Authorization': `Bearer ${token}` }

        const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
        const dataMe = await resMe.json()
        
        if (dataMe.success) {
          setUser(dataMe.data)
          const resCobros = await fetch(`http://127.0.0.1:3007/api/v1/pagos/cobros/colegio/${dataMe.data.colegioId}`, { headers })
          const dataCobros = await resCobros.json()

          if (dataCobros.success) {
            // Filtramos solo los cobros del curso que administra este tesorero
            const cobrosCurso = dataCobros.data.filter((c: any) => Number(c.CURSO_ID) === Number(dataMe.data.cursoId))
            setCobros(cobrosCurso)
          }
        }
      } catch (error) { console.error(error) } 
      finally { setLoading(false) }
    }
    fetchCobranza()
  }, [])

  const handleNotificarMorosos = async () => {
    if (!user || !user.colegioId) {
        alert("Error de conexión: No se pudo identificar tu perfil. Revisa si el servidor Backend está encendido.")
        return
    }

    if (!confirm("¿Estás seguro de enviar un recordatorio de pago a todos los apoderados con estado PENDIENTE?")) return
    
    try {
      const token = Cookies.get("auth-token")
      await fetch(`http://127.0.0.1:3007/api/v1/comunicaciones/enviar-cobros`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId: user.cursoId, colegioId: user.colegioId })
      })
      alert("Correos de cobranza enviados exitosamente a los apoderados morosos.")
    } catch (error) {
      console.error(error)
      alert("Hubo un error al intentar enviar las notificaciones.")
    }
  }

  const cobrosFiltrados = cobros.filter(c => {
    const coincideEstado = filtro === "TODOS" || c.ESTADO === filtro
    const coincideBusqueda = c.DESCRIPCION.toLowerCase().includes(busqueda.toLowerCase())
    return coincideEstado && coincideBusqueda
  })

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Cargando Estado de Cobranza...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-8 z-10">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-[#FF8FAB] shadow-2xl rotate-3">
            <Users size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight leading-none uppercase">
              Gestión de Cobranza
            </h1>
            <p className="text-[12px] text-[#FF8FAB] font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <Receipt size={16} /> Estado de Pagos del Curso
            </p>
          </div>
        </div>
        <button 
          onClick={handleNotificarMorosos}
          className="mt-6 md:mt-0 flex items-center gap-2 bg-[#FAF5FF] text-[#1A1A2E] border border-[#FF8FAB]/20 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-[#FF8FAB] transition-all shadow-sm"
        >
          <BellRing size={16} /> Notificar Morosos
        </button>
      </header>

      <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por concepto o descripción..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
            />
          </div>
          <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            {["TODOS", "PENDIENTE", "PAGADO"].map(f => (
              <button 
                key={f} 
                onClick={() => setFiltro(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtro === f ? 'bg-[#1A1A2E] text-[#FF8FAB] shadow-md' : 'text-slate-400 hover:text-[#1A1A2E]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF5FF] text-[#1A1A2E]">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">ID Cobro</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Descripción</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Vencimiento</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Monto Total</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-bold text-[#1A1A2E]">
              {cobrosFiltrados.length > 0 ? cobrosFiltrados.map((cobro: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 text-slate-400">#{cobro.COBRO_ID}</td>
                  <td className="p-5">{cobro.DESCRIPCION}</td>
                  <td className="p-5 text-slate-500">{new Date(cobro.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}</td>
                  <td className="p-5">${Number(cobro.MONTO_ORIGINAL).toLocaleString('es-CL')}</td>
                  <td className="p-5 flex justify-center">
                    {cobro.ESTADO === 'PAGADO' ? (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                        <CheckCircle2 size={12} /> Pagado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-100">
                        <AlertCircle size={12} /> Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
                    No se encontraron registros de cobranza.
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