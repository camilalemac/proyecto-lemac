"use client"
import { useState, useEffect } from "react"
import { 
  BarChart3, PieChart, ArrowUpCircle, ArrowDownCircle, 
  FileSpreadsheet, PlusCircle, Download, Loader2, 
  Wallet, Users, TrendingUp, CalendarDays, Receipt
} from "lucide-react"

export default function TesoreroPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulación de carga desde Microservicio de Finanzas (ms-finanzas)
  useEffect(() => {
    const fetchFinanzas = async () => {
      try {
        // En producción: fetch('http://localhost:3001/api/v1/finanzas/resumen')
        const mockData = {
          ingresos: 2450000,
          egresos: 850000,
          pendientesCount: 12,
          cuotasTotales: 45,
          cuotasPagadas: 33,
          categorias: [
            { nombre: "Eventos Escolares", monto: 450000, porcentaje: 52 },
            { nombre: "Materiales", monto: 200000, porcentaje: 23 },
            { nombre: "Mantenimiento", monto: 120000, porcentaje: 15 },
            { nombre: "Otros", monto: 80000, porcentaje: 10 },
          ]
        };
        setTimeout(() => { setData(mockData); setLoading(false); }, 1000);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchFinanzas();
  }, []);

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center text-blue-500 gap-4">
      <Loader2 size={48} className="animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando Estado Financiero...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER: ESTADO DE CUOTAS TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Ingresos Alumnos" 
          value={`$${data?.ingresos.toLocaleString()}`} 
          color="text-blue-600" 
          bg="bg-blue-50/50"
          icon={<ArrowUpCircle />} 
        />
        <StatCard 
          title="Egresos Totales" 
          value={`$${data?.egresos.toLocaleString()}`} 
          color="text-indigo-600" 
          bg="bg-indigo-50/50"
          icon={<ArrowDownCircle />} 
        />
        <StatCard 
          title="Cuotas al Día" 
          value={`${data?.cuotasPagadas}/${data?.cuotasTotales}`} 
          color="text-violet-600" 
          bg="bg-violet-50/50"
          icon={<Users />} 
          subtitle="Alumnos Pagados"
        />
        <StatCard 
          title="Balance Disponible" 
          value={`$${(data?.ingresos - data?.egresos).toLocaleString()}`} 
          color="text-cyan-600" 
          bg="bg-cyan-50/50"
          icon={<Wallet />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. DASHBOARD DE GASTOS Y CATEGORÍAS */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <PieChart size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Análisis de Gastos</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribución por categoría de egreso</p>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-100">
                <TrendingUp size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-600 uppercase">Período 2026</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Lista de Categorías */}
              <div className="space-y-6">
                {data?.categorias.map((cat: any, idx: number) => (
                  <CategoryRow 
                    key={idx}
                    label={cat.nombre} 
                    amount={`$${cat.monto.toLocaleString()}`} 
                    percent={cat.porcentaje} 
                    color={idx % 2 === 0 ? "bg-blue-500" : "bg-indigo-400"} 
                  />
                ))}
              </div>
              
              {/* Visualización Visual de Dashboard (Simulada) */}
              <div className="bg-slate-50 aspect-square rounded-full border-16 border-white shadow-inner flex flex-col items-center justify-center relative">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Gastado</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">${data?.egresos.toLocaleString()}</p>
                </div>
                {/* Decoración tipo Donut Chart */}
                <div className="absolute inset-0 border-12 border-blue-500/20 rounded-full border-t-blue-500"></div>
              </div>
            </div>
          </section>

          {/* TABLA RÁPIDA DE CUOTAS POR PAGAR */}
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <Receipt size={16} className="text-indigo-500" /> Cuotas por Cobrar (Alumnos)
             </h3>
             <div className="bg-indigo-50/30 p-4 rounded-2xl flex justify-between items-center border border-indigo-100/50">
               <p className="text-[11px] font-bold text-indigo-700">Hay {data?.pendientesCount} alumnos con mensualidad pendiente</p>
               <button className="text-[10px] font-black text-indigo-600 uppercase underline decoration-2 underline-offset-4">Ver Detalle</button>
             </div>
          </section>
        </div>

        {/* 3. GENERACIÓN DE REPORTES (Sidebar) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/10 w-fit p-4 rounded-2xl backdrop-blur-md mb-6">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-xl font-black mb-2">Emisión de Reportes</h3>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider opacity-80 leading-relaxed mb-8">
                Genera documentos oficiales para las reuniones de apoderados.
              </p>
              
              <div className="space-y-3">
                <ReportButton label="Reporte Mensual (Abril)" />
                <ReportButton label="Balance Trimestral" />
                <ReportButton label="Estado Anual 2026" isMain />
              </div>
            </div>
            <CalendarDays size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
          </div>

          <button className="w-full bg-white p-8 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-50 rounded-full group-hover:bg-blue-100 transition-colors">
                  <PlusCircle className="text-slate-400 group-hover:text-blue-600" size={28} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ingresar Nuevo Gasto</span>
              </div>
          </button>
        </aside>

      </div>
    </div>
  )
}

// Componentes Auxiliares con Estética Pastel
function StatCard({ title, value, color, bg, icon, subtitle }: any) {
  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:-translate-y-1 transition-all duration-300`}>
      <div className={`${bg} ${color} w-fit p-3 rounded-2xl mb-5 shadow-sm`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
      <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
      {subtitle && <p className="text-[9px] font-bold text-slate-400 mt-1 italic">{subtitle}</p>}
    </div>
  )
}

function CategoryRow({ label, amount, percent, color }: any) {
  return (
    <div className="group">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-2.5">
        <span className="text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
        <span className="text-slate-900">{amount}</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  )
}

function ReportButton({ label, isMain = false }: { label: string, isMain?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
      isMain 
      ? "bg-white text-blue-600 shadow-lg mt-4 hover:bg-blue-50" 
      : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
    }`}>
      {label}
      <Download size={14} strokeWidth={3} />
    </button>
  )
}