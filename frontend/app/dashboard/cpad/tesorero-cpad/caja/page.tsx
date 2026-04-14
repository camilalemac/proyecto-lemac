"use client"
import React, { useState, useEffect } from "react"
import { 
  Vault, ArrowRight, Loader2, CheckCircle2, 
  AlertCircle, ShieldAlert, Landmark, CircleDollarSign, ServerOff
} from "lucide-react"
import Cookies from "js-cookie"

export default function AperturaCajaPage() {
  const [loading, setLoading] = useState(true)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null) 
  const [cuentas, setCuentas] = useState<any[]>([])
  
  const [cuentaOrigen, setCuentaOrigen] = useState<number | "">("")
  const [cuentaDestino, setCuentaDestino] = useState<number | "">("")
  const [procesando, setProcesando] = useState(false)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success'|'error'} | null>(null)

  const fetchCuentas = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("auth-token")
      
      if (!token) {
        throw new Error("No hay sesión activa. Falta el auth-token.")
      }

      const res = await fetch("http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias", {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) {
         if (res.status === 401 || res.status === 403) throw new Error("Acceso denegado: Token inválido o expirado.")
         throw new Error(`Error del servidor (${res.status})`)
      }
      
      const json = await res.json()
      if (json.success && json.data) {
        setCuentas(json.data)
        setErrorGlobal(null)
      }
    } catch (e: any) {
      setErrorGlobal(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCuentas()
  }, [])

  const handleApertura = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cuentaOrigen || !cuentaDestino) return
    if (cuentaOrigen === cuentaDestino) {
      setNotificacion({ msg: "No puede traspasar fondos a la misma cuenta.", tipo: 'error' })
      return
    }

    const cOrigenObj = cuentas.find(c => c.CUENTA_ID === Number(cuentaOrigen))
    if (!cOrigenObj || Number(cOrigenObj.SALDO_ACTUAL) <= 0) {
      setNotificacion({ msg: "La cuenta de origen no tiene fondos para trasladar.", tipo: 'error' })
      return
    }

    if (!window.confirm(`¿Confirmar apertura de caja por $${Number(cOrigenObj.SALDO_ACTUAL).toLocaleString('es-CL')}?`)) return

    setProcesando(true)
    
    try {
      const token = Cookies.get("auth-token")
      const res = await fetch("http://127.0.0.1:3007/api/v1/pagos/cuentas-bancarias/apertura-caja", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          cuentaOrigenId: Number(cuentaOrigen), 
          cuentaDestinoId: Number(cuentaDestino) 
        })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setNotificacion({ msg: "Apertura completada exitosamente en Oracle.", tipo: 'success' })
        setCuentaOrigen("")
        setCuentaDestino("")
        fetchCuentas() 
      } else {
        throw new Error(json.message || "Fallo en el proceso de apertura.")
      }
    } catch (e: any) {
      setNotificacion({ msg: e.message, tipo: 'error' })
    } finally {
      setProcesando(false)
      setTimeout(() => setNotificacion(null), 5000)
    }
  }

  const cOrigenInfo = cuentas.find(c => c.CUENTA_ID === Number(cuentaOrigen))

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verificando fondos en MS_PAGOS...</p>
    </div>
  )

  if (errorGlobal) return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-8">
      <ServerOff size={80} className="mb-6 text-rose-400 opacity-30" />
      <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Acceso Denegado</h2>
      <p className="text-sm font-bold text-rose-500 mt-2 max-w-md">{errorGlobal}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-8 px-8 py-3 bg-[#1A1A2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
      >
        Reintentar Conexión
      </button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {notificacion && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${notificacion.tipo === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notificacion.tipo === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          <p className="text-xs font-bold uppercase tracking-wider">{notificacion.msg}</p>
        </div>
      )}

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-5 rounded-4xl text-sky-400 shadow-xl">
            <Vault size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tighter">Apertura de Caja</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Traspaso de fondos entre periodos escolares</p>
          </div>
        </div>
      </header>

      {cuentas.length < 2 ? (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-center opacity-40 min-h-100">
          <AlertCircle size={64} className="mb-4 text-slate-400" />
          <h3 className="text-xl font-black uppercase tracking-tighter text-[#1A1A2E]">Cuentas Insuficientes</h3>
          <p className="text-sm font-medium mt-2 max-w-md text-slate-500 text-center">Se requieren al menos dos cuentas registradas para realizar una apertura contable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
            <form onSubmit={handleApertura} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cuenta Origen</label>
                <div className="relative">
                  <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select 
                    className="w-full appearance-none pl-14 pr-10 py-5 bg-slate-50 border-none rounded-3xl text-sm font-black text-[#1A1A2E] outline-none cursor-pointer focus:ring-2 focus:ring-[#FF8FAB] uppercase tracking-wider"
                    value={cuentaOrigen}
                    onChange={(e) => setCuentaOrigen(Number(e.target.value))}
                    required
                  >
                    <option value="" disabled>Seleccione origen</option>
                    {cuentas.map(c => <option key={`orig-${c.CUENTA_ID}`} value={c.CUENTA_ID}>{c.NOMBRE_CUENTA} (${Number(c.SALDO_ACTUAL).toLocaleString('es-CL')})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white text-slate-300">
                  <ArrowRight size={20} className="rotate-90 xl:rotate-0" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Cuenta Destino</label>
                <div className="relative">
                  <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select 
                    className="w-full appearance-none pl-14 pr-10 py-5 bg-slate-50 border-none rounded-3xl text-sm font-black text-[#1A1A2E] outline-none cursor-pointer focus:ring-2 focus:ring-[#FF8FAB] uppercase tracking-wider"
                    value={cuentaDestino}
                    onChange={(e) => setCuentaDestino(Number(e.target.value))}
                    required
                  >
                    <option value="" disabled>Seleccione destino</option>
                    {cuentas.map(c => <option key={`dest-${c.CUENTA_ID}`} value={c.CUENTA_ID}>{c.NOMBRE_CUENTA}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={procesando || !cuentaOrigen || !cuentaDestino}
                className="w-full mt-6 py-6 bg-[#1A1A2E] text-white rounded-4xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {procesando ? <Loader2 className="animate-spin" size={22} /> : <Vault size={22} />}
                <span className="text-sm font-black uppercase tracking-[0.2em]">Ejecutar Apertura</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#1A1A2E] p-12 rounded-[3.5rem] shadow-xl text-white flex-1 flex flex-col justify-center relative overflow-hidden">
              <CircleDollarSign size={180} className="absolute -right-12 -bottom-12 text-white/5" />
              <div className="z-10 text-center xl:text-left">
                <p className="text-[10px] font-black uppercase text-sky-400 tracking-[0.3em] mb-6">Monto del Traspaso</p>
                <h3 className="text-6xl font-black text-white tracking-tighter">${Number(cOrigenInfo?.SALDO_ACTUAL || 0).toLocaleString('es-CL')}</h3>
                <p className="text-xs font-bold text-slate-400 mt-6 uppercase leading-relaxed">Esta operación registrará automáticamente los movimientos de cierre y apertura en el historial.</p>
              </div>
            </div>

            <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 flex items-start gap-5">
              <AlertCircle className="text-amber-500 shrink-0" size={28} />
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-loose">
                Atención: Las aperturas de caja son procesos definitivos. Verifique los montos antes de confirmar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}