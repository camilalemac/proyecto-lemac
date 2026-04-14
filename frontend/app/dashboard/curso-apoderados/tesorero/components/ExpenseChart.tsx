"use client"
import { BarChart3, PieChart, Layers, TrendingUp } from "lucide-react"

export default function ExpenseChart({ categorias }: { categorias: any[] }) {
  // Limitamos a las 5 categorías principales para mantener la limpieza visual
  const displayCategories = categorias.slice(0, 5);

  return (
    <section className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-sm h-full flex flex-col justify-between animate-in fade-in duration-1000">
      
      {/* Encabezado del Componente */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-tighter flex items-center gap-3">
            <div className="bg-[#FDF2F5] p-2.5 rounded-2xl text-[#FF8FAB] shadow-sm">
              <BarChart3 size={20} />
            </div>
            Distribución de Gastos
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 ml-1">
            Análisis por categoría configurada
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Layers className="text-slate-200" size={18} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
        
        {/* Lado Izquierdo: Visualización de Datos Reales */}
        <div className="lg:col-span-3 space-y-10">
          {displayCategories.length > 0 ? (
            displayCategories.map((cat, index) => (
              <div key={cat.CATEGORIA_ID} className="group">
                <div className="flex justify-between items-end text-[10px] font-black uppercase mb-3 tracking-widest">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">0{index + 1}</span>
                    <span className="text-[#0F172A] group-hover:text-[#FF8FAB] transition-colors">
                      {cat.NOMBRE}
                    </span>
                  </div>
                  <span className="text-slate-300 font-mono italic">
                    ID: {cat.CATEGORIA_ID}
                  </span>
                </div>
                
                <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden p-0.75 border border-slate-100/50">
                  {/* El ancho se distribuye visualmente para mostrar jerarquía */}
                  <div 
                    className="bg-[#FF8FAB] h-full rounded-full transition-all duration-1000 ease-out shadow-[4px_0_12px_rgba(255,143,171,0.4)]"
                    style={{ 
                      width: `${100 - (index * 12)}%`,
                      opacity: 1 - (index * 0.1) 
                    }} 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-4 border-dashed border-slate-50 rounded-[3rem] flex flex-col items-center gap-4">
              <TrendingUp size={32} className="text-slate-100" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                Esperando datos de Oracle...
              </p>
            </div>
          )}
        </div>

        {/* Lado Derecho: Widget de Resumen Lemac */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-[3.5rem] p-10 flex flex-col justify-center items-center text-center shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] relative overflow-hidden group">
          
          {/* Efectos de Iluminación Soft */}
          <div className="absolute -top-10 -left-10 bg-[#FF8FAB] w-32 h-32 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
          <div className="absolute -bottom-10 -right-10 bg-[#FF8FAB] w-32 h-32 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
          
          <div className="relative z-10 w-full">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6">
              Total Activas
            </p>
            
            <div className="relative inline-block">
              <p className="text-7xl font-black text-white italic tracking-tighter leading-none mb-2">
                {categorias.length}
              </p>
              <div className="absolute -right-4 top-0 w-2 h-2 bg-[#FF8FAB] rounded-full animate-ping" />
            </div>

            <div className="h-px w-12 bg-white/10 mx-auto my-6" />

            <div className="space-y-2">
              <p className="text-[8px] font-black text-[#FF8FAB] uppercase tracking-widest">
                Categorías Registradas
              </p>
              <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <PieChart size={10} /> Sincronización Exitosa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pie del Gráfico */}
      <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Oracle Cloud Infrastructure • Proyecto Lemac
        </p>
        <div className="flex gap-1">
          {[1,2,3].map(i => (
            <div key={i} className="w-1 h-1 bg-slate-100 rounded-full" />
          ))}
        </div>
      </div>
    </section>
  )
}