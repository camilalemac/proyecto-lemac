"use client"
import React, { useState, useEffect } from "react"
import { ShieldCheck, Wallet, TrendingUp, Star, Heart, ArrowRight, Loader2, AlertCircle, Users, PieChart, Receipt } from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA
import { authService } from "../../../services/authService"
import { pagosService } from "../../../services/pagosService"
import { academicoService } from "../../../services/academicoService"
import { IPupilo } from "../../../types/admin.types"
import { formatCurrencyCLP } from "../../../utils/formatters"

export default function ApoderadoDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resumen, setResumen] = useState({ totalPendiente: 0, totalPagado: 0 })
  const [pupilos, setPupilos] = useState<IPupilo[]>([])

  useEffect(() => {
    const initDashboard = async () => {
      const token = Cookies.get("auth-token")
      
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const [perfil, dataPagos, dataHijos] = await Promise.all([
          authService.getMe(),
          pagosService.getMisCuotasResumen(),
          academicoService.getMisHijos()
        ])

        // 🛡️ BUSCADOR DE ROLES INTELIGENTE (100% TypeScript, cero 'any')
        const data = perfil as {
          role?: string;
          rol?: string;
          roles?: Array<{ rol_code: string }>;
        };

        let rolesEncontrados = "";

        if (data.role) rolesEncontrados += data.role;
        if (data.rol) rolesEncontrados += data.rol;
        
        // Si viene la lista de la imagen, extraemos los códigos
        if (data.roles && Array.isArray(data.roles)) {
          rolesEncontrados += data.roles.map((r) => r.rol_code).join(",");
        }

        const cargoFinal = rolesEncontrados.toUpperCase();
        console.log("🚀 ROL DETECTADO REAL:", cargoFinal);

        // Verificamos si existe "APO" o "APD" en cualquiera de esos campos
        if (!cargoFinal.includes("APO") && !cargoFinal.includes("APD")) {
          router.push("/dashboard/alumno"); 
          return;
        }

        setResumen({
          totalPendiente: dataPagos.totalPendiente || 0,
          totalPagado: dataPagos.totalPagado || 0
        })
        setPupilos(dataHijos)

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error de sincronización";
        console.error("Error cargando dashboard apoderado:", message);
        setErrorMsg("Error de sincronización con el servidor central.");
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [router])

  if (loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 text-center">
        Conectando con el Nodo Central Lemac...
      </p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER SUPERIOR CON BLOCKCHAIN PING */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-[#1A1A2E] rounded-3xl text-[#FF8FAB] shadow-lg"><ShieldCheck size={28} /></div>
           <div>
             <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">Portal Familiar</h1>
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1 italic">Gestión de Cargas e Inversión Educativa</p>
           </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col xl:items-end relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full animate-ping m-2" />
           <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Pasarela Transaccional</p>
           <p className="text-xs font-bold text-amber-700">Operación Protegida por Oracle Blockchain</p>
        </div>
      </header>

      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-100">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm border-b-4 border-b-rose-400 relative overflow-hidden group">
          <div className="absolute right-[-5%] top-[-5%] text-rose-50 opacity-50 group-hover:scale-110 transition-transform"><Wallet size={120}/></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Deuda Global Familiar</p>
          <h3 className="text-4xl font-black text-[#1A1A2E] tracking-tighter relative z-10">{formatCurrencyCLP(resumen.totalPendiente)}</h3>
          <Link href="/dashboard/apoderado/cuotas" className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors relative z-10 shadow-md">
            Pagar Cuotas <ArrowRight size={14}/>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm border-b-4 border-b-emerald-400 relative overflow-hidden group">
          <div className="absolute right-[-5%] top-[-5%] text-emerald-50 opacity-50 group-hover:scale-110 transition-transform"><TrendingUp size={120}/></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Inversión Realizada</p>
          <h3 className="text-4xl font-black text-[#1A1A2E] tracking-tighter relative z-10">{formatCurrencyCLP(resumen.totalPagado)}</h3>
          <Link href="/dashboard/apoderado/historial" className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors relative z-10">
            <Receipt size={14}/> Ver Historial
          </Link>
        </div>

        <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between group">
          <Star className="absolute right-4 top-4 text-[#FF8FAB] opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Aporte Voluntario</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Bono Cooperación Lemac</p>
          </div>
          <Link href="/dashboard/apoderado/cuotas" className="block mt-4">
            <button className="w-full bg-[#FF8FAB] text-[#1A1A2E] font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white transition-colors shadow-lg">
              Donar Ahora
            </button>
          </Link>
        </div>
      </div>

      {/* BANNER DE TRANSPARENCIA */}
      <div className="bg-[#FAF5FF] p-8 rounded-[3.5rem] border border-[#FF8FAB]/20 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl text-[#FF8FAB] shadow-sm"><PieChart size={24} /></div>
            <div>
              <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Visualización de Gastos</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Consulta en qué se invierten los fondos recaudados.</p>
            </div>
         </div>
         <Link href="/dashboard/apoderado/gastos" className="bg-white text-[#1A1A2E] px-6 py-3 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-[#1A1A2E] hover:text-white transition-colors">
            Ver Gráficos
         </Link>
      </div>

      <section className="pt-4">
         <h2 className="text-xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3 mb-6 italic">
           <Users size={24} className="text-rose-400" /> Cargas Académicas Vigentes
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pupilos.length > 0 ? pupilos.map((hijo) => (
              <div key={hijo.ALUMNO_ID} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                 <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#FF8FAB]" />
                 <div className="flex justify-between items-start mb-6 pl-4">
                    <div className="bg-rose-50 p-4 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform"><Heart size={24} /></div>
                    <span className="bg-[#1A1A2E] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                      {hijo.TIPO_RELACION}
                    </span>
                 </div>
                 <div className="pl-4">
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Estudiante</p>
                    <h3 className="text-xl font-black text-[#1A1A2E] leading-tight uppercase">
                      {hijo.ALUMNO_NOMBRES} <br /> {hijo.ALUMNO_APELLIDOS}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                      RUT: {hijo.ALUMNO_RUT}-{hijo.ALUMNO_RUT_DV}
                    </p>
                 </div>
                 <Link href={`/dashboard/apoderado/cuotas?alumno=${hijo.ALUMNO_ID}`} className="mt-8 ml-4 w-full bg-slate-50 text-[#1A1A2E] py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1A1A2E] hover:text-white transition-colors border border-slate-100">
                    Estado de Cuenta <ArrowRight size={14} />
                 </Link>
              </div>
            )) : (
              <div className="col-span-full bg-white p-12 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col justify-center items-center opacity-30">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A2E]">No se detectan cargas académicas vinculadas</p>
              </div>
            )}
         </div>
      </section>
    </div>
  )
}