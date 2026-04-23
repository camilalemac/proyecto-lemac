"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Download, Wallet, LayoutGrid, Loader2, Crown, 
  ShieldCheck, Info, TrendingDown, TrendingUp, ShieldAlert 
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../services/authService"
import { pagosService } from "../../../../services/pagosService"
import { reporteService } from "../../../../services/reporteService"
import { formatCurrencyCLP } from "../../../../utils/formatters"

export default function CealPresidentePage() {
  const router = useRouter()
  const [transacciones, setTransacciones] = useState<any[]>([])
  const [reportes, setReportes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [finanzas, setFinanzas] = useState({
    ingresos: 0,
    egresos: 0,
    balanceFinal: 0,
  })

  useEffect(() => {
    const loadCealData = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        // 1. Validar Perfil y Rol a través del Servicio
        const perfil = await authService.getMe()
        
        // CORRECCIÓN PARA TYPESCRIPT: Acceso seguro a roles
        const roles = perfil.roles || [];
        
        // Verificación multirrol para directivas (CAL = Alumnos, CAP = Padres)
        const esDirectivo = roles.some((r: any) => 
          ['CEN_PRES_CAL', 'CEN_TES_CAL', 'DIR_PRES_ALU', 'CEN_PRES_CAP'].includes(r.rol_code)
        )

        if (!esDirectivo) {
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        setIsAuthorized(true)
        
        // Normalización del ID del Colegio (Soporte Oracle y Sequelize)
        const colId = perfil.colegioId || (perfil as any).COLEGIO_ID || 1

        // 2. Carga paralela de Finanzas y Reportes (Datos Reales del Backend)
        const [dataTrans, dataMov, dataDocs] = await Promise.all([
          pagosService.getHistorialPorColegio(colId),
          pagosService.getMovimientosByCuenta(1),
          reporteService.getReportes()
        ])

        // Calcular métricas basadas en los datos recibidos
        const totalI = dataTrans.reduce((acc: number, t: any) => acc + Number(t.MONTO_PAGO || 0), 0)
        const totalE = dataMov
          .filter((m: any) => m.TIPO_MOVIMIENTO === 'EGRESO')
          .reduce((acc: number, m: any) => acc + Number(m.MONTO || 0), 0)

        setTransacciones(dataTrans)
        setReportes(dataDocs)
        setFinanzas({
          ingresos: totalI,
          egresos: totalE,
          balanceFinal: totalI - totalE
        })

      } catch (err) {
        console.error("Error en Ledger CEAL:", err)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    loadCealData()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Sincronizando Nodo Central CEAL...</p>
    </div>
  )

  if (isAuthorized === false) return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl text-center">
      <ShieldAlert size={40} className="text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-2">Acceso Denegado</h2>
      <p className="text-slate-500 text-sm mb-8">Esta sección es exclusiva para la Directiva General verificada.</p>
      <button onClick={() => router.push('/dashboard/alumno')} className="text-xs font-black uppercase bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 transition-colors hover:bg-red-50">Volver</button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* BANNER DE PRESIDENCIA */}
      <div className="bg-white/70 backdrop-blur-xl border border-purple-100 rounded-[3rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="bg-linear-to-br from-purple-600 to-[#FF8FAB] p-5 rounded-4xl text-white shadow-2xl rotate-3">
            <Crown size={38} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tighter uppercase leading-none italic">Panel de Presidencia</h1>
            <p className="text-[11px] text-purple-400 font-bold uppercase tracking-[0.25em] mt-3 italic flex items-center gap-2">
              <ShieldCheck size={14} /> Gestión de Arcas CEAL 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-purple-600 bg-purple-50/50 px-6 py-3 rounded-2xl border border-purple-100 z-10 font-black text-[10px] uppercase tracking-widest">
          <Info size={18} className="animate-bounce" /> Ledger Inmutable Activo
        </div>
      </div>

      {/* MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ingresos Blockchain" amount={finanzas.ingresos} color="text-emerald-500" icon={<TrendingUp size={80} className="text-emerald-50" />} />
        <StatCard title="Egresos Ejecutados" amount={finanzas.egresos} color="text-red-500" icon={<TrendingDown size={80} className="text-red-50" />} />
        <StatCard title="Saldo Disponible" amount={finanzas.balanceFinal} color="text-[#FF8FAB]" isDark icon={<Wallet size={80} className="text-[#FF8FAB] opacity-10" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* REPORTES */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-purple-50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-purple-50 bg-purple-50/10">
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic flex items-center gap-3">
              <FileText className="text-purple-500" /> Archivo Documental
            </h3>
          </div>
          <div className="p-8 space-y-4 max-h-80 overflow-y-auto no-scrollbar">
            {reportes.length > 0 ? reportes.map((doc, i) => (
              <a key={i} href={doc.URL_ARCHIVO} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg text-purple-500 shadow-sm"><FileText size={18} /></div>
                  <div>
                    <p className="text-xs font-black text-[#1A1A2E] uppercase">{doc.TITULO || doc.titulo}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.TIPO_DOCUMENTO || doc.tipoDocumento}</p>
                  </div>
                </div>
                <Download size={16} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </a>
            )) : <p className="text-center text-slate-300 py-10 font-bold uppercase text-[10px]">Sin reportes registrados</p>}
          </div>
        </section>

        {/* ÚLTIMAS TRANSACCIONES */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-purple-50 overflow-hidden">
          <div className="p-8 border-b border-purple-50 bg-purple-50/10">
            <h3 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter italic flex items-center gap-3">
              <LayoutGrid className="text-purple-500" /> Auditoría de Ingresos
            </h3>
          </div>
          <div className="p-8 space-y-4 max-h-80 overflow-y-auto no-scrollbar">
            {transacciones.length > 0 ? transacciones.slice(0, 8).map((t, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="text-[8px] font-black px-3 py-1 bg-white rounded-full text-purple-600 border border-purple-100 uppercase">{t.METODO_PAGO}</div>
                  <p className="text-xs font-bold text-[#1A1A2E]">Folio #{t.TRANSACCION_ID}</p>
                </div>
                <p className="font-black text-emerald-600">{formatCurrencyCLP(t.MONTO_PAGO)}</p>
              </div>
            )) : <p className="text-center text-slate-300 py-10 font-bold uppercase text-[10px]">Sin movimientos recientes</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ title, amount, color, icon, isDark = false }: any) {
  return (
    <div className={`${isDark ? 'bg-[#1A1A2E] text-white' : 'bg-white text-[#1A1A2E]'} p-8 rounded-[3rem] border ${isDark ? 'border-white/5' : 'border-purple-100'} shadow-sm relative overflow-hidden group`}>
      <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{title}</p>
      <p className="text-4xl font-black mt-2 tracking-tighter">{formatCurrencyCLP(amount)}</p>
      <div className="absolute right-0 bottom-0 -mb-4 -mr-4">{icon}</div>
    </div>
  )
}