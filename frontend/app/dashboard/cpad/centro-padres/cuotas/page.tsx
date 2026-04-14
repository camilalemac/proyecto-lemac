"use client"
import React, { useState, useEffect } from "react"
import { Receipt, Loader2, AlertCircle, FileSpreadsheet, ArrowLeft, ShieldAlert } from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"

interface Cuota {
  cobro_id: number;
  descripcion: string;
  monto_original: number;
  estado: string;
}

export default function CuotasColegioPage() {
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Nuevo estado para controlar si el usuario está autorizado
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchCuotas = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        if (!token) {
          setError("No hay sesión activa. Por favor, inicia sesión.");
          setLoading(false);
          return;
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        }
        
        let colId = 1;
        
        // 1. Llamada a MS_IDENTITY para obtener colegio y ROLES
        try {
          const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { headers })
          if (resMe.ok) {
            const jsonMe = await resMe.json()
            colId = jsonMe.data?.perfil?.colegio_id || 1 
            
            // --- VALIDACIÓN DE ROL DE CENTRO DE PADRES ---
            const rolesDelUsuario = jsonMe.data?.roles || [];
            const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
              const code = rol.rol_code;
              return code === 'CEN_PRES_CAP' || code === 'CEN_TES_CAP' || code === 'CEN_SEC_CAP' ||
                     code === 'DIR_PRES_APO' || code === 'DIR_TES_APO' || code === 'DIR_SEC_APO';
            });

            if (!esCentroDePadres) {
              setIsAuthorized(false);
              setLoading(false);
              return; // Detenemos el flujo aquí, no pedimos cuotas
            }
            
            setIsAuthorized(true); // Sí tiene permiso
          }
        } catch (e) {
          console.warn("No se pudo resolver la identidad.")
          setError("Error validando tus permisos.");
          setLoading(false);
          return;
        }
        
        // 2. Si está autorizado, llamamos a MS_PAGOS
        const res = await fetch(`http://127.0.0.1:3002/api/v1/pagos/cobros/colegio/${colId}`, { headers })
        
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
           const json = await res.json()
           if (json.success || json.status === "success") {
             const dataMapeada = json.data.map((c: any) => ({
               cobro_id: c.COBRO_ID || c.cobro_id,
               descripcion: c.DESCRIPCION || c.descripcion,
               monto_original: c.MONTO_ORIGINAL || c.monto_original,
               estado: c.ESTADO || c.estado
             }));
             setCuotas(dataMapeada)
           } else {
             setError("Error al recuperar los datos del servidor.");
           }
        } else {
           console.warn("El endpoint /cobros/colegio no devolvió JSON.")
        }

      } catch (e: any) { 
        console.error("Excepción en fetchCuotas:", e)
        setError("Error crítico de conexión con la API de Pagos (Puerto 3002).");
      } finally { 
        setLoading(false) 
      }
    }
    fetchCuotas()
  }, [])

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
        Verificando Permisos y Datos...
      </p>
    </div>
  )

  // --- VISTA DE ACCESO DENEGADO ---
  if (isAuthorized === false) return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-500/5 text-center animate-in zoom-in-95 duration-500">
      <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-rose-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-2">Acceso Restringido</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
        No tienes los permisos necesarios para ver esta información. Esta vista es exclusiva para miembros activos de la directiva del Centro de Padres.
      </p>
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1A2E] bg-slate-50 hover:bg-rose-50 px-6 py-3 rounded-2xl transition-colors border border-slate-100 hover:border-rose-200"
      >
        <ArrowLeft size={16} />
        Volver al Inicio
      </Link>
    </div>
  )

  // --- VISTA NORMAL SI TIENE PERMISO ---
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Botón Volver al Inicio */}
      <div className="flex items-center">
        <Link 
          href="/dashboard/cpad/centro-padres" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A1A2E] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:border-[#FF8FAB]/50"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Panel
        </Link>
      </div>

      {/* Alerta de Error Nativa */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold shadow-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Header Institucional */}
      <header className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="p-4 bg-[#1A1A2E] rounded-[1.25rem] text-[#FF8FAB] shadow-lg shadow-slate-900/10">
             <FileSpreadsheet size={32} strokeWidth={1.5} />
           </div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Cartera de Cuotas</h1>
             <p className="text-slate-400 text-sm font-bold mt-1">Registro contable de cobros institucionales</p>
           </div>
        </div>
        
        {/* Etiqueta de Contexto */}
        <div className="w-full md:w-auto bg-slate-50 text-slate-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FF8FAB] animate-pulse" />
          Vista Global
        </div>
      </header>

      {/* Tabla de Datos de MS_PAGOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#1A1A2E] text-white">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] w-32">ID Operación</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Concepto Facturado</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-right w-48">Monto Solicitado</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-center w-40">Estado Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {cuotas.length > 0 ? (
                cuotas.map((c) => (
                  <tr key={c.cobro_id} className="hover:bg-slate-50 transition-colors duration-200 group">
                    <td className="p-6 text-xs font-black text-slate-400 group-hover:text-[#FF8FAB] transition-colors">
                      #OP-{c.cobro_id.toString().padStart(4, '0')}
                    </td>
                    <td className="p-6 text-sm font-bold text-[#1A1A2E]">
                      {c.descripcion}
                    </td>
                    <td className="p-6 text-sm font-black text-[#1A1A2E] text-right tracking-tighter">
                      ${Number(c.monto_original).toLocaleString('es-CL')}
                    </td>
                    <td className="p-6 flex justify-center">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                        c.estado === 'PAGADO' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-100'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                /* Estado Vacío (Zero State) */
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                      <Receipt size={40} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <p className="font-black text-xs text-[#1A1A2E] uppercase tracking-[0.2em] mb-2">
                      Sin Registros Contables
                    </p>
                    <p className="font-bold text-xs text-slate-400 max-w-sm mx-auto">
                      No se encontraron cuotas para este colegio en la base de datos MS_PAGOS.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}