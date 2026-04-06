"use client"
import { useState, useEffect } from "react"
import { 
  Receipt, Loader2, CreditCard, ArrowLeft, Search, CheckSquare, Square
} from "lucide-react" 
import Link from "next/link"
import Cookies from "js-cookie"

export default function MisCuotasPage() {
  const [cuotas, setCuotas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  const COMISION_BANCARIA = 0.035;

  const fetchCuotasFamiliares = async () => {
    setLoading(true)
    try {
      const token = Cookies.get("auth-token")
      if (!token) return;

      // 1. Obtener alumnos (Port 3007)
      const resHijos = await fetch("http://localhost:3007/api/v1/familia/mis-familiares", {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!resHijos.ok) throw new Error("Error en microservicio familia")
      const dataHijos = await resHijos.json()

      if (dataHijos.success && dataHijos.data.length > 0) {
        // 2. Obtener cuotas de cada alumno (Port 3002)
        const promesasCuotas = dataHijos.data.map(async (familiar: any) => {
          const resCuotas = await fetch(`http://localhost:3002/api/v1/pagos/cuentas-cobrar/alumno/${familiar.ALUMNO_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (!resCuotas.ok) return []
          const dCuotas = await resCuotas.json()
          
          return dCuotas.success ? dCuotas.data.map((c: any) => ({
            ...c,
            NOMBRE_ALUMNO: `${familiar.alumno?.NOMBRE || 'Alumno'} ${familiar.alumno?.APELLIDO_PATERNO || ''}`
          })) : []
        })

        const resultados = await Promise.all(promesasCuotas)
        setCuotas(resultados.flat())
      }
    } catch (err) {
      console.error("Error al cargar cuotas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCuotasFamiliares() }, [])

  const handlePagarSeleccionados = async () => {
    if (selectedIds.length === 0) return;
    setPaying(true)
    try {
      const token = Cookies.get("auth-token")
      const response = await fetch("http://localhost:3002/api/v1/pagos/webpay/iniciar", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: Math.round(totalFinal),
          cuotasIds: selectedIds,
          buyOrder: `LEMAC-${Date.now()}`,
          returnUrl: `${window.location.origin}/dashboard/apoderado/confirmacion-pago`
        })
      });

      if (!response.ok) throw new Error("Error en el servidor de pagos");
      const { url, token: wsToken } = await response.json();

      // Redirección manual a Webpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = wsToken;
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert("Error al conectar con el servicio de pagos (3002).");
      setPaying(false);
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const pendientes = cuotas.filter(c => c.ESTADO === 'PENDIENTE').map(c => c.ID_CUOTA);
    if (selectedIds.length === pendientes.length && pendientes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendientes);
    }
  }

  const filteredCuotas = cuotas.filter(c => 
    c.NOMBRE_ALUMNO.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.DESCRIPCION.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cuotas.filter(c => selectedIds.includes(c.ID_CUOTA)).reduce((acc, curr) => acc + curr.MONTO, 0)
  const comision = subtotal * COMISION_BANCARIA
  const totalFinal = subtotal + comision

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0F5]">
      <Loader2 className="animate-spin text-[#FF8FAB] mb-4" size={48} />
      <p className="font-black text-[#1A1A2E] text-[10px] uppercase tracking-widest">Sincronizando deudas...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-4 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard/apoderado" className="inline-flex items-center gap-3 px-6 py-3 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded-full shadow-sm hover:text-[#FF8FAB] transition-all mb-8 border border-gray-100">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-2xl font-black text-[#1A1A2E]">Listado de Cuotas</h1>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por alumno..."
                      className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#FF8FAB] w-full md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FF8FAB] transition-colors"
                  >
                    {selectedIds.length > 0 && selectedIds.length === cuotas.filter(c => c.ESTADO === 'PENDIENTE').length ? (
                      <CheckSquare className="text-[#FF8FAB]" size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                    Marcar todo para pago ({cuotas.filter(c => c.ESTADO === 'PENDIENTE').length})
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {filteredCuotas.length === 0 ? (
                  <div className="p-20 text-center text-gray-400">
                    <Receipt className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="text-sm font-bold">No hay cuotas pendientes registradas.</p>
                  </div>
                ) : (
                  filteredCuotas.map((cuota) => (
                    <div 
                      key={cuota.ID_CUOTA}
                      onClick={() => !paying && toggleSelect(cuota.ID_CUOTA)}
                      className={`p-6 flex items-center gap-6 hover:bg-gray-50 transition-all cursor-pointer ${selectedIds.includes(cuota.ID_CUOTA) ? 'bg-pink-50/20' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedIds.includes(cuota.ID_CUOTA) ? 'bg-[#FF8FAB] border-[#FF8FAB] text-white' : 'border-gray-200'}`}>
                        {selectedIds.includes(cuota.ID_CUOTA) && <CheckSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-[#FF8FAB] uppercase mb-0.5">{cuota.NOMBRE_ALUMNO}</p>
                        <h4 className="font-bold text-[#1A1A2E] text-sm uppercase">{cuota.DESCRIPCION}</h4>
                        <p className="text-[10px] text-gray-400">Vence: {new Date(cuota.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#1A1A2E]">${cuota.MONTO.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#1A1A2E] text-white p-10 rounded-[4rem] shadow-2xl sticky top-8">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                <CreditCard className="text-[#FF8FAB]" size={24} /> Resumen
              </h2>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                  <span>Seleccionados</span>
                  <span>{selectedIds.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                  <span className="font-bold">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center text-[#FF8FAB]">
                  <span className="text-[10px] font-black uppercase">Comisión (3.5%)</span>
                  <span>+${Math.round(comision).toLocaleString('es-CL')}</span>
                </div>
                <div className="pt-6 border-t border-white/10 mt-6">
                  <p className="text-5xl font-black tracking-tighter">${Math.round(totalFinal).toLocaleString('es-CL')}</p>
                </div>
              </div>
              <button 
                onClick={handlePagarSeleccionados}
                disabled={selectedIds.length === 0 || paying}
                className="w-full py-6 bg-[#FF8FAB] rounded-4xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all disabled:opacity-20"
              >
                {paying ? <Loader2 className="animate-spin mx-auto" /> : "Pagar con Webpay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}