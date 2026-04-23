"use client"
import { useState, useEffect } from "react"
import { PieChart as PieIcon, BarChart, Wallet, Loader2, Tag, AlertCircle, TrendingDown, ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA (6 niveles hacia arriba para llegar a la raíz)
import { pagosService } from "../../../../../services/pagosService";
import { formatCurrencyCLP } from "../../../../../utils/formatters";

export default function GastosPorCategoriaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [datosGastos, setDatosGastos] = useState<any[]>([])
  const [totalGeneral, setTotalGeneral] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const fetchGastosReal = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { router.push("/login"); return; }

        // 1. Obtener movimientos reales de la cuenta corporativa (ID 1)
        // Esto consulta la tabla MS_PAGOS.PAG_MOVIMIENTOS_CAJA
        const movimientos = await pagosService.getMovimientosByCuenta(1)

        // 2. Filtrar solo los EGRESOS (Gastos realizados)
        const egresos = movimientos.filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO')
        const total = egresos.reduce((acc, m) => acc + Number(m.MONTO || 0), 0)
        setTotalGeneral(total)

        // 3. Agrupación dinámica por nombre de categoría
        const agrupado: Record<string, any> = {}
        
        egresos.forEach((m: any) => {
          const nombreCat = m.CATEGORIA_NOMBRE || "Sin Categoría"
          if (!agrupado[nombreCat]) {
            agrupado[nombreCat] = { nombre: nombreCat, monto: 0 }
          }
          agrupado[nombreCat].monto += Number(m.MONTO || 0)
        })

        // 4. Convertir a array y calcular porcentajes
        const desgloseFinal = Object.values(agrupado).map((cat: any) => ({
          ...cat,
          porcentaje: total > 0 ? (cat.monto / total) * 100 : 0
        }))

        setDatosGastos(desgloseFinal.sort((a, b) => b.monto - a.monto))

      } catch (err: any) {
        console.error("Error cargando desglose de gastos:", err)
        setErrorMsg(err.message || "Error al sincronizar con el nodo de pagos.")
      } finally {
        setLoading(false)
      }
    }

    fetchGastosReal()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Analizando Ledger de Inversión...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      <Link href="/dashboard/alumno/ceal-presidente" className="flex items-center gap-2 text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-widest w-fit group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Panel
      </Link>

      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-pink-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="bg-[#1A1A2E] p-6 rounded-3xl text-white shadow-2xl">
            <PieIcon size={40} className="text-[#FF8FAB]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Gastos por Áreas</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Distribución del Presupuesto Institucional</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-purple-600 bg-purple-50 px-6 py-4 rounded-3xl border border-purple-100 z-10 font-black text-[10px] uppercase tracking-widest">
          <Tag size={20} className="text-purple-400" /> Auditoría Transparente Activa
        </div>
      </header>

      {errorMsg ? (
        <div className="bg-white p-16 rounded-[4rem] border-2 border-dashed border-rose-100 flex flex-col items-center text-center gap-6">
          <AlertCircle size={48} className="text-rose-500" />
          <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight">Acceso Restringido</h3>
          <p className="text-xs font-bold text-slate-400 uppercase max-w-md">{errorMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MÉTRICA TOTAL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1A1A2E] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-[0.2em] opacity-80">Gasto Total Ejecutado</p>
              <p className="text-5xl font-black mt-4 tracking-tighter italic">{formatCurrencyCLP(totalGeneral)}</p>
              <TrendingDown size={120} className="absolute right-0 bottom-0 -mb-8 -mr-8 text-white/5 group-hover:scale-110 transition-transform" />
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-pink-50 shadow-sm">
              <h4 className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest mb-8 flex items-center gap-2">
                <BarChart size={14} className="text-[#FF8FAB]"/> Resumen Porcentual
              </h4>
              <div className="space-y-6">
                {datosGastos.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight truncate max-w-[70%]">{cat.nombre}</span>
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
              
              <div className="p-10 space-y-10 overflow-y-auto max-h-150 no-scrollbar">
                {datosGastos.length > 0 ? datosGastos.map((cat, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Centro de Costo</p>
                        <h4 className="text-2xl font-black text-[#1A1A2E] group-hover:text-purple-600 transition-colors uppercase tracking-tight italic">{cat.nombre}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#1A1A2E] tracking-tighter">{formatCurrencyCLP(cat.monto)}</p>
                      </div>
                    </div>
                    {/* Barra de progreso con gradiente Lemac */}
                    <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden flex items-center px-1 border border-slate-100 shadow-inner">
                      <div 
                        className="h-2.5 bg-linear-to-r from-[#1A1A2E] via-purple-500 to-[#FF8FAB] rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${cat.porcentaje}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center flex flex-col items-center opacity-30">
                    <PieIcon size={60} className="mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Sin registros de egresos detectados</p>
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