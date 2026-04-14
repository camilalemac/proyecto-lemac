"use client"
import React, { useState, useEffect } from "react"
import { 
  ArrowRightLeft, Search, Wallet, Loader2, Calendar, 
  TrendingUp, TrendingDown, FileText, Download, PlusCircle, AlertCircle
} from "lucide-react"
import Cookies from "js-cookie"

export default function MovimientosCajaPage() {
  const [loadingCuentas, setLoadingCuentas] = useState(true)
  const [loadingMovimientos, setLoadingMovimientos] = useState(false)
  const [cuentas, setCuentas] = useState<any[]>([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | null>(null)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")

  // 1. Obtener las cuentas bancarias reales desde el MS_PAGOS
  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const token = Cookies.get("auth-token")
        const res = await fetch("http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const json = await res.json()
        
        if (json.success && json.data.length > 0) {
          setCuentas(json.data)
          setCuentaSeleccionada(json.data[0].CUENTA_ID) 
        }
      } catch (e) {
        console.error("Error al conectar con el microservicio de cuentas bancarias.");
      } finally {
        setLoadingCuentas(false)
      }
    }
    fetchCuentas()
  }, [])

  // 2. Obtener movimientos reales cuando cambia la cuenta seleccionada
  useEffect(() => {
    if (!cuentaSeleccionada) return;

    const fetchMovimientos = async () => {
      setLoadingMovimientos(true)
      try {
        const token = Cookies.get("auth-token")
        const res = await fetch(`http://127.0.0.1:3007/api/v1/pagos/movimientos-caja/cuenta/${cuentaSeleccionada}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
             setMovimientos(json.data)
          }
        }
      } catch (e) {
        console.error("Error al conectar con el microservicio de movimientos de caja.");
      } finally {
        setLoadingMovimientos(false)
      }
    }
    fetchMovimientos()
  }, [cuentaSeleccionada])

  // Filtrado
  const movimientosFiltrados = movimientos.filter(m => 
    m.GLOSA?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cuentaActiva = cuentas.find(c => c.CUENTA_ID === cuentaSeleccionada)

  if (loadingCuentas) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verificando cuentas bancarias autorizadas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* HEADER Y SELECTOR DE CUENTA */}
      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-4 rounded-2xl text-purple-400 shadow-lg">
            <ArrowRightLeft size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Flujo de Caja</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Historial de Ingresos y Egresos</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="appearance-none pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black text-[#1A1A2E] outline-none cursor-pointer focus:ring-2 focus:ring-[#FF8FAB] uppercase tracking-wider"
              value={cuentaSeleccionada || ""}
              onChange={(e) => setCuentaSeleccionada(Number(e.target.value))}
              disabled={cuentas.length === 0}
            >
              {cuentas.length > 0 ? (
                cuentas.map(c => <option key={c.CUENTA_ID} value={c.CUENTA_ID}>{c.NOMBRE_CUENTA}</option>)
              ) : (
                <option value="">Sin cuentas configuradas</option>
              )}
            </select>
          </div>

          <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* RESUMEN DE LA CUENTA SELECCIONADA */}
      {cuentaActiva && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Saldo Actual</p>
            <h3 className="text-3xl font-black text-[#FF8FAB]">${cuentaActiva.SALDO_ACTUAL?.toLocaleString('es-CL')}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">{cuentaActiva.BANCO || "Sin Entidad Asignada"}</p>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-center md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar movimientos por glosa o descripción..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#FF8FAB] outline-none transition-all"
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
            <AlertCircle size={64} className="mb-4" />
            <h3 className="text-lg font-black uppercase">No hay cuentas disponibles</h3>
            <p className="text-sm font-medium mt-2">El administrador o tesorero debe agregar una cuenta bancaria al sistema.</p>
          </div>
        ) : loadingMovimientos ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando transacciones en la nube...</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Fecha</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipo</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Glosa / Descripción</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Monto</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movimientosFiltrados.length > 0 ? movimientosFiltrados.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">
                          {new Date(m.FECHA_MOVIMIENTO).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        m.TIPO_MOVIMIENTO === 'INGRESO' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {m.TIPO_MOVIMIENTO === 'INGRESO' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {m.TIPO_MOVIMIENTO}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-[#1A1A2E]">{m.GLOSA}</p>
                      {m.categoria && <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{m.categoria.NOMBRE}</p>}
                    </td>
                    <td className="px-8 py-6">
                      <p className={`text-sm font-black ${m.TIPO_MOVIMIENTO === 'INGRESO' ? 'text-emerald-500' : 'text-[#1A1A2E]'}`}>
                        {m.TIPO_MOVIMIENTO === 'INGRESO' ? '+' : '-'} ${m.MONTO?.toLocaleString('es-CL')}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {m.COMPROBANTE_URL ? (
                        <a href={m.COMPROBANTE_URL} target="_blank" rel="noreferrer" className="inline-flex p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Ver Comprobante">
                          <FileText size={16} />
                        </a>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase">N/A</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <ArrowRightLeft size={64} />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">No se encontraron movimientos</p>
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