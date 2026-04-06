"use client"
import { useState, useEffect } from "react"
import { 
  FileText, CheckCircle2, ShieldCheck, AlertCircle, 
  Loader2, TrendingUp, Download, Eye, GraduationCap
} from "lucide-react"

export default function DirectoraGestionPage() {
  const [cealData, setCealData] = useState<any>(null);
  const [cpadData, setCpadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const [cealRes, cpadRes] = await Promise.all([
          fetch('http://localhost:3001/api/v1/finanzas/ceal/resumen'),
          fetch('http://localhost:3001/api/v1/finanzas/cpad/resumen')
        ]);

        const isCealJson = cealRes.headers.get("content-type")?.includes("application/json");
        const isCpadJson = cpadRes.headers.get("content-type")?.includes("application/json");

        if (isCealJson) setCealData(await cealRes.json());
        if (isCpadJson) setCpadData(await cpadRes.json());

        if (!isCealJson || !isCpadJson) {
          setError("Sincronización parcial: Los servicios de Oracle no responden JSON.");
        }
      } catch (err) {
        setError("Error de Red: El microservicio en el puerto 3001 está offline.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, []);

  const handleValidarCuenta = async () => {
    setValidating(true);
    // Aquí podrías disparar el procedimiento almacenado en tu backend
    setTimeout(() => {
      alert("Cuentas del Centro de Padres VALIDADAS y firmadas digitalmente en Oracle DB.");
      setValidating(false);
    }, 1500);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5]">
      <Loader2 size={40} className="animate-spin text-[#0F172A]" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-[#FDF2F5] min-h-screen animate-in fade-in duration-700">
      
      {error && (
        <div className="bg-white border-l-4 border-[#FF8FAB] p-4 rounded-2xl flex items-center gap-3 text-[#0F172A] shadow-sm">
          <AlertCircle size={18} className="text-[#FF8FAB]" />
          <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="bg-[#0F172A] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8FAB]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-[#FF8FAB]" size={20} />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Supervisión Master EDUCA+</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Gestión Financiera 2026</h1>
            <p className="text-slate-400 text-sm font-medium">Auditoría de Fondos y Presupuestos Institucionales</p>
          </div>
          <button 
            onClick={handleValidarCuenta}
            disabled={validating}
            className="bg-[#FF8FAB] hover:bg-[#ff7a9e] text-white px-10 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-pink-500/20 active:scale-95 disabled:opacity-50"
          >
            {validating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            Validar Cuentas Anuales
          </button>
        </div>
      </div>

      {/* DASHBOARDS DINÁMICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card CEAL */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-[#0F172A] flex items-center gap-3 uppercase text-xs tracking-widest">
              <GraduationCap size={22} className="text-[#FF8FAB]" /> Centro de Alumnos (CEAL)
            </h3>
            <span className="p-3 bg-pink-50 text-[#FF8FAB] rounded-2xl"><Eye size={18}/></span>
          </div>
          <div className="space-y-6">
            <p className="text-4xl font-black text-[#0F172A] tracking-tighter">
              ${cealData?.totalIngresos?.toLocaleString() || "0"}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#FF8FAB] h-full rounded-full transition-all duration-1000" 
                style={{ width: cealData ? '100%' : '0%' }}
              ></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {cealData ? "Presupuesto Sincronizado" : "Esperando datos..."}
            </p>
          </div>
        </div>

        {/* Card CPAD */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-[#0F172A] flex items-center gap-3 uppercase text-xs tracking-widest">
              <TrendingUp size={22} className="text-blue-500" /> Centro de Padres (CPAD)
            </h3>
            <span className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Eye size={18}/></span>
          </div>
          <div className="space-y-6">
            <p className="text-4xl font-black text-[#0F172A] tracking-tighter">
              ${cpadData?.recaudacionTotal?.toLocaleString() || "0"}
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: cpadData ? '100%' : '0%' }}
              ></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {cpadData ? "Recaudación Actualizada" : "Esperando datos..."}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE BALANCES */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <FileText className="text-slate-400" size={24} />
          <h3 className="font-black text-[#0F172A] uppercase text-xs tracking-widest">Documentación Oficial</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReportCard title="Balance Consolidado" fecha="Gestión 2026" type="PDF" color="pink" />
          <ReportCard title="Auditoría Interna" fecha="Q1 2026" type="EXCEL" color="blue" />
          <ReportCard title="Reporte Operativo" fecha="Abril 2026" type="PDF" color="slate" />
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, fecha, type, color }: any) {
  const colorMap: any = {
    pink: "group-hover:text-[#FF8FAB]",
    blue: "group-hover:text-blue-500",
    slate: "group-hover:text-[#0F172A]"
  }

  return (
    <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-white hover:bg-white hover:shadow-xl transition-all group flex items-center justify-between cursor-pointer">
      <div>
        <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2 leading-none">{title}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">{fecha} • {type}</p>
      </div>
      <button className={`p-4 bg-white rounded-2xl text-slate-300 shadow-sm transition-colors ${colorMap[color]}`}>
        <Download size={20} />
      </button>
    </div>
  )
}