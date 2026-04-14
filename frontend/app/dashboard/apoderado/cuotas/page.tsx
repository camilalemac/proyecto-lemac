"use client"
import { useState, useEffect } from "react"
import { 
  Receipt, Loader2, CreditCard, ArrowLeft, Search, CheckSquare, Square, ServerOff, AlertCircle
} from "lucide-react" 
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function MisCuotasPage() {
  const router = useRouter()
  const [cuotas, setCuotas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const COMISION_BANCARIA = 0.035;
  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  // Validación estricta para Apoderados
  const checkRolApoderado = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      return payload.role.includes("APO") || payload.role.includes("CAP") || payload.role === "FAM_APO"
    } catch (e) {
      return false
    }
  }

  const fetchCuotasFamiliares = async () => {
    setLoading(true)
    setErrorMsg(null)

    try {
      const token = Cookies.get("auth-token")
      
      // 🔒 BLOQUEO DE SEGURIDAD
      if (!token) {
        router.push("/login")
        return
      }

      if (!checkRolApoderado(token)) {
        setErrorMsg("Acceso denegado. No tienes permisos de Apoderado.")
        setLoading(false)
        return
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // 1. Obtener alumnos (Hijos del apoderado) desde MS_ACADEMICO a través del Gateway
      const resHijos = await fetch(`${GATEWAY_URL}/academico/familias/mis-hijos`, { headers })
      
      const contentTypeHijos = resHijos.headers.get("content-type");
      if (!contentTypeHijos || !contentTypeHijos.includes("application/json")) {
          throw new Error("El endpoint /academico/familias/mis-hijos no existe en el backend.");
      }

      const dataHijos = await resHijos.json()

      if (dataHijos.success && dataHijos.data && dataHijos.data.length > 0) {
        
        // 2. Obtener cuotas de cada alumno desde MS_PAGOS a través del Gateway
        const promesasCuotas = dataHijos.data.map(async (hijo: any) => {
          try {
            const resCuotas = await fetch(`${GATEWAY_URL}/pagos/cuentas-cobrar/alumno/${hijo.ALUMNO_ID}`, { headers })
            
            if (resCuotas.ok && resCuotas.headers.get("content-type")?.includes("application/json")) {
                const dCuotas = await resCuotas.json()
                return dCuotas.success ? dCuotas.data.map((c: any) => ({
                  ...c,
                  NOMBRE_ALUMNO: `${hijo.alumno?.NOMBRE || hijo.NOMBRES || 'Alumno'} ${hijo.alumno?.APELLIDO_PATERNO || hijo.APELLIDOS || ''}`
                })) : []
            }
            return []
          } catch (e) {
            return []
          }
        })

        const resultados = await Promise.all(promesasCuotas)
        setCuotas(resultados.flat())
      } else {
        // El apoderado no tiene hijos registrados aún
        setCuotas([])
      }
    } catch (err: any) {
      console.error("Error al cargar cuotas:", err)
      setErrorMsg(err.message || "Error al sincronizar datos con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCuotasFamiliares() }, [router])

  const handlePagarSeleccionados = async () => {
    if (selectedIds.length === 0) return;
    setPaying(true)
    
    try {
      const token = Cookies.get("auth-token")
      
      // ✅ Pasamos por el Gateway (3007) hacia el MS_PAGOS
      const response = await fetch(`${GATEWAY_URL}/pagos/transacciones/iniciar-mercadopago`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: Math.round(totalFinal),
          cuotasIds: selectedIds,
          buyOrder: `LEMAC-${Date.now()}`,
          returnUrl: `${window.location.origin}/dashboard/apoderado/confirmacion-pago`
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         alert("Error: El endpoint POST /transacciones/iniciar-mercadopago aún no existe en el backend.");
         setPaying(false);
         return;
      }

      if (!response.ok) throw new Error("Error en el servidor de pagos");
      const data = await response.json();

      if (data.success) {
          alert("Redirigiendo a la pasarela de pagos...");
          window.location.href = data.data.url; // Asumiendo que el backend retorna {success: true, data: { url: "..."}}
      } else {
          alert("Error al iniciar pago: " + data.message);
          setPaying(false);
      }
    } catch (err) {
      alert("Error al conectar con el servicio de pagos. Revisa tu conexión.");
      setPaying(false);
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    // Si tus campos en BD se llaman COBRO_ID (según tu SQL), usamos eso, o ID_CUOTA si el backend lo transforma.
    const pendientes = cuotas.filter(c => c.ESTADO === 'PENDIENTE').map(c => c.COBRO_ID || c.ID_CUOTA);
    if (selectedIds.length === pendientes.length && pendientes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendientes);
    }
  }

  const filteredCuotas = cuotas.filter(c => {
    const nombre = c.NOMBRE_ALUMNO || "";
    const desc = c.DESCRIPCION || "";
    return nombre.toLowerCase().includes(searchTerm.toLowerCase()) || desc.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const subtotal = cuotas.filter(c => selectedIds.includes(c.COBRO_ID || c.ID_CUOTA)).reduce((acc, curr) => acc + (curr.MONTO_ORIGINAL || curr.MONTO), 0)
  const comision = subtotal * COMISION_BANCARIA
  const totalFinal = subtotal + comision

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0F5]">
      <Loader2 className="animate-spin text-[#FF8FAB] mb-4" size={48} />
      <p className="font-black text-[#1A1A2E] text-[10px] uppercase tracking-widest">Sincronizando deudas del Grupo Familiar...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-4 lg:p-10 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard/apoderado" className="inline-flex items-center gap-3 px-6 py-3 bg-white text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded-full shadow-sm hover:text-[#FF8FAB] transition-all mb-8 border border-gray-100">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl mb-8 flex items-center gap-4 border border-rose-100 font-bold text-xs uppercase tracking-tight">
            <ServerOff size={20} /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Listado de Cuotas</h1>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por alumno o cuota..."
                      className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF8FAB] w-full md:w-64 transition-all"
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
                    <p className="text-[10px] uppercase font-black tracking-widest">
                       {errorMsg ? "No se pudieron cargar los datos" : "No hay cuotas pendientes registradas"}
                    </p>
                  </div>
                ) : (
                  filteredCuotas.map((cuota) => {
                    const id = cuota.COBRO_ID || cuota.ID_CUOTA;
                    const isSelected = selectedIds.includes(id);
                    const isPendiente = cuota.ESTADO === 'PENDIENTE';

                    return (
                    <div 
                      key={id}
                      onClick={() => { if (!paying && isPendiente) toggleSelect(id) }}
                      className={`p-6 flex items-center gap-6 hover:bg-gray-50 transition-all ${isPendiente ? 'cursor-pointer' : 'opacity-60'} ${isSelected ? 'bg-pink-50/20' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#FF8FAB] border-[#FF8FAB] text-white' : 'border-gray-200'}`}>
                        {isSelected && <CheckSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-[#FF8FAB] uppercase tracking-widest mb-1">{cuota.NOMBRE_ALUMNO}</p>
                        <h4 className="font-black text-[#1A1A2E] text-sm uppercase leading-tight">{cuota.DESCRIPCION}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Vence: {cuota.FECHA_VENCIMIENTO ? new Date(cuota.FECHA_VENCIMIENTO).toLocaleDateString('es-CL') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#1A1A2E] tracking-tighter">${Number(cuota.MONTO_ORIGINAL || cuota.MONTO).toLocaleString('es-CL')}</p>
                        {!isPendiente && (
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded mt-1 inline-block">
                              PAGADO
                           </span>
                        )}
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#1A1A2E] text-white p-10 rounded-[4rem] shadow-2xl sticky top-8">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <CreditCard className="text-[#FF8FAB]" size={24} /> Resumen de Pago
              </h2>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Seleccionados</span>
                  <span className="text-white">{selectedIds.length}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center text-[#FF8FAB]">
                  <span className="text-[10px] font-black uppercase tracking-widest">Servicio (3.5%)</span>
                  <span className="font-bold">+${Math.round(comision).toLocaleString('es-CL')}</span>
                </div>
                <div className="pt-6 border-t border-white/10 mt-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Transferir</p>
                  <p className="text-5xl font-black tracking-tighter text-[#FF8FAB]">${Math.round(totalFinal).toLocaleString('es-CL')}</p>
                </div>
              </div>
              <button 
                onClick={handlePagarSeleccionados}
                disabled={selectedIds.length === 0 || paying}
                className="w-full py-6 bg-[#FF8FAB] text-[#1A1A2E] rounded-4xl font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all disabled:opacity-20 disabled:hover:scale-100 shadow-xl shadow-[#FF8FAB]/20"
              >
                {paying ? <Loader2 className="animate-spin mx-auto text-[#1A1A2E]" /> : "Pagar con Webpay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}