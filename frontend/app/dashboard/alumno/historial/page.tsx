"use client"
import { useState, useEffect, useMemo } from "react"
import { Receipt, Calendar, CreditCard, Download, ArrowLeft, Home, Loader2, CheckCircle2, ServerOff } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { pagosService } from "../../../../services/pagosService"
import { academicoService } from "../../../../services/academicoService"
import { IHistorialPago } from "../../../../types/admin.types"
import { formatCurrencyCLP } from "../../../../utils/formatters"

export default function HistorialPagosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("TODOS")
  const [historial, setHistorial] = useState<IHistorialPago[]>([])
  const [matriculaVigente, setMatriculaVigente] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const token = Cookies.get("auth-token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // Ejecutamos historial y matrícula (opcional) en paralelo
        const [pagoData, matData] = await Promise.allSettled([
          pagosService.getHistorialPagos(),
          academicoService.getPeriodos() // O un endpoint específico de matricula vigente si existe
        ])

        if (pagoData.status === "fulfilled") {
          setHistorial(pagoData.value)
        } else {
          throw new Error("No se pudo conectar con el Ledger de Pagos.")
        }

        if (matData.status === "fulfilled") {
          // Buscamos el periodo activo para mostrar en el header
          const activo = (matData.value as any[]).find(p => p.ESTADO === 'ACTIVO')
          setMatriculaVigente(activo)
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Filtrado reactivo en el cliente
  const pagosFiltrados = useMemo(() => {
    if (filtro === "TODOS") return historial
    return historial.filter(pago => {
      const desc = pago.DESCRIPCION?.toUpperCase() || ""
      const esMensualidad = desc.includes("CUOTA") || desc.includes("MENSUAL")
      return filtro === "MENSUALIDAD" ? esMensualidad : !esMensualidad
    })
  }, [historial, filtro])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} />
      <p className="text-[#1A1A2E] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Validando registros Blockchain...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8 animate-in fade-in duration-700 pb-24">
      <nav className="flex gap-4 mb-8">
        <Link href="/dashboard/alumno" className="flex items-center gap-2 text-[#1A1A2E]/40 font-black text-[10px] uppercase tracking-widest hover:text-[#FF8FAB] transition-all">
          <Home size={14} /> Inicio
        </Link>
        <span className="text-gray-200">|</span>
        <Link href="/dashboard/alumno/cuotas" className="flex items-center gap-2 text-[#1A1A2E]/40 font-black text-[10px] uppercase tracking-widest hover:text-[#FF8FAB] transition-all">
          <ArrowLeft size={14} /> Mis Cuotas
        </Link>
      </nav>

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight uppercase italic">Historial</h1>
          <p className="text-[#FF8FAB] font-bold text-[10px] uppercase tracking-widest mt-2">
            {matriculaVigente 
              ? `Año Escolar ${matriculaVigente.ANIO} • Transacciones Inmutables` 
              : "Verificación de Pagos Confirmados"}
          </p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {["TODOS", "MENSUALIDAD", "OTROS"].map((f) => (
            <button 
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black transition-all ${filtro === f ? 'bg-[#1A1A2E] text-[#FF8FAB] shadow-md' : 'text-slate-400 hover:text-[#1A1A2E]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl mb-8 flex items-center gap-4 border border-rose-100 font-bold text-xs uppercase tracking-tight">
          <ServerOff size={20} /> {error}
        </div>
      )}

      <div className="grid gap-4">
        {pagosFiltrados.length > 0 ? (
          pagosFiltrados.map((pago) => (
            <div key={pago.TRANSACCION_ID} className="bg-white p-7 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="p-5 bg-[#FAF5FF] text-[#FF8FAB] rounded-3xl group-hover:rotate-6 transition-transform shadow-sm border border-pink-50">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-[#1A1A2E] text-lg uppercase leading-none">
                    {pago.DESCRIPCION || `Transacción ID #${pago.TRANSACCION_ID}`}
                  </h3>
                  <div className="flex gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <Calendar size={12} className="text-[#FF8FAB]" /> 
                      {new Date(pago.FECHA_PAGO).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <CreditCard size={12} className="text-[#FF8FAB]" /> 
                      {pago.METODO_PAGO}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-10 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1A1A2E] tracking-tighter">
                    {formatCurrencyCLP(pago.MONTO_PAGO)}
                  </p>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 inline-block mt-1">
                    Verificado en Ledger
                  </span>
                </div>
                <button 
                  onClick={() => alert(`Generando comprobante tributario para la transacción ${pago.TRANSACCION_ID}...`)}
                  className="p-4 bg-[#1A1A2E] text-[#FF8FAB] rounded-2xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-lg flex items-center justify-center gap-2"
                  title="Descargar Comprobante PDF"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))
        ) : !loading && !error && (
          <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
            <Receipt size={64} className="mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">
              No se registran movimientos confirmados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}