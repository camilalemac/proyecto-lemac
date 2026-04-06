"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  PieChart, FileText, Download, Loader2, 
  PlusCircle, FileSpreadsheet, Send, LogOut, ShieldCheck
} from "lucide-react"
import Cookies from "js-cookie"

export default function TesoreroCpadPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    Cookies.remove("auth-token");
    router.push("/login");
  };

  // Función para ir a la página de nuevo registro
  const handleIrANuevoRegistro = () => {
    router.push('/dashboard/apoderado/tesorero-cpad/nuevo');
  };

  useEffect(() => {
    const fetchTesoreria = async () => {
      try {
        const token = Cookies.get("auth-token");
        const response = await fetch('http://localhost:3001/api/v1/finanzas/cpad/resumen', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Error de conexión con el servicio.");
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTesoreria();
  }, []);

  const handleGenerarReporte = (tipo: string) => {
    alert(`Generando Reporte ${tipo} y sincronizando con Oracle DB...`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF2F5] gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} />
      <p className="text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest">Cargando Tesorería...</p>
    </div>
  );

  const recaudacion = data?.recaudacionTotal || 0;
  const egresos = data?.totalEgresos || 0;
  const porCobrar = data?.porCobrar || 0;
  const disponible = recaudacion - egresos;

  return (
    <div className="p-4 lg:p-8 bg-[#FDF2F5] min-h-screen animate-in fade-in duration-500">
      
      {/* HEADER ESTILO LEMAC */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-pink-100">
        <div className="flex items-center gap-6">
          <div className="bg-[#1A1A2E] p-4 rounded-3xl shadow-lg">
            <ShieldCheck className="text-[#FF8FAB]" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Tesorería General</h1>
            <p className="text-[#FF8FAB] font-bold text-xs uppercase tracking-widest mt-1">Panel de Control CPAD</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* BOTÓN ACTUALIZADO PARA REDIRIGIR */}
          <button 
            onClick={handleIrANuevoRegistro}
            className="flex items-center gap-2 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <PlusCircle size={16} /> Nuevo Registro
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-red-500 border-2 border-red-50 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* MÉTRICAS CRÍTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Recaudación Total" value={recaudacion} color="text-[#1A1A2E]" />
        <StatCard title="Pendiente Cobro" value={porCobrar} color="text-orange-500" />
        <StatCard title="Egresos Totales" value={egresos} color="text-red-500" />
        <StatCard title="Caja Disponible" value={disponible} color="text-emerald-600" isHighlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REPORTES */}
        <div className="bg-white p-8 rounded-[3.5rem] border border-pink-50 shadow-sm">
          <h3 className="font-black text-[#1A1A2E] text-lg mb-6 flex items-center gap-3 uppercase tracking-tighter">
            <FileSpreadsheet size={22} className="text-[#FF8FAB]" /> Reportes
          </h3>
          <div className="space-y-4">
            <ReportAction title="Cierre Mensual" desc="Marzo 2026" icon={<Send size={16}/>} onClick={() => handleGenerarReporte('Mensual')} />
            <ReportAction title="Balance Q1" desc="Enero - Marzo" icon={<FileText size={16}/>} onClick={() => handleGenerarReporte('Trimestral')} />
            <ReportAction title="Consolidado Anual" desc="Ejercicio 2026" icon={<Download size={16}/>} onClick={() => handleGenerarReporte('Anual')} />
          </div>
        </div>

        {/* DASHBOARD DE GASTOS */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-pink-50 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-1/4 w-1.5 h-1/2 bg-[#FF8FAB] rounded-r-full" />
          <h3 className="font-black text-[#1A1A2E] text-lg mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <PieChart size={22} className="text-[#FF8FAB]" /> Distribución de Gastos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {data?.categorias?.length > 0 ? (
                data.categorias.map((cat: any, i: number) => (
                  <div key={i} className="group">
                    <div className="flex justify-between text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest">
                      <span>{cat.nombre}</span>
                      <span className="text-[#1A1A2E]">${cat.monto.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-[#FF8FAB] h-full transition-all duration-1000 group-hover:bg-[#1A1A2E]" style={{ width: `${cat.porcentaje}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-gray-400 italic">No hay categorías registradas.</p>
              )}
            </div>
            
            <div className="flex items-center justify-center bg-[#FDF2F5] rounded-[3rem] p-8">
               <div className="text-center">
                 <p className="text-5xl font-black text-[#1A1A2E] leading-none">{data?.cuotasPagadas || 0}</p>
                 <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-[0.2em] mt-2">Apoderados al día</p>
                 <div className="mt-6 inline-block px-4 py-2 bg-[#1A1A2E] rounded-2xl text-[9px] text-white font-black uppercase tracking-widest shadow-md">
                   Sincronizado Oracle ✅
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// COMPONENTES AUXILIARES
function StatCard({ title, value, color, isHighlight = false }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-transform hover:scale-105 ${isHighlight ? 'bg-[#1A1A2E] border-[#1A1A2E]' : 'bg-white border-pink-50'}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isHighlight ? 'text-[#FF8FAB]' : 'text-gray-400'}`}>{title}</p>
      <p className={`text-3xl font-black ${isHighlight ? 'text-white' : color}`}>${value.toLocaleString('es-CL')}</p>
    </div>
  )
}

function ReportAction({ title, desc, icon, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-[#FDF2F5] rounded-3xl hover:bg-[#FF8FAB] hover:text-white transition-all group border border-pink-100/50">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl text-[#1A1A2E] group-hover:scale-110 transition-transform shadow-sm">{icon}</div>
        <div className="text-left">
          <p className="text-[11px] font-black uppercase tracking-tighter leading-none">{title}</p>
          <p className="text-[9px] font-bold opacity-60 mt-1">{desc}</p>
        </div>
      </div>
    </button>
  )
}