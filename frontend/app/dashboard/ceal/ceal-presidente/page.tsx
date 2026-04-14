"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Download, Wallet, LayoutGrid, Loader2, Crown, 
  ShieldCheck, Info, TrendingDown, TrendingUp, ShieldAlert 
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CealPresidentePage() {
  const router = useRouter()
  const [transacciones, setTransacciones] = useState<any[]>([])
  const [reportes, setReportes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Nuevo estado para la autorización
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [finanzas, setFinanzas] = useState({
    ingresos: 0,
    egresos: 0,
    balanceFinal: 0,
  })

  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        // 1. Validar si existe el token
        if (!token) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }

        // 2. Obtener Colegio ID y validar Roles desde Identidad
        const resMe = await fetch(`${GATEWAY_URL}/identity/me`, { headers })
        const dataMe = await resMe.json()
        
        if (dataMe.status === "success") {
          // --- VALIDACIÓN DE ROL ESPECÍFICO DE CENTRO DE PADRES ---
          const rolesDelUsuario = dataMe.data?.roles || [];
          const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
            const code = rol.rol_code;
            return [
              'CEN_PRES_CAP', 'CEN_TES_CAP', 'CEN_SEC_CAP', 
              'DIR_PRES_APO', 'DIR_TES_APO', 'DIR_SEC_APO'
            ].includes(code);
          });

          // Si no tiene permiso de Centro de Padres, bloqueamos la vista
          if (!esCentroDePadres) {
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          setIsAuthorized(true);
          const colId = dataMe.data.perfil.colegio_id || 1;

          // 3. Obtener INGRESOS (ms-pagos: pag_transacciones)
          const resTrans = await fetch(`${GATEWAY_URL}/pagos/transacciones/colegio/${colId}`, { headers })
          let totalI = 0;
          if (resTrans.ok) {
            const dataTrans = await resTrans.json()
            if (Array.isArray(dataTrans)) {
              setTransacciones(dataTrans)
              totalI = dataTrans.reduce((acc: number, t: any) => acc + Number(t.MONTO_PAGO || 0), 0)
            }
          }

          // 4. Obtener EGRESOS (ms-pagos: pag_movimientos_caja)
          const resMov = await fetch(`${GATEWAY_URL}/pagos/movimientos-caja/cuenta/1`, { headers })
          let totalE = 0;
          if (resMov.ok) {
            const dataMov = await resMov.json()
            if (dataMov.success && Array.isArray(dataMov.data)) {
              totalE = dataMov.data
                .filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO')
                .reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)
            }
          }

          setFinanzas({
            ingresos: totalI,
            egresos: totalE,
            balanceFinal: totalI - totalE
          })

          // 5. Obtener Reportes (ms-reportes: rep_documentos)
          const resDocs = await fetch(`${GATEWAY_URL}/documentos`, { headers })
          if (resDocs.ok) {
            const dataDocs = await resDocs.json()
            if (dataDocs.success) setReportes(dataDocs.data || [])
          }
        } else {
          // Si el token es inválido o expiró
          setIsAuthorized(false)
        }
      } catch (err) {
        console.error("Error en fetchData:", err)
        setErrorMsg("Error de conexión con el Ledger Oracle")
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Sincronizando Ledger CEAL...</p>
    </div>
  )

  // Pantalla de Bloqueo de Seguridad
  if (isAuthorized === false) return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5 text-center animate-in zoom-in-95 duration-500">
      <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-red-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-2">Acceso Restringido</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
        No tienes los permisos necesarios para ver esta información. Esta vista es exclusiva para miembros activos de la directiva del Centro de Padres.
      </p>
      <button 
        onClick={() => router.push('/login')} 
        className="inline-flex items-center justify-center text-xs font-black uppercase tracking-widest text-[#1A1A2E] bg-slate-50 hover:bg-red-50 px-6 py-3 rounded-2xl transition-colors border border-slate-100 hover:border-red-200"
      >
        Ir al Login
      </button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* BANNER DINÁMICO */}
      <div className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="bg-linear-to-br from-purple-600 to-[#FF8FAB] p-5 rounded-4xl text-white shadow-2xl rotate-3">
            <Crown size={38} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tighter uppercase leading-none italic">Panel de Presidencia</h1>
            <p className="text-[11px] text-purple-400 font-bold uppercase tracking-[0.25em] mt-3 italic flex items-center gap-2">
              <ShieldCheck size={14} /> Transparencia Institucional Lemac Pay
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-purple-600 bg-purple-50/50 px-6 py-3 rounded-2xl border border-purple-100 z-10 font-black text-[10px] uppercase tracking-widest">
          <Info size={18} className="animate-bounce" /> Auditoría Oracle Cloud Activa
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-purple-100 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ingresos Totales (Blockchain)</p>
          <p className="text-4xl font-black text-[#1A1A2E] mt-2 tracking-tighter">${finanzas.ingresos.toLocaleString('es-CL')}</p>
          <TrendingUp size={80} className="absolute right-0 bottom-0 -mb-4 -mr-4 text-emerald-50 opacity-50" />
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-purple-100 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Egresos Ejecutados</p>
          <p className="text-4xl font-black text-red-600 mt-2 tracking-tighter">${finanzas.egresos.toLocaleString('es-CL')}</p>
          <TrendingDown size={80} className="absolute right-0 bottom-0 -mb-4 -mr-4 text-red-50 opacity-50" />
        </div>
        <div className="bg-[#1A1A2E] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group text-white border border-white/5">
          <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-widest">Saldo en Arcas</p>
          <p className="text-4xl font-black mt-2 tracking-tighter">${finanzas.balanceFinal.toLocaleString('es-CL')}</p>
          <Wallet size={80} className="absolute right-0 bottom-0 -mb-4 -mr-4 text-[#FF8FAB] opacity-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ÚLTIMOS REPORTES */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-purple-50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-purple-50 bg-purple-50/10">
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic flex items-center gap-3">
              <FileText className="text-purple-500" /> Últimos Reportes CEAL
            </h3>
          </div>
          <div className="p-8 space-y-4 flex-1 overflow-y-auto max-h-80">
            {reportes.length > 0 ? reportes.map((doc, i) => (
              <a key={i} href={doc.URL_ARCHIVO} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg text-purple-500 shadow-sm"><FileText size={18} /></div>
                  <div>
                    <p className="text-xs font-black text-[#1A1A2E] uppercase">{doc.TITULO}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.TIPO_DOCUMENTO}</p>
                  </div>
                </div>
                <Download size={16} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </a>
            )) : (
              <div className="text-center py-10 text-slate-300 font-bold italic uppercase text-[10px]">Sin reportes registrados</div>
            )}
          </div>
        </section>

        {/* ÚLTIMAS TRANSACCIONES */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-purple-50 overflow-hidden">
          <div className="p-8 border-b border-purple-50 bg-purple-50/10">
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic flex items-center gap-3">
              <LayoutGrid className="text-purple-500" /> Registro Inmutable (Ingresos)
            </h3>
          </div>
          <div className="p-8 space-y-4 max-h-80 overflow-y-auto">
            {transacciones.length > 0 ? transacciones.slice(0, 5).map((t, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="text-[8px] font-black px-3 py-1 bg-white rounded-full text-purple-600 border border-purple-100 uppercase">{t.METODO_PAGO}</div>
                  <p className="text-xs font-bold text-[#1A1A2E]">Folio TX-{t.TRANSACCION_ID}</p>
                </div>
                <p className="font-black text-emerald-600">+ ${Number(t.MONTO_PAGO).toLocaleString('es-CL')}</p>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-300 font-bold italic uppercase text-[10px]">Sin movimientos recientes</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}