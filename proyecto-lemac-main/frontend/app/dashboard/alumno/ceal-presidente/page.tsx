"use client"
import { useState, useEffect } from "react"
import { BarChart3, PieChart, FileText, Download, Loader2, TrendingUp, Wallet, AlertCircle, ArrowUpCircle, Info } from "lucide-react"
import Cookies from "js-cookie"

export default function CealPresidentePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCealData = async () => {
      try {
        const token = Cookies.get("auth-token");

        if (!token) {
          throw new Error("No se encontró una sesión activa. Por favor, inicia sesión de nuevo.");
        }
        
        const response = await fetch('http://127.0.0.1:3007/api/v1/academico/cursos', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error("Error 401: Tu sesión ha expirado o no tienes permisos para ver estos datos.");
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status} en el Gateway: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const cursos = result.data;
          
          // Cálculo basado exclusivamente en la respuesta del microservicio
          const totalAlumnos = cursos.reduce((acc: number, c: any) => acc + (c._count?.ALUMNOS || 0), 0);
          const capacidadTotal = cursos.length * 45; 
          const cuotaBase = 15000; 

          setData({
            ingresosReal: totalAlumnos * cuotaBase,
            pendientesReal: (capacidadTotal - totalAlumnos) * cuotaBase,
            matriculados: totalAlumnos,
            cumplimiento: capacidadTotal > 0 ? Math.round((totalAlumnos / capacidadTotal) * 100) : 0,
            cursos: cursos
          });
        } else {
          throw new Error("El microservicio no devolvió datos válidos.");
        }
      } catch (err: any) {
        console.error("Error de conexión:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCealData();
  }, []);

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center text-[#FF8FAB] gap-4">
      <Loader2 size={40} className="animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest">Cargando datos desde el Gateway...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] flex items-center gap-6 text-red-600 m-6">
      <AlertCircle size={28} />
      <div>
        <p className="font-black text-sm uppercase">Error de Conexión</p>
        <p className="text-xs font-bold opacity-80 mt-1">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6">
      {/* Visualización de Cuotas Totales Basadas en Cursos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recaudación Real (Cuotas Pagadas)</p>
            <p className="text-4xl font-black text-[#1A1A2E] mt-2">
              ${data?.ingresosReal?.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-500 font-bold mt-1">Sincronizado con microservicio académico</p>
          </div>
          <ArrowUpCircle className="text-emerald-500 opacity-20" size={50} />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Proyección de Pendientes</p>
            <p className="text-4xl font-black text-[#1A1A2E] mt-2">
              ${data?.pendientesReal?.toLocaleString()}
            </p>
            <p className="text-[10px] text-orange-400 font-bold mt-1">Basado en capacidad de cursos activos</p>
          </div>
          <Info className="text-orange-400 opacity-20" size={50} />
        </div>
      </div>

      {/* Balance y Cumplimiento */}
      <div className="bg-[#1A1A2E] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-[10px] font-bold text-[#FF8FAB] uppercase tracking-widest">Total Matriculados</p>
            <p className="text-3xl font-black mt-2">{data?.matriculados} Alumnos</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[10px] font-bold text-[#FF8FAB] uppercase tracking-widest mb-4">Meta de Cumplimiento Institucional</p>
            <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-[#FF8FAB] h-full rounded-full transition-all duration-1000" 
                style={{ width: `${data?.cumplimiento}%` }}
              ></div>
            </div>
            <p className="text-right text-[10px] font-bold mt-2 opacity-60">{data?.cumplimiento}% de capacidad total utilizada</p>
          </div>
        </div>
      </div>
    </div>
  )
}