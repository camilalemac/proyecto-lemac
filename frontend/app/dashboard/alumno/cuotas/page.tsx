"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, CheckCircle2, Clock, Receipt, Tag, ChevronRight, ServerOff } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA (Asegúrate de que las rutas relativas sean correctas según tu carpeta)
import { pagosService } from "../../../../services/pagosService"
import { ICobroAlumno, IResumenCuotas, IConceptoEspecial } from "../../../../types/admin.types"
import { formatCurrencyCLP } from "../../../../utils/formatters"

export default function CuotasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('TODAS')
  const [data, setData] = useState<IResumenCuotas>({
    cobros: [], 
    totalPendiente: 0,
    totalPagado: 0
  })
  const [conceptosEspeciales, setConceptosEspeciales] = useState<IConceptoEspecial[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        // 🔒 BLOQUEO DE SEGURIDAD
        if (!token) {
          router.push("/login")
          return
        }

        // 1. Petición de Cuotas usando el servicio unificado
        const resumen = await pagosService.getMisCuotasResumen()
        setData(resumen)

        // 2. Petición de Conceptos Extraordinarios
        // Nota: Aquí pedimos los conceptos generales y filtramos los "baratos" o especiales
        const todosLosConceptos = await pagosService.getMetodos() 
        // Filtramos para la barra lateral (conceptos de bajo costo o tipo extraordinario)
        const especiales = (todosLosConceptos as any[]).filter((c: any) => 
          c.TIPO_COBRO === 'EXTRAORDINARIO' || (c.MONTO_BASE || c.montoBase) <= 5000
        )
        setConceptosEspeciales(especiales)

      } catch (error: any) {
        console.error("Error en Portal de Cuotas:", error.message)
        setErrorMsg(error.message || "Error de comunicación con el servidor de pagos.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Función para procesar el pago real (Webpay / Khipu)
  const handlePagar = async (cobroId: number) => {
    try {
      const result = await pagosService.iniciarPago(cobroId)
      alert("Iniciando conexión segura con pasarela de pago...")
      // Redirección externa al motor de pagos (Webpay/MercadoPago)
      window.location.href = result.url
    } catch (e: any) {
      alert(e.message || "No se pudo iniciar el proceso de pago.")
    }
  }

  const cuotasFiltradas = data.cobros.filter((c: ICobroAlumno) => {
    if (filter === 'TODAS') return true
    return c.ESTADO === filter
  })

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E]">
      <Loader2 className="animate-spin text-[#FF8FAB] mb-4" size={48} />
      <p className="text-white font-black text-[10px] uppercase tracking-widest animate-pulse">Analizando Ledger de Pagos...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-[#1A1A2E] text-white p-10 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/alumno" className="p-4 bg-white/5 rounded-2xl hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Estado de Cuenta</h1>
              <p className="text-[#FF8FAB] text-[10px] font-black uppercase tracking-[0.3em]">Registros oficiales LemacPay</p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8 md:mt-0">
             <div className="bg-white/5 p-6 rounded-4xl border border-white/10 backdrop-blur-sm text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Deuda Pendiente</p>
                <p className="text-2xl font-black text-[#FF8FAB]">{formatCurrencyCLP(data.totalPendiente)}</p>
             </div>
             <div className="bg-white/5 p-6 rounded-4xl border border-white/10 backdrop-blur-sm text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Total Pagado</p>
                <p className="text-2xl font-black text-emerald-400">{formatCurrencyCLP(data.totalPagado)}</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto -mt-12 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h3 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest flex items-center gap-3">
                <Receipt size={20} className="text-[#FF8FAB]" /> Historial de Movimientos
              </h3>
              
              <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                {['TODAS', 'PENDIENTE', 'PAGADO'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black transition-all ${filter === f ? 'bg-[#1A1A2E] text-white shadow-xl' : 'text-slate-400 hover:text-[#1A1A2E]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {errorMsg && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                    <ServerOff size={18}/> {errorMsg}
                </div>
              )}

              {cuotasFiltradas.length > 0 ? cuotasFiltradas.map((c: ICobroAlumno) => (
                <div key={c.COBRO_ID} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-[#FF8FAB]/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${c.ESTADO === 'PAGADO' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {c.ESTADO === 'PAGADO' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-[#1A1A2E] text-sm uppercase leading-tight">{c.DESCRIPCION}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vencimiento: {new Date(c.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 md:mt-0 md:gap-10">
                    <span className="text-xl font-black text-[#1A1A2E] tracking-tighter">{formatCurrencyCLP(Number(c.MONTO_ORIGINAL))}</span>
                    {c.ESTADO === 'PENDIENTE' && (
                      <button 
                        onClick={() => handlePagar(c.COBRO_ID)}
                        className="bg-[#1A1A2E] text-[#FF8FAB] px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                   <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">
                     {errorMsg ? "Error de sincronización" : "Sin registros financieros en este filtro"}
                   </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-[#FF8FAB] p-10 rounded-[3.5rem] text-[#1A1A2E] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="bg-[#1A1A2E] text-white w-fit p-3 rounded-2xl mb-6 shadow-xl">
                    <Tag size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase leading-tight tracking-tighter mb-2">Cobros Directos</h3>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-10">Conceptos extraordinarios</p>
                
                <div className="space-y-4">
                   {conceptosEspeciales.length > 0 ? conceptosEspeciales.map((conc: IConceptoEspecial) => (
                      <SpecialItem 
                        key={conc.CONCEPTO_ID} 
                        label={conc.NOMBRE} 
                        price={formatCurrencyCLP(conc.MONTO_BASE)} 
                        onClick={() => handlePagar(conc.CONCEPTO_ID)}
                      />
                   )) : (
                    <p className="text-[10px] font-bold opacity-40 text-center uppercase py-4">No hay conceptos disponibles</p>
                   )}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Receipt size={180} />
              </div>
           </div>
        </aside>
      </main>
    </div>
  )
}

function SpecialItem({ label, price, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 bg-white/20 hover:bg-white/40 rounded-3xl transition-all border border-white/10 group"
    >
      <span className="text-[10px] font-black uppercase tracking-tight text-left max-w-[60%]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black bg-[#1A1A2E] text-white px-3 py-1.5 rounded-xl shadow-lg">{price}</span>
        <ChevronRight size={14} className="text-[#1A1A2E]/40 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}