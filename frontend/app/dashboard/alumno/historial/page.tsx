"use client"
import { useState, useEffect, useMemo } from "react"
import { Receipt, Calendar, CreditCard, Download, ArrowLeft, Home, Loader2, AlertCircle, CheckCircle2, ServerOff } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

interface PagoReal {
  COBRO_ID: number;
  DESCRIPCION?: string;
  FECHA_PAGO: string;
  MONTO_PAGO: number;
  METODO_PAGO: string;
  TRANSACCION_ID: number;
}

export default function HistorialPagosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("TODOS")
  const [historial, setHistorial] = useState<PagoReal[]>([])
  const [matriculaVigente, setMatriculaVigente] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  // Verificador rápido del payload del token JWT
  const checkRolAlumno = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      return payload.role === "ALU_REG"
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    const fetchDatosReal = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const token = Cookies.get("auth-token")
        
        // 🔒 BLOQUEO DE SEGURIDAD 1: Redirigir si no hay sesión
        if (!token) {
          router.push("/login")
          return
        }

        // 🔒 BLOQUEO DE SEGURIDAD 2: Solo permitir al rol ALU_REG
        if (!checkRolAlumno(token)) {
            // Si quieres puedes redirigir a un 403 o solo bloquear la vista
            setError("Acceso denegado. No tienes permisos de alumno.")
            setLoading(false)
            return
        }

        const headers = { 'Authorization': `Bearer ${token}` }

        // 1. Datos Académicos vía Gateway (Opcional, no debe romper la app si falla)
        try {
          const resMat = await fetch(`${GATEWAY_URL}/academico/matriculas/vigente`, { headers })
          if (resMat.ok && resMat.headers.get("content-type")?.includes("application/json")) {
             const dataMat = await resMat.json()
             if (dataMat.success) setMatriculaVigente(dataMat.data)
          }
        } catch (e) {
          console.warn("No se pudo cargar la matrícula vigente.");
        }

        // 2. Historial de Transacciones Confirmadas
        // IMPORTANTE: Este endpoint debe consultar PAG_TRANSACCIONES en tu BD
        const resPagos = await fetch(`${GATEWAY_URL}/pagos/transacciones/historial`, { headers })
        
        // Validación Anti-Crashes (Evitar el error "Respuesta no es JSON")
        const contentType = resPagos.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const dataPagos = await resPagos.json()
            if (resPagos.ok && dataPagos.success) {
               setHistorial(dataPagos.data || [])
            } else {
               setError(dataPagos.message || "No se pudo cargar el historial.");
            }
        } else {
            throw new Error("El endpoint /transacciones/historial no existe en el backend (Devolvió HTML).");
        }

      } catch (err: any) {
        console.error("Error de conexión:", err.message)
        setError(err.message || "Error al conectar con el servidor de pagos.");
      } finally {
        setLoading(false)
      }
    }
    fetchDatosReal()
  }, [router])

  const pagosFiltrados = useMemo(() => {
    if (filtro === "TODOS") return historial
    return historial.filter(pago => {
      // Asumimos que la descripción trae la palabra "Cuota" si es mensualidad
      const esMensualidad = pago.DESCRIPCION?.toUpperCase().includes("CUOTA")
      return filtro === "MENSUALIDAD" ? esMensualidad : !esMensualidad
    })
  }, [historial, filtro])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} />
      <p className="text-[#1A1A2E] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando con Oracle...</p>
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
          <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight uppercase">Historial de Pagos</h1>
          <p className="text-[#FF8FAB] font-bold text-[10px] uppercase tracking-widest mt-2">
            {matriculaVigente ? `Alumno Regular - Período ${matriculaVigente.ANIO || new Date().getFullYear()}` : "Transacciones Confirmadas Inmutables"}
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
            <div key={pago.TRANSACCION_ID || pago.COBRO_ID} className="bg-white p-7 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="p-5 bg-[#FAF5FF] text-[#FF8FAB] rounded-3xl group-hover:rotate-6 transition-transform shadow-sm border border-pink-50">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-[#1A1A2E] text-lg uppercase leading-none">
                    {pago.DESCRIPCION || `Transacción Oficial #${pago.TRANSACCION_ID}`}
                  </h3>
                  <div className="flex gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <Calendar size={12} className="text-[#FF8FAB]" /> 
                      {pago.FECHA_PAGO ? new Date(pago.FECHA_PAGO).toLocaleString('es-CL') : 'Fecha no disponible'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <CreditCard size={12} className="text-[#FF8FAB]" /> 
                      {pago.METODO_PAGO || 'MÉTODO DIGITAL'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-10 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1A1A2E] tracking-tighter">
                    ${Number(pago.MONTO_PAGO).toLocaleString('es-CL')}
                  </p>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 inline-block mt-1">
                    Pago Exitoso
                  </span>
                </div>
                <button 
                  onClick={() => alert(`Descargando comprobante para la transacción ${pago.TRANSACCION_ID}...`)}
                  className="p-4 bg-[#1A1A2E] text-[#FF8FAB] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
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
              Sin pagos confirmados en historial
            </p>
          </div>
        )}
      </div>
    </div>
  )
}