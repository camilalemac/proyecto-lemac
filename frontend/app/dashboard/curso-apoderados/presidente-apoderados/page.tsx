"use client"
import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, PieChart, TrendingDown, 
  Loader2, ServerOff, Filter, BarChart2
} from "lucide-react"
import Cookies from "js-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PresidenteCpadGastosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conexionBackend, setConexionBackend] = useState(true);
  
  // Estados para los datos 100% reales
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<{nombre: string, monto: number, porcentaje: number}[]>([]);

  useEffect(() => {
    const fetchGastosData = async () => {
      try {
        const token = Cookies.get("auth-token");
        
        // 🔴 CORRECCIÓN DEL ERROR DE TYPESCRIPT DE TU CAPTURA:
        // Declaramos explícitamente el tipo de los headers para que TypeScript no arroje error.
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          throw new Error("Sin token de autenticación");
        }

        // Consumimos el historial de movimientos de caja (MS_PAGOS)
        const resMovimientos = await fetch("http://127.0.0.1:3007/api/v1/pagos/movimientos-caja", { 
          method: "GET",
          headers: headers 
        });
        
        if (!resMovimientos.ok) throw new Error("Backend Desconectado");
        
        const jsonMovimientos = await resMovimientos.json();

        if (jsonMovimientos.success && jsonMovimientos.data) {
          // Filtramos SOLO los egresos de Oracle DB
          const egresos = jsonMovimientos.data.filter((m: any) => m.TIPO_MOVIMIENTO === "EGRESO" || m.tipoMovimiento === "EGRESO");
          
          let sumaTotal = 0;
          const agrupacion: Record<string, number> = {};

          // Agrupamos los montos por ID o Nombre de Categoría
          egresos.forEach((gasto: any) => {
            const monto = Number(gasto.MONTO || gasto.monto || 0);
            const categoria = gasto.Categoria?.nombre || gasto.categoria_nombre || `Categoría ID: ${gasto.CATEGORIA_ID || gasto.categoriaId || "Desconocida"}`;
            
            sumaTotal += monto;
            if (agrupacion[categoria]) {
              agrupacion[categoria] += monto;
            } else {
              agrupacion[categoria] = monto;
            }
          });

          setTotalEgresos(sumaTotal);

          // Convertimos el objeto en array y sacamos el porcentaje real
          const arrayCategorias = Object.keys(agrupacion).map(cat => ({
            nombre: cat,
            monto: agrupacion[cat],
            porcentaje: sumaTotal > 0 ? Math.round((agrupacion[cat] / sumaTotal) * 100) : 0
          })).sort((a, b) => b.monto - a.monto); // Orden de mayor a menor gasto

          setGastosPorCategoria(arrayCategorias);
        }
        setConexionBackend(true);

      } catch (e: any) {
        setConexionBackend(false);
        setTotalEgresos(0);
        setGastosPorCategoria([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGastosData();
  }, []);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calculando Distribución desde Oracle...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10 bg-[#FDF2F5] min-h-screen p-8">
      
      {/* ALERTA DESCONEXIÓN */}
      {!conexionBackend && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
          <ServerOff size={16} /> Interfaz sin conexión a MS_PAGOS. No se pueden cargar los datos.
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <button 
        onClick={() => router.push("/dashboard/presidente-apoderado")}
        className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al Panel
      </button>

      {/* HEADER DE LA VISTA */}
      <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <PieChart size={250} className="absolute -right-10 -bottom-10 text-pink-50 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-[#0F172A] p-6 rounded-4xl text-[#FF8FAB] shadow-2xl">
            <TrendingDown size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none">Análisis de Gastos</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Auditoría Analítica del Centro de Padres</p>
          </div>
        </div>

        <div className="relative z-10 bg-slate-50 px-10 py-6 rounded-[2.5rem] border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Total Histórico Egresos</p>
          <p className="text-3xl font-black text-rose-500 tracking-tighter text-center">${totalEgresos.toLocaleString('es-CL')}</p>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 relative z-10">
        
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-3">
            <BarChart2 className="text-[#FF8FAB]" /> Distribución por Categoría
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-2 rounded-xl">
            <Filter size={14} /> Filtro Activo: Todos los Egresos
          </div>
        </div>

        {gastosPorCategoria.length > 0 ? (
          <div className="space-y-8">
            {gastosPorCategoria.map((categoria, index) => {
              // Paleta de colores para las barras orientadas al estilo Navy/Pink
              const colores = ["bg-[#0F172A]", "bg-[#FF8FAB]", "bg-blue-400", "bg-rose-400"];
              const colorBarra = colores[index % colores.length];

              return (
                <div key={index} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight">{categoria.nombre}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{categoria.porcentaje}% del Total Gastado</p>
                    </div>
                    <p className="text-lg font-black text-[#0F172A] group-hover:text-[#FF8FAB] transition-colors">
                      ${categoria.monto.toLocaleString('es-CL')}
                    </p>
                  </div>
                  {/* Barra de progreso */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${colorBarra}`} 
                      style={{ width: `${categoria.porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <PieChart size={80} className="mb-6 text-[#0F172A]" />
            <p className="text-sm font-black uppercase tracking-widest text-[#0F172A]">No hay egresos registrados</p>
            <p className="text-xs font-bold text-slate-500 mt-2 text-center max-w-md">La base de datos actual de Oracle no posee movimientos de caja categorizados como "EGRESO".</p>
          </div>
        )}
      </div>

    </div>
  )
}