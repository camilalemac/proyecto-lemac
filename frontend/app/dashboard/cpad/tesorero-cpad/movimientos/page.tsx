"use client"
import React, { useState, useEffect } from "react"
import { 
  ArrowRightLeft, Search, Wallet, Loader2, Calendar, 
  TrendingUp, TrendingDown, FileText, Download, AlertCircle, ShieldAlert, ArrowLeft, Landmark
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function MovimientosCajaPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [loadingCuentas, setLoadingCuentas] = useState(true)
  const [loadingMovimientos, setLoadingMovimientos] = useState(false)
  const [cuentas, setCuentas] = useState<any[]>([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | null>(null)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")

  // 1. VALIDACIÓN DE IDENTIDAD Y CARGA DE CUENTAS
  useEffect(() => {
    const initPage = async () => {
      try {
        setAuthLoading(true)
        const perfil = await authService.getMe()
        
        // Validar que sea Tesorero
        const rolesTesoreria = ['CEN_TES_CAP', 'DIR_TES_APO', 'CEN_TES_CAL', 'DIR_TES_ALU']
        const esTesorero = perfil.roles?.some((r: any) => rolesTesoreria.includes(r.rol_code))

        if (!esTesorero) {
          setIsAuthorized(false)
          return
        }

        setIsAuthorized(true)
        const colId = perfil.COLEGIO_ID || 1

        // Cargar las cuentas bancarias del colegio
        setLoadingCuentas(true)
        const dataCuentas = await pagosService.getCuentasPorColegio(colId)
        
        if (dataCuentas && dataCuentas.length > 0) {
          setCuentas(dataCuentas)
          // Seleccionar la primera cuenta por defecto (usando el mapeo seguro)
          setCuentaSeleccionada(dataCuentas[0].CUENTA_ID || dataCuentas[0].cuenta_id) 
        }

      } catch (e) {
        console.error("Error al inicializar la vista de movimientos:", e)
        setIsAuthorized(false)
      } finally {
        setAuthLoading(false)
        setLoadingCuentas(false)
      }
    }
    initPage()
  }, [])

  // 2. CARGAR MOVIMIENTOS CUANDO CAMBIA LA CUENTA
  useEffect(() => {
    if (!cuentaSeleccionada) return;

    const fetchMovimientos = async () => {
      setLoadingMovimientos(true)
      try {
        const dataMovs = await pagosService.getMovimientosByCuenta(cuentaSeleccionada)
        setMovimientos(dataMovs)
      } catch (e) {
        console.error("Error al cargar los movimientos:", e)
        setMovimientos([])
      } finally {
        setLoadingMovimientos(false)
      }
    }
    fetchMovimientos()
  }, [cuentaSeleccionada])

  // FILTRADO SEGURO
  const movimientosFiltrados = movimientos.filter(m => 
    (m.GLOSA || m.glosa || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.categoria?.NOMBRE || m.categoria?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  )

  const cuentaActiva = cuentas.find(c => (c.CUENTA_ID || c.cuenta_id) === cuentaSeleccionada)

  if (authLoading || loadingCuentas) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autenticando y Cargando Cuentas...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="flex h-[80vh] items-center justify-center p-6 text-center bg-[#FDF2F5]">
      <div className="max-w-xl p-12 bg-white rounded-[3rem] border border-red-100 shadow-xl">
        <ShieldAlert size={60} className="text-red-500 mx-auto mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-10">Solo personal de Tesorería puede auditar los movimientos de caja.</p>
        <button onClick={() => router.push('/dashboard/cpad/tesorero-cpad')} className="bg-[#1A1A2E] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:bg-slate-800 transition-all">
          <ArrowLeft size={16} /> Volver al Panel
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Botón Volver */}
      <div className="flex items-center">
        <Link href="/dashboard/cpad/tesorero-cpad" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard Tesorería
        </Link>
      </div>

      {/* HEADER Y SELECTOR DE CUENTA */}
      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="bg-[#1A1A2E] p-5 rounded-2xl text-purple-400 shadow-xl shadow-slate-900/10">
            <ArrowRightLeft size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Libro de Caja</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Historial de Ingresos y Egresos
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-72 group">
            <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <select 
              className="w-full appearance-none pl-14 pr-10 py-5 bg-slate-50 border-none rounded-3xl text-xs font-black text-[#1A1A2E] outline-none cursor-pointer focus:ring-4 focus:ring-purple-500/20 uppercase tracking-wider transition-all"
              value={cuentaSeleccionada || ""}
              onChange={(e) => setCuentaSeleccionada(Number(e.target.value))}
              disabled={cuentas.length === 0}
            >
              {cuentas.length > 0 ? (
                cuentas.map(c => (
                  <option key={c.CUENTA_ID || c.cuenta_id} value={c.CUENTA_ID || c.cuenta_id}>
                    {c.NOMBRE_CUENTA || c.nombre_cuenta}
                  </option>
                ))
              ) : (
                <option value="">Sin cuentas vinculadas</option>
              )}
            </select>
          </div>

          <button className="p-5 bg-[#1A1A2E] text-white rounded-3xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-xl flex items-center justify-center group">
            <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* RESUMEN DE LA CUENTA SELECCIONADA */}
      {cuentaActiva && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
          <div className="bg-[#1A1A2E] p-8 rounded-[3.5rem] shadow-xl text-white flex flex-col justify-center border-b-8 border-purple-500 relative overflow-hidden">
            <p className="text-[10px] font-black uppercase text-purple-300 tracking-[0.2em] mb-2 z-10">Saldo Actual Sincronizado</p>
            <h3 className="text-4xl font-black text-white tracking-tighter z-10">
              ${Number(cuentaActiva.SALDO_ACTUAL || cuentaActiva.saldo_actual || 0).toLocaleString('es-CL')}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 z-10 flex items-center gap-2">
              <Landmark size={12}/> {cuentaActiva.BANCO || cuentaActiva.banco || "Sin Entidad Asignada"}
            </p>
            <Wallet size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          </div>
          
          <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-center md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar movimientos por glosa, descripción o categoría..."
                className="w-full pl-14 pr-6 py-6 bg-slate-50 border-none rounded-3xl text-sm font-black focus:ring-4 focus:ring-purple-500/20 outline-none transition-all placeholder:font-medium text-[#1A1A2E]"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                disabled={!cuentaSeleccionada || movimientos.length === 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-100 flex flex-col">
        {!cuentaSeleccionada ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
            <AlertCircle size={80} className="mb-6 text-slate-400" strokeWidth={1} />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A2E]">Sin Cuentas Seleccionadas</h3>
            <p className="text-sm font-medium mt-2 max-w-sm text-slate-500 italic">Debe crear y seleccionar una cuenta bancaria para visualizar su libro contable.</p>
          </div>
        ) : loadingMovimientos ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-purple-500" size={48} strokeWidth={1.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando Transacciones en Oracle...</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-225">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Fecha</th>
                  <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Flujo</th>
                  <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Descripción Operación</th>
                  <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Monto Neto</th>
                  <th className="px-8 py-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movimientosFiltrados.length > 0 ? movimientosFiltrados.map((m, i) => {
                  const tipo = m.TIPO_MOVIMIENTO || m.tipo_movimiento
                  const esIngreso = tipo === 'INGRESO'
                  const urlComprobante = m.COMPROBANTE_URL || m.comprobante_url

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} className="text-slate-300 group-hover:text-purple-400 transition-colors"/>
                          <span className="text-xs font-bold text-[#1A1A2E]">
                            {new Date(m.FECHA_MOVIMIENTO || m.fecha_movimiento).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                          esIngreso ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {esIngreso ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                          {tipo}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-[#1A1A2E]">{m.GLOSA || m.glosa}</p>
                        <p className="text-[9px] font-bold text-purple-400 uppercase mt-1 tracking-widest italic">
                          {m.categoria?.NOMBRE || m.categoria?.nombre || "Sin Categoría"}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className={`text-sm font-black tracking-tight ${esIngreso ? 'text-emerald-500' : 'text-[#1A1A2E]'}`}>
                          {esIngreso ? '+' : '-'} ${Number(m.MONTO || m.monto || 0).toLocaleString('es-CL')}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {urlComprobante ? (
                          <a 
                            href={urlComprobante} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-sm border border-slate-100 hover:border-purple-500" 
                            title="Auditar Documento"
                          >
                            <FileText size={16} />
                          </a>
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <ArrowRightLeft size={64} className="text-slate-400" strokeWidth={1} />
                        <h3 className="text-xl font-black uppercase tracking-tighter text-[#1A1A2E]">Sin Transacciones</h3>
                        <p className="text-xs font-medium text-slate-500 italic max-w-sm leading-relaxed">No se encontraron movimientos que coincidan con la búsqueda o el periodo actual.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}