"use client"
import { useState, useEffect } from "react"
import { PieChart, BarChart, Wallet, Loader2, Tag, AlertCircle, TrendingDown } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function GastosPorCategoriaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [datosGastos, setDatosGastos] = useState<any[]>([])
  const [totalGeneral, setTotalGeneral] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          router.push("/login")
          return
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }

        // 1. Obtener Colegio ID desde Identidad
        const resMe = await fetch(`${GATEWAY_URL}/identity/me`, { headers })
        const dataMe = await resMe.json()
        if (dataMe.status !== "success") throw new Error("Error de validación de identidad.")
        
        const colId = dataMe.data.perfil.colegio_id || 1

        // 2. Intentar obtener Categorías y Movimientos en paralelo
        const [resCats, resMov] = await Promise.all([
          fetch(`${GATEWAY_URL}/pagos/categorias`, { headers }),
          fetch(`${GATEWAY_URL}/pagos/movimientos-caja/cuenta/1`, { headers })
        ])

        // Validación lógica de la respuesta del Backend
        if (!resMov.ok) {
          if (resMov.status === 403) {
            throw new Error("El microservicio de pagos restringe el acceso a este rol (Error 403). Contacte al administrador del backend.");
          }
          if (resMov.status === 404) throw new Error("No se encontraron registros de egresos en la base de datos.");
          throw new Error(`Error de servidor (${resMov.status})`);
        }

        const dataCats = await resCats.json()
        const dataMov = await resMov.json()

        if (dataCats.success && dataMov.success) {
          const categorias = dataCats.data
          const movimientos = dataMov.data

          // Filtrar solo EGRESOS (Gastos reales en Oracle)
          const egresos = movimientos.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO')
          const total = egresos.reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)
          setTotalGeneral(total)

          // Agrupación lógica por ID de categoría
          const desglose = categorias.map((cat: any) => {
            const montoCat = egresos
              .filter((m: any) => Number(m.CATEGORIA_ID) === Number(cat.CATEGORIA_ID))
              .reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)

            return {
              id: cat.CATEGORIA_ID,
              nombre: cat.NOMBRE,
              monto: montoCat,
              porcentaje: total > 0 ? (montoCat / total) * 100 : 0
            }
          })

          // Ordenar y limpiar categorías vacías
          // Corregido el tipado (a: any, b: any) para evitar errores de VS Code
          setDatosGastos(desglose.filter((d: any) => d.monto > 0).sort((a: any, b: any) => b.monto - a.monto))
        }
      } catch (err: any) {
        console.error("Error cargando gastos CEAL:", err)
        setErrorMsg(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Analizando Ledger de Inversión...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER DINÁMICO */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <PieChart size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Gastos por Áreas</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Distribución del Presupuesto Alumnado</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-purple-600 bg-purple-50 px-6 py-4 rounded-3xl border border-purple-100 z-10 font-black text-[10px] uppercase tracking-widest">
          <Tag size={20} className="text-purple-400" /> Auditoría Transparente
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-white p-16 rounded-[4rem] border-2 border-dashed border-rose-100 flex flex-col items-center text-center gap-6">
          <div className="p-6 bg-rose-50 rounded-full text-rose-500 shadow-inner">
            <AlertCircle size={48} />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight">Acceso Restringido por Backend</h3>
            <p className="text-xs font-bold text-slate-400 mt-3 leading-relaxed uppercase">
              {errorMsg}
            </p>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Sugerencia técnica: Asegúrese de que el rol <span className="text-[#FF8FAB]">CEN_PRES_CAL</span> esté incluido en la lista de permisos de la ruta <code className="lowercase">/movimientos-caja/cuenta/:id</code> en el microservicio ms-pagos.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MÉTRICA TOTAL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1A1A2E] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-[0.2em] opacity-80">Egreso Total Ejecutado</p>
              <p className="text-5xl font-black mt-4 tracking-tighter italic">${totalGeneral.toLocaleString('es-CL')}</p>
              <TrendingDown size={120} className="absolute right-0 bottom-0 -mb-8 -mr-8 text-white/5 group-hover:scale-110 transition-transform" />
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-pink-50 shadow-sm">
              <h4 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-8 flex items-center gap-2">
                <BarChart size={14} className="text-[#FF8FAB]"/> Resumen Porcentual
              </h4>
              <div className="space-y-6">
                {datosGastos.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{cat.nombre}</span>
                    <span className="text-sm font-black text-[#1A1A2E]">{Math.round(cat.porcentaje)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESGLOSE POR ÁREA */}
          <div className="lg:col-span-8">
            <section className="bg-white rounded-[4rem] shadow-sm border border-pink-50 overflow-hidden h-full">
              <div className="p-10 border-b border-pink-50 bg-slate-50/30">
                <h3 className="text-xl font-black text-[#1A1A2E] flex items-center gap-3 uppercase tracking-tighter italic">
                  <Wallet className="text-[#FF8FAB]" size={22} /> Inversión por Categoría
                </h3>
              </div>
              
              <div className="p-10 space-y-10">
                {datosGastos.length > 0 ? datosGastos.map((cat, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Área Ejecutora</p>
                        <h4 className="text-2xl font-black text-[#1A1A2E] group-hover:text-purple-600 transition-colors uppercase tracking-tight italic">{cat.nombre}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#1A1A2E] tracking-tighter">${cat.monto.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                    {/* Barra de progreso con el nuevo estilo Tailwind */}
                    <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden flex items-center px-1 border border-slate-100 shadow-inner">
                      <div 
                        className="h-2.5 bg-linear-to-r from-[#1A1A2E] via-purple-500 to-[#FF8FAB] rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${cat.porcentaje}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center flex flex-col items-center opacity-30">
                    <PieChart size={60} className="mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Sin registros de egresos detectados en la BD</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}