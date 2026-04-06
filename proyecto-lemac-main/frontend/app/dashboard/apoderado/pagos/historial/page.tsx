"use client"
import React, { useState, useEffect } from "react"
import { 
  CheckCircle2, Download, Receipt, Calendar, Search, 
  Loader2, ArrowLeft, Hash, CreditCard, AlertCircle 
} from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"

interface PagoRealizado {
  PAGO_ID: number;
  MONTO_TOTAL: number;
  METODO_PAGO: string;
  FECHA_PAGO: string;
  ESTADO: string;
  ORDEN_COMPRA: string;
}

export default function HistorialPagosPage() {
  const [pagos, setPagos] = useState<PagoRealizado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filtro, setFiltro] = useState("")

  const fetchHistorial = async () => {
    setLoading(true)
    setError(false)
    try {
      const token = Cookies.get("auth-token")
      if (!token) throw new Error("No hay token de sesión");

      // Usamos localhost para evitar problemas de resolución de IP
      const res = await fetch("http://localhost:3002/api/v1/pagos/transacciones/mis-pagos", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Validación de seguridad para asegurar que recibimos JSON y no un error HTML
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        console.error("Servidor respondió con error o formato no válido:", res.status);
        throw new Error("Respuesta no válida del servidor");
      }
      
      const data = await res.json()
      if (data.success) {
        setPagos(data.data)
      } else {
        throw new Error(data.message || "Error al procesar la data");
      }
    } catch (err) {
      console.error("Error detallado en fetchHistorial:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistorial()
  }, [])

  const pagosFiltrados = pagos.filter(p => 
    p.ORDEN_COMPRA.toLowerCase().includes(filtro.toLowerCase()) ||
    p.METODO_PAGO.toLowerCase().includes(filtro.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF0F5] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} />
      <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-[0.3em]">Recuperando historial...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF0F5] p-4 lg:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER & VOLVER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link 
              href="/dashboard/apoderado" 
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-gray-500 font-bold text-[10px] uppercase tracking-widest rounded-full shadow-sm hover:text-[#FF8FAB] transition-all mb-6 border border-gray-100"
            >
              <ArrowLeft size={16} /> Volver al Inicio
            </Link>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight">Historial de Pagos</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-1.5 bg-[#FF8FAB] rounded-full animate-pulse" />
              <p className="text-[#FF8FAB] font-black uppercase text-[10px] tracking-[0.2em]">Comprobantes y Transacciones</p>
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR ORDEN..." 
              className="w-full pl-14 pr-6 py-4 bg-white border-transparent rounded-full text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm placeholder:text-gray-300"
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {/* LISTADO DE PAGOS O ERROR */}
        <div className="space-y-4">
          {error ? (
             <div className="bg-white p-16 rounded-[3rem] text-center border border-red-100">
                <AlertCircle className="mx-auto text-red-300 mb-4" size={48} />
                <p className="text-gray-400 font-black text-xs uppercase tracking-widest leading-relaxed mb-6">
                  No pudimos conectar con el <br/> historial de transacciones.
                </p>
                <button 
                  onClick={fetchHistorial}
                  className="px-8 py-3 bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-red-100 transition-all"
                >
                  Reintentar conexión
                </button>
             </div>
          ) : pagosFiltrados.length > 0 ? (
            pagosFiltrados.map((pago) => (
              <div 
                key={pago.PAGO_ID} 
                className="bg-white p-6 md:p-8 rounded-[3rem] border border-white shadow-sm hover:shadow-xl hover:shadow-pink-200/20 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash size={12} className="text-[#FF8FAB]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{pago.ORDEN_COMPRA}</p>
                    </div>
                    <p className="text-2xl font-black text-[#1A1A2E] tracking-tighter">
                      ${pago.MONTO_TOTAL.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 w-full md:w-auto border-y md:border-y-0 md:border-x border-gray-50 py-4 md:py-0 md:px-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Calendar size={12} /> Fecha
                    </span>
                    <p className="text-xs font-black text-gray-600">
                      {new Date(pago.FECHA_PAGO).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CreditCard size={12} /> Método
                    </span>
                    <p className="text-xs font-black text-[#FF8FAB] uppercase italic">
                      {pago.METODO_PAGO}
                    </p>
                  </div>
                </div>

                <button className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A2E] text-white hover:bg-[#FF8FAB] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-95">
                  <Download size={16} /> Comprobante
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-24 rounded-[4rem] text-center border-2 border-dashed border-pink-100">
               <Receipt className="mx-auto text-pink-100 mb-6" size={64} />
               <p className="text-gray-400 font-black text-xs uppercase tracking-widest leading-loose">
                 {filtro ? "No hay pagos que coincidan con la búsqueda" : "Aún no has realizado transacciones"}
               </p>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center opacity-40">
           <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">
             Todos los pagos procesados están sujetos a validación bancaria inmediata.
           </p>
        </footer>
      </div>
    </div>
  )
}