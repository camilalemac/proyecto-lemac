"use client"
import React, { useState, useEffect } from "react"
import { 
  ArrowRightLeft, Search, Loader2, ArrowUpCircle, 
  ArrowDownCircle, AlertCircle, Download, FileText, Filter, ArrowLeft, ShieldAlert
} from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"

// Interfaz para TypeScript basada en tu tabla de Oracle
interface Movimiento {
  movimiento_id: number;
  tipo_movimiento: 'INGRESO' | 'EGRESO';
  glosa: string;
  monto: number;
  fecha_movimiento: string;
}

export default function MovimientosColegioPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Estado para la validación del rol
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "INGRESO" | "EGRESO">("TODOS")
  const [stats, setStats] = useState({ ingresos: 0, egresos: 0 })

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          setErrorMsg("No hay sesión activa. Por favor, inicia sesión.");
          setIsAuthorized(false); // Faltaba asegurar el bloqueo aquí
          setLoading(false);
          return;
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        }
        
        let colId = 1
        
        // 1. Validar identidad, colegio y ROL
        try {
          const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
          if (resMe.ok) {
            const jsonMe = await resMe.json()
            colId = jsonMe.data?.perfil?.colegio_id || 1
            
            // Verificamos si tiene permisos de directiva de Centro de Padres
            const rolesDelUsuario = jsonMe.data?.roles || [];
            const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
              const code = rol.rol_code;
              return code === 'CEN_PRES_CAP' || code === 'CEN_TES_CAP' || code === 'CEN_SEC_CAP' ||
                     code === 'DIR_PRES_APO' || code === 'DIR_TES_APO' || code === 'DIR_SEC_APO';
            });

            // Si NO es centro de padres, bloqueamos el acceso y cortamos la ejecución
            if (!esCentroDePadres) {
              setIsAuthorized(false);
              setLoading(false);
              return; 
            }
            
            // Si pasa la validación, autorizamos
            setIsAuthorized(true);
          }
        } catch (e) { 
          setErrorMsg("Error validando tus credenciales en el servidor.")
          setIsAuthorized(false); // Seguridad extra en caso de error
          setLoading(false);
          return;
        }
        
        // 2. Traer movimientos desde MS_PAGOS (Puerto 3002)
        const res = await fetch(`http://127.0.0.1:3002/api/v1/pagos/movimientos/colegio/${colId}`, { headers })
        
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
           const json = await res.json()
           if (json.success || json.status === "success") {
              const dataList = json.data.map((m: any) => ({
                movimiento_id: m.MOVIMIENTO_ID || m.movimiento_id,
                tipo_movimiento: m.TIPO_MOVIMIENTO || m.tipo_movimiento,
                glosa: m.GLOSA || m.glosa,
                monto: m.MONTO || m.monto,
                fecha_movimiento: m.FECHA_MOVIMIENTO || m.fecha_movimiento || null
              }));
              
              setMovimientos(dataList)
              
              const ing = dataList.filter((m: Movimiento) => m.tipo_movimiento === 'INGRESO').reduce((acc: number, m: Movimiento) => acc + Number(m.monto), 0)
              const egr = dataList.filter((m: Movimiento) => m.tipo_movimiento === 'EGRESO').reduce((acc: number, m: Movimiento) => acc + Number(m.monto), 0)
              setStats({ ingresos: ing, egresos: egr })
           } else {
             setErrorMsg("El servidor rechazó la solicitud de movimientos.")
           }
        } else {
           console.warn("La ruta /movimientos/colegio no devolvió JSON. Verifica MS_PAGOS.")
        }
      } catch (e: any) { 
        console.error(e)
        setErrorMsg("Error de conexión con el servidor de pagos (MS_PAGOS).")
      } finally { 
        setLoading(false) 
      }
    }
    fetchMovimientos()
  }, [])

  const movimientosFiltrados = movimientos.filter((m) => {
    const coincideTipo = filtroTipo === "TODOS" || m.tipo_movimiento === filtroTipo
    const glosaBuscada = m.glosa?.toLowerCase() || ""
    const coincideBusqueda = glosaBuscada.includes(busqueda.toLowerCase()) || 
                             m.movimiento_id?.toString().includes(busqueda)
    return coincideTipo && coincideBusqueda
  })

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A2E]/50">Auditando Libro Mayor...</p>
    </div>
  )

  // Pantalla de Acceso Denegado (Si isAuthorized es false)
  if (isAuthorized === false) return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-500/5 text-center animate-in zoom-in-95 duration-500">
      <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-rose-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-2">Acceso Restringido</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
        No tienes los permisos necesarios para ver el Libro Mayor. Esta vista es exclusiva para miembros de la directiva (Tesorero/Presidente).
      </p>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1A2E] bg-slate-50 hover:bg-rose-50 px-6 py-3 rounded-2xl transition-colors border border-slate-100 hover:border-rose-200">
        <ArrowLeft size={16} /> Volver al Inicio
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center">
        <Link href="/dashboard/cpad/centro-padres" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:border-[#FF8FAB]/50">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Panel
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold shadow-sm">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <header className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="p-4 bg-[#1A1A2E] rounded-[1.25rem] text-[#FF8FAB] shadow-lg shadow-slate-900/10">
             <ArrowRightLeft size={32} strokeWidth={1.5} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Libro Mayor</h1>
             <p className="text-slate-400 text-sm font-bold mt-1">Registro de todos los movimientos de caja</p>
           </div>
        </div>
        <button className="w-full md:w-auto bg-[#FAF5FF] border border-[#FF8FAB]/30 text-[#1A1A2E] px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-all shadow-sm flex justify-center items-center gap-3">
          <Download size={16} /> Exportar Excel
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-colors">
          <div className="bg-emerald-50 text-emerald-500 p-4 rounded-xl border border-emerald-100"><ArrowUpCircle size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Total Ingresos</p>
            <p className="text-2xl font-black text-[#1A1A2E] tracking-tight">${stats.ingresos.toLocaleString('es-CL')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-rose-200 transition-colors">
          <div className="bg-rose-50 text-rose-500 p-4 rounded-xl border border-rose-100"><ArrowDownCircle size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Total Egresos</p>
            <p className="text-2xl font-black text-[#1A1A2E] tracking-tight">${stats.egresos.toLocaleString('es-CL')}</p>
          </div>
        </div>
        <div className="bg-linear-to-br from-[#1A1A2E] to-[#2A2A4E] p-6 rounded-4xl shadow-xl flex items-center gap-5 text-white border-b-4 border-[#FF8FAB]">
          <div className="bg-white/10 text-[#FF8FAB] p-4 rounded-xl"><FileText size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Flujo de Caja (Neto)</p>
            <p className="text-2xl font-black text-[#FF8FAB] tracking-tight">${(stats.ingresos - stats.egresos).toLocaleString('es-CL')}</p>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción o ID..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/50 transition-all"
            />
          </div>
          
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full lg:w-auto overflow-x-auto">
            {(['TODOS', 'INGRESO', 'EGRESO'] as const).map((f) => (
              <button 
                key={f}
                onClick={() => setFiltroTipo(f)}
                className={`px-8 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                  filtroTipo === f 
                  ? 'bg-[#1A1A2E] text-white shadow-md' 
                  : 'text-slate-400 hover:text-[#1A1A2E] hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full text-left min-w-200 border-collapse">
            <thead className="bg-[#FAF5FF] text-[#1A1A2E] border-b border-slate-200">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest w-24">ID</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest w-32">Fecha</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Glosa / Detalle</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right w-40">Monto</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-36">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientosFiltrados.length > 0 ? movimientosFiltrados.map((m) => (
                <tr key={m.movimiento_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 text-xs font-black text-slate-400 group-hover:text-[#FF8FAB]">
                    #M-{m.movimiento_id.toString().padStart(3, '0')}
                  </td>
                  <td className="p-5 text-xs font-bold text-slate-500">
                    {m.fecha_movimiento ? new Date(m.fecha_movimiento).toLocaleDateString('es-CL') : '—'}
                  </td>
                  <td className="p-5 text-sm font-bold text-[#1A1A2E]">
                    {m.glosa}
                  </td>
                  <td className="p-5 text-sm font-black text-[#1A1A2E] text-right tracking-tight">
                    ${Number(m.monto).toLocaleString('es-CL')}
                  </td>
                  <td className="p-5 flex justify-center">
                    <span className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      m.tipo_movimiento === 'INGRESO' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {m.tipo_movimiento === 'INGRESO' ? <ArrowUpCircle size={14} strokeWidth={2}/> : <ArrowDownCircle size={14} strokeWidth={2}/>}
                      {m.tipo_movimiento}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Filter size={32} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <p className="font-black text-xs text-[#1A1A2E] uppercase tracking-[0.2em] mb-1">Sin Resultados</p>
                    <p className="text-xs font-bold text-slate-400">Intenta con otro término de búsqueda.</p>
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