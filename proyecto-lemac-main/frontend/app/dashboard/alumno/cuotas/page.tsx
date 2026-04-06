"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Home, AlertCircle, Wallet, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie" // ✅ Cambiado de 'cookiejs' a 'js-cookie'

export default function CuotasPage() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('TODAS')
  const [data, setData] = useState({
    cobros: [], 
    totalPendiente: 0,
    totalPagado: 0
  })

  useEffect(() => {
    const fetchCuotas = async () => {
      try {
        const token = Cookies.get("auth-token")
        const API_URL = "http://127.0.0.1:3002/api/v1/pagos/cuentas-cobrar/mis-cobros/resumen";

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("La respuesta no es JSON válido");
        }

        const result = await response.json()

        if (!response.ok) {
          console.error("Error desde API:", result)
          setLoading(false)
          return
        }

        setData({
          cobros: result.data?.cobros || [],
          totalPendiente: result.data?.totalPendiente || 0,
          totalPagado: result.data?.totalPagado || 0
        })

      } catch (error) {
        console.error("Error de conexión:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCuotas()
  }, [])

  const cuotasFiltradas = filter === 'TODAS' 
    ? data.cobros 
    : data.cobros.filter((c: any) => c.ESTADO === filter)

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E]">
      <Loader2 className="animate-spin text-[#FF8FAB] mb-4" size={48} />
      <p className="text-white/60 font-bold text-xs uppercase tracking-widest animate-pulse">Sincronizando cuentas...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-plomo">
      {/* HEADER AZUL RELLENO TOTAL */}
      <header className="w-full bg-[#1A1A2E] border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
        <div className="max-w-380 mx-auto py-10 px-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex items-center gap-8">
              <Link 
                href="/dashboard/alumno" 
                className="group flex items-center gap-3 text-white/40 hover:text-[#FF8FAB] transition-all"
              >
                <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-[#FF8FAB]/20 border border-white/5 group-hover:border-[#FF8FAB]/30 transition-all">
                  <ArrowLeft size={20} />
                </div>
              </Link>
              
              <div className="h-14 w-px bg-white/10 hidden md:block"></div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-2 h-2 bg-[#FF8FAB] rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-[#FF8FAB] font-black uppercase tracking-[0.4em]">Área de Pagos</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Estado de Cuenta</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/alumno" 
                className="bg-[#252545] px-6 py-3 rounded-2xl border border-white/10 text-white/90 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:text-[#FF8FAB] hover:border-[#FF8FAB]/30 transition-all shadow-inner"
              >
                 <Home size={18} />
                 Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-380 mx-auto p-12 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Tabla de Registros */}
          <section className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#1A1A2E]"></div>
                Detalle de Cuotas
              </h2>
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
                {['TODAS', 'PENDIENTE', 'PAGADO'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      filter === f 
                        ? 'bg-[#1A1A2E] text-white shadow-lg' 
                        : 'text-gray-400 hover:text-[#1A1A2E]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 text-left">
                    <th className="pb-6">Descripción</th>
                    <th className="pb-6">Fecha Vencimiento</th>
                    <th className="pb-6">Monto</th>
                    <th className="pb-6 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cuotasFiltradas.length > 0 ? cuotasFiltradas.map((c: any) => (
                    <tr key={c.COBRO_ID} className="group hover:bg-plomo transition-colors">
                      <td className="py-7 text-sm font-bold text-gray-700 tracking-tight">{c.DESCRIPCION}</td>
                      <td className="py-7 text-[11px] font-black text-gray-400">
                        {c.FECHA_VENCIMIENTO ? new Date(c.FECHA_VENCIMIENTO).toLocaleDateString('es-CL') : '—'}
                      </td>
                      <td className="py-7 text-sm font-black text-[#1A1A2E]">
                        ${Number(c.MONTO_ORIGINAL).toLocaleString('es-CL')}
                      </td>
                      <td className="py-7 text-right">
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          c.ESTADO === 'PAGADO' 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-pink-50 text-[#FF8FAB] border-pink-100'
                        }`}>
                          {c.ESTADO}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-32 text-center">
                        <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">No hay registros en esta categoría</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Sidebar de Resumen */}
          <aside className="space-y-8">
            <div className="bg-[#1A1A2E] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-[#FF8FAB]/10 transition-all"></div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Total por Pagar</p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-black text-white tracking-tighter">
                  ${Number(data.totalPendiente).toLocaleString('es-CL')}
                </span>
                <span className="text-white/30 text-xs font-bold mb-2 uppercase">CLP</span>
              </div>
              <div className="bg-[#FF8FAB]/10 border border-[#FF8FAB]/20 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-[#FF8FAB] p-2 rounded-xl text-white">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#FF8FAB] uppercase">Pago Pendiente</p>
                  <p className="text-[10px] text-white/60 font-medium">Regulariza tu situación</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-100 group transition-all hover:border-green-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Historial Pagado</p>
              <p className="text-4xl font-black text-[#1A1A2E] tracking-tighter mb-6">
                ${Number(data.totalPagado).toLocaleString('es-CL')}
              </p>
              <div className="flex items-center gap-3 text-green-500 font-black text-[9px] uppercase">
                <div className="p-1.5 bg-green-50 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={16} />
                </div>
                Transacciones Exitosas
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}