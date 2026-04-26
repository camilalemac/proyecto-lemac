"use client"
import { useState, useEffect } from "react"
import { 
  Receipt, Loader2, CreditCard, ArrowLeft, Search, CheckSquare, Square, AlertCircle
} from "lucide-react" 
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { pagosService } from "../../../../services/pagosService"
import { academicoService } from "../../../../services/academicoService"
import { ICuotaFamiliar } from "../../../../types/admin.types"
import { formatCurrencyCLP } from "../../../../utils/formatters"

export default function MisCuotasPage() {
  const router = useRouter()
  const [cuotas, setCuotas] = useState<ICuotaFamiliar[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const COMISION_BANCARIA = 0.035;

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) { router.push("/login"); return; }

        // 1. Obtenemos los hijos
        const hijos = await academicoService.getMisHijos()
        
        if (hijos.length > 0) {
          // 2. Obtenemos cuotas de todos los hijos en paralelo
          const promesas = hijos.map(async (hijo) => {
            const ctaHijo = await pagosService.getCuotasByAlumno(hijo.ALUMNO_ID)
            return ctaHijo.map(c => ({
              ...c,
              NOMBRE_ALUMNO: `${hijo.ALUMNO_NOMBRES} ${hijo.ALUMNO_APELLIDOS}`
            }))
          })

          const resultados = await Promise.all(promesas)
          setCuotas(resultados.flat())
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al sincronizar con el nodo de pagos.";
        setErrorMsg(message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  const handlePagarSeleccionados = async () => {
    if (selectedIds.length === 0) return;
    setPaying(true)
    
    try {
      const payload = {
        monto: Math.round(totalFinal),
        cuotasIds: selectedIds,
        buyOrder: `LEMAC-${Date.now()}`,
        returnUrl: `${window.location.origin}/dashboard/apoderado/confirmacion-pago`
      }

      const data = await pagosService.iniciarPagoMercadoPago(payload)
      alert("Redirigiendo a MercadoPago...")
      window.location.href = data.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error iniciando el pago.";
      alert(message)
      setPaying(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const pendientes = cuotas.filter(c => c.ESTADO === 'PENDIENTE').map(c => c.COBRO_ID);
    setSelectedIds(selectedIds.length === pendientes.length ? [] : pendientes);
  }

  const filteredCuotas = cuotas.filter(c => {
    const term = searchTerm.toLowerCase()
    return c.NOMBRE_ALUMNO.toLowerCase().includes(term) || c.DESCRIPCION.toLowerCase().includes(term)
  });

  const subtotal = cuotas
    .filter(c => selectedIds.includes(c.COBRO_ID))
    .reduce((acc, curr) => acc + (curr.MONTO_ORIGINAL || 0), 0)
  
  const comision = subtotal * COMISION_BANCARIA
  const totalFinal = subtotal + comision

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0F5]">
      <Loader2 className="animate-spin text-[#FF8FAB] mb-4" size={48} />
      <p className="font-black text-[#1A1A2E] text-[10px] uppercase tracking-widest">Sincronizando deudas familiares...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-4 lg:p-10 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard/apoderado" className="inline-flex items-center gap-3 px-6 py-3 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded-full shadow-sm hover:text-[#FF8FAB] transition-all mb-8 border border-gray-100">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        {/* 🛡️ RENDERIZADO DEL MENSAJE DE ERROR */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 p-8 rounded-4xl flex items-center gap-4 text-rose-600 shadow-sm mb-8">
            <AlertCircle size={28} />
            <div>
              <p className="text-sm font-black uppercase tracking-tight">Fallo de Sincronización</p>
              <p className="text-xs font-bold opacity-80">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA: LISTADO */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">Cuotas Pendientes</h1>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Filtrar por hijo o ítem..."
                      className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF8FAB] w-full md:w-64 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FF8FAB] transition-colors">
                    {selectedIds.length > 0 && selectedIds.length === cuotas.filter(c => c.ESTADO === 'PENDIENTE').length ? (
                      <CheckSquare className="text-[#FF8FAB]" size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                    Seleccionar todo para pago
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {filteredCuotas.length === 0 ? (
                  <div className="p-20 text-center text-gray-400">
                    <Receipt className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="text-[10px] uppercase font-black tracking-widest">Sin deudas registradas</p>
                  </div>
                ) : (
                  filteredCuotas.map((cuota) => (
                    <div 
                      key={cuota.COBRO_ID}
                      onClick={() => { if (!paying && cuota.ESTADO === 'PENDIENTE') toggleSelect(cuota.COBRO_ID) }}
                      className={`p-6 flex items-center gap-6 hover:bg-gray-50 transition-all ${cuota.ESTADO === 'PENDIENTE' ? 'cursor-pointer' : 'opacity-40'} ${selectedIds.includes(cuota.COBRO_ID) ? 'bg-pink-50/20' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedIds.includes(cuota.COBRO_ID) ? 'bg-[#FF8FAB] border-[#FF8FAB] text-white' : 'border-gray-200'}`}>
                        {selectedIds.includes(cuota.COBRO_ID) && <CheckSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest mb-1">{cuota.NOMBRE_ALUMNO}</p>
                        <h4 className="font-black text-[#1A1A2E] text-sm uppercase leading-tight">{cuota.DESCRIPCION}</h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Vence: {new Date(cuota.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#1A1A2E] tracking-tighter">{formatCurrencyCLP(cuota.MONTO_ORIGINAL)}</p>
                        {cuota.ESTADO === 'PAGADO' && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded mt-1 inline-block">PAGADO</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TOTALES */}
          <div className="lg:col-span-4">
            <div className="bg-[#1A1A2E] text-white p-10 rounded-[4rem] shadow-2xl sticky top-8 border-t-8 border-[#FF8FAB]">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <CreditCard className="text-[#FF8FAB]" size={24} /> Caja de Pago
              </h2>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Seleccionados</span>
                  <span className="text-white">{selectedIds.length}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal Neto</span>
                  <span className="font-bold text-white">{formatCurrencyCLP(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[#FF8FAB]">
                  <span className="text-[10px] font-black uppercase tracking-widest">Servicio Digital (3.5%)</span>
                  <span className="font-bold">+{formatCurrencyCLP(Math.round(comision))}</span>
                </div>
                <div className="pt-6 border-t border-white/10 mt-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                  <p className="text-5xl font-black tracking-tighter text-[#FF8FAB]">{formatCurrencyCLP(Math.round(totalFinal))}</p>
                </div>
              </div>
              <button 
                onClick={handlePagarSeleccionados}
                disabled={selectedIds.length === 0 || paying}
                className="w-full py-6 bg-[#FF8FAB] text-[#1A1A2E] rounded-4xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all disabled:opacity-10 shadow-xl shadow-[#FF8FAB]/20"
              >
                {paying ? <Loader2 className="animate-spin mx-auto" /> : "Procesar con MercadoPago"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}