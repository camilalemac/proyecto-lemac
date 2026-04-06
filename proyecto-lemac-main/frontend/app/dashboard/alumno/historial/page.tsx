"use client"
import { useState, useEffect, useMemo } from "react"
import { Receipt, Calendar, CreditCard, Download, ArrowLeft, Home, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"

// Interface alineada con tu modelo de base de datos Oracle y ms-pagos
interface PagoReal {
  COBRO_ID: number;
  CONCEPTO_ID: number;
  DESCRIPCION: string | null;
  FECHA_VENCIMIENTO: string;
  MONTO_PAGADO: number;
  ESTADO: string;
  METODO_PAGO?: string;
  CONCEPTO?: {
    NOMBRE: string;
  };
}

export default function HistorialPagosPage() {
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("TODOS")
  const [historial, setHistorial] = useState<PagoReal[]>([])
  const [matriculaVigente, setMatriculaVigente] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDatosReal = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const token = Cookies.get("auth-token")
        
        if (!token) {
          setError("No se encontró una sesión activa. Por favor, inicia sesión.")
          setLoading(false)
          return
        }

        // 1. Obtener Datos Académicos (ms-academico)
        const resMatricula = await fetch("http://127.0.0.1:3007/api/v1/academico/matriculas/vigente", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const dataMatricula = await resMatricula.json()
        if (dataMatricula.success) setMatriculaVigente(dataMatricula.data)

        // 2. Obtener Historial de Cobros (ms-pagos)
        const resPagos = await fetch("http://127.0.0.1:3002/api/v1/pagos/cuentas-cobrar/mis-cobros", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!resPagos.ok) throw new Error("Error al conectar con el servicio de pagos")
        
        const dataPagos = await resPagos.json()
        
        if (dataPagos.success) {
          // En el historial solo mostramos lo que ya fue pagado con éxito
          const soloPagados = dataPagos.data.filter((p: PagoReal) => p.ESTADO === "PAGADO")
          setHistorial(soloPagados)
        }
      } catch (err) {
        console.error("Error en la conexión:", err)
        setError("No pudimos cargar tu historial. Verifica que los servicios estén activos.")
      } finally {
        setLoading(false)
      }
    }

    fetchDatosReal()
  }, [])

  // Lógica de filtrado por categoría
  const pagosFiltrados = useMemo(() => {
    if (filtro === "TODOS") return historial
    return historial.filter(pago => {
      // Filtramos por CONCEPTO_ID (1 suele ser mensualidad en sistemas educativos)
      if (filtro === "MENSUALIDAD") return pago.CONCEPTO_ID === 1
      return pago.CONCEPTO_ID !== 1
    })
  }, [historial, filtro])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFE] gap-4">
      <Loader2 className="animate-spin text-purple-400" size={48} />
      <p className="text-purple-400 font-black text-[10px] uppercase tracking-widest italic">Cargando transacciones...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-8">
      {/* Navegación Superior */}
      <nav className="flex gap-4 mb-8">
        <Link href="/dashboard/alumno" className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-all">
          <Home size={14} /> Inicio
        </Link>
        <span className="text-gray-200">|</span>
        <Link href="/dashboard/alumno/cuotas" className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-purple-400 transition-all">
          <ArrowLeft size={14} /> Mis Cuotas
        </Link>
      </nav>

      {/* Título y Filtros */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Historial de Pagos</h1>
          <p className="text-pink-400 font-medium italic text-sm">
            {matriculaVigente ? `Alumno Regular - ${matriculaVigente.ANIO}` : "Registro de actividades financieras"}
          </p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-purple-50">
          {["TODOS", "MENSUALIDAD", "OTROS"].map((f) => (
            <button 
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${filtro === f ? 'bg-purple-500 text-white shadow-md' : 'text-gray-400 hover:text-purple-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Alerta de Error si falla el fetch */}
      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-4xl mb-8 flex items-center gap-4 border border-red-100 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={24} />
          <div>
            <p className="font-black text-xs uppercase tracking-wider">Error de Sincronización</p>
            <p className="text-sm font-medium opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de Pagos */}
      <div className="grid gap-4">
        {pagosFiltrados.length > 0 ? (
          pagosFiltrados.map((pago) => (
            <div key={pago.COBRO_ID} className="bg-white p-6 rounded-[2.5rem] border border-purple-50 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="p-4 bg-pink-50 text-pink-400 rounded-2xl group-hover:rotate-6 transition-transform">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-700 text-lg">
                    {pago.CONCEPTO?.NOMBRE || pago.DESCRIPCION || `Pago ID: ${pago.COBRO_ID}`}
                  </h3>
                  <div className="flex gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                      <Calendar size={12} /> {new Date(pago.FECHA_VENCIMIENTO).toLocaleDateString('es-CL')}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                      <CreditCard size={12} /> {pago.METODO_PAGO || 'Transferencia'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8">
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-800">
                    ${pago.MONTO_PAGADO.toLocaleString('es-CL')}
                  </p>
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-tighter bg-green-50 px-2 py-0.5 rounded-md">
                    {pago.ESTADO}
                  </span>
                </div>
                <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-sm">
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))
        ) : !loading && (
          <div className="text-center py-20 bg-white rounded-[3.5rem] border-2 border-dashed border-purple-50">
            <div className="mb-4 flex justify-center text-purple-100">
              <Receipt size={64} />
            </div>
            <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.2em]">
              {error ? "No se pudo cargar la información" : "No registras pagos pagados todavía"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}