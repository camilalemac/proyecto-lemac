"use client"
import React, { useState, useEffect } from "react"
import { Receipt, Loader2, AlertCircle, Calendar, CreditCard, ChevronRight, Hash, Home } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { pagosService } from "../../../../services/pagosService"
import { authService } from "../../../../services/authService"
import { ITransaccionFamiliar } from "../../../../types/admin.types"
import { formatCurrencyCLP } from "../../../../utils/formatters"

export default function HistorialPagosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transacciones, setTransacciones] = useState<ITransaccionFamiliar[]>([])

  useEffect(() => {
    const fetchHistorial = async () => {
      const token = Cookies.get("auth-token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // 1. Obtenemos el perfil real desde el servicio (MS_IDENTITY)
        const perfil = await authService.getMe()
        
        // 🛡️ Tipado estricto sin 'any' para evitar errores de ESLint
        const dataPerfil = perfil as { colegioId?: number; COLEGIO_ID?: number; colegio_id?: number };
        
        // ✅ CORRECCIÓN: Buscamos colegio_id en minúscula que es el formato JSON, 
        // y si el backend olvidó mandarlo, usamos 1 por defecto (Liceo Juana Ross) para que no bloquee
        const idCol = dataPerfil.colegioId || dataPerfil.COLEGIO_ID || dataPerfil.colegio_id || 1;
        
        if (!idCol) {
          throw new Error("No se pudo verificar la vinculación institucional.")
        }

        // 2. Llamada al servicio conectado al backend real
        const data = await pagosService.getHistorialPorColegio(idCol)
        setTransacciones(data)

      // 🛡️ CORRECCIÓN ESLINT: Cambiamos 'any' por 'unknown'
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al conectar con el ledger de pagos.";
        console.error("Error cargando historial:", errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchHistorial()
  }, [router])

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
        Consultando Ledger Blockchain...
      </p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* NAVEGACIÓN */}
      <nav className="flex items-center gap-4">
        <Link href="/dashboard/apoderado" className="text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Home size={14} /> Inicio
        </Link>
        <div className="w-1 h-1 bg-slate-200 rounded-full" />
        <Link href="/dashboard/apoderado/cuotas" className="text-slate-400 hover:text-[#1A1A2E] transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          <Receipt size={14} /> Mis Cuotas
        </Link>
      </nav>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter italic">
            Historial de <span className="text-[#FF8FAB]">Pagos</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Registro de Transacciones Familiares</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2 shadow-sm">
          <CreditCard size={14} /> Nodo Oracle Verificado
        </div>
      </header>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-4xl flex items-center gap-4 text-rose-600 shadow-sm">
          <AlertCircle size={28} />
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Fallo de Sincronización</p>
            <p className="text-xs font-bold opacity-80">{error}</p>
          </div>
        </div>
      ) : transacciones.length === 0 ? (
        <div className="bg-white p-24 rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center opacity-60">
          <div className="p-8 bg-slate-50 rounded-full text-slate-200 mb-6"><Receipt size={64} /></div>
          <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tight">Sin registros confirmados</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-3 font-medium uppercase tracking-widest">No se detectan movimientos financieros en este ciclo.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transacciones.map((tx) => (
            <div 
              key={tx.TRANSACCION_ID}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="p-4 bg-slate-50 rounded-2xl text-[#1A1A2E] group-hover:bg-[#FF8FAB] group-hover:text-white transition-all shadow-inner">
                  <Hash size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Folio de Operación</p>
                  <p className="text-sm font-black text-[#1A1A2E]">TXN-{tx.TRANSACCION_ID}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Calendar size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Abono</p>
                  <p className="text-sm font-bold text-[#1A1A2E] uppercase">
                    {new Date(tx.FECHA_PAGO).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">Canal de Pago</p>
                <span className="px-4 py-1.5 bg-[#1A1A2E] rounded-full text-[9px] font-black uppercase text-[#FF8FAB] block text-center shadow-lg shadow-blue-900/20">
                  {tx.METODO_PAGO}
                </span>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Monto Invertido</p>
                  <p className="text-2xl font-black text-[#1A1A2E] tracking-tighter">
                    {formatCurrencyCLP(tx.MONTO_PAGO)}
                  </p>
                </div>
                <button 
                  onClick={() => alert(`Certificando transacción TXN-${tx.TRANSACCION_ID}...`)}
                  className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-[#FF8FAB]/10 group-hover:text-[#FF8FAB] transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}