"use client"

import React, { useState, useEffect } from "react"
import { Receipt, Loader2, AlertCircle, Calendar, CreditCard, ChevronRight, Hash } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// Interfaz basada en tu modelo Sequelize/Oracle
interface Transaccion {
  TRANSACCION_ID: number;
  COBRO_ID: number;
  MONTO_PAGO: number;
  METODO_PAGO: string;
  FECHA_PAGO: string;
}

export default function HistorialPagosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1"

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          router.push("/login")
          return
        }

        // 1. Decodificamos el token para obtener el colegioId
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(window.atob(base64))
        const colegioId = payload.colegioId

        if (!colegioId) {
          throw new Error("No se encontró el identificador del colegio en la sesión.")
        }

        // 2. Llamada al endpoint real del backend: /transacciones/colegio/:id
        const response = await fetch(`${GATEWAY_URL}/pagos/transacciones/colegio/${colegioId}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error del servidor: ${response.status}`)
        }

        const data = await response.json()
        
        // Sequelize devuelve un array directamente según tu controlador
        setTransacciones(Array.isArray(data) ? data : [])

      } catch (err: any) {
        console.error("Error cargando historial:", err.message)
        setError(err.message || "Error al conectar con el servidor de pagos.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistorial()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Consultando Ledger Blockchain...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">
            Historial de <span className="text-[#FF8FAB]">Pagos</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Registro inmutable de transacciones</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
          <CreditCard size={14} /> Sistema Verificado
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-4xl flex items-center gap-4 text-rose-600">
          <AlertCircle size={24} />
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Atención</p>
            <p className="text-xs font-bold opacity-80">{error}</p>
          </div>
        </div>
      ) : transacciones.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
          <div className="p-6 bg-slate-50 rounded-full text-slate-300 mb-4"><Receipt size={48} /></div>
          <h3 className="text-lg font-black text-[#1A1A2E] uppercase">Sin movimientos</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-2 font-bold">Aún no registras pagos exitosos en este periodo escolar.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transacciones.map((tx) => (
            <div 
              key={tx.TRANSACCION_ID}
              className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="p-4 bg-[#F8F9FA] rounded-2xl text-[#1A1A2E] group-hover:bg-[#FF8FAB] group-hover:text-white transition-colors">
                  <Hash size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Transacción</p>
                  <p className="text-sm font-black text-[#1A1A2E]">TXN-{tx.TRANSACCION_ID}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Calendar size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Pago</p>
                  <p className="text-sm font-bold text-[#1A1A2E]">
                    {new Date(tx.FECHA_PAGO).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">Método</p>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-600 block text-center">
                  {tx.METODO_PAGO}
                </span>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Monto Pagado</p>
                  <p className="text-2xl font-black text-[#1A1A2E] tracking-tighter">
                    ${tx.MONTO_PAGO.toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded-full text-slate-300 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}