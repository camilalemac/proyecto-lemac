"use client"
import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { PieChart as PieIcon, TrendingUp } from "lucide-react"

interface Categoria {
  CATEGORIA_ID: number;
  NOMBRE: string;
}

interface Movimiento {
  TIPO_MOVIMIENTO: "INGRESO" | "EGRESO";
  MONTO: number;
  CATEGORIA_ID?: number; // Relación con la categoría
}

interface ExpenseChartProps {
  categorias: Categoria[];
  movimientos: Movimiento[]; // Agregamos movimientos para calcular datos reales
}

export default function ExpenseChart({ categorias, movimientos = [] }: ExpenseChartProps) {
  
  // CÁLCULO EN TIEMPO REAL: Agrupar montos por categoría
  const chartData = useMemo(() => {
    if (!categorias.length || !movimientos.length) return [];

    return categorias.map(cat => {
      // Sumar solo los movimientos de tipo EGRESO que pertenezcan a esta categoría
      const total = movimientos
        .filter(m => m.TIPO_MOVIMIENTO === "EGRESO" && Number(m.CATEGORIA_ID) === cat.CATEGORIA_ID)
        .reduce((sum, m) => sum + Number(m.MONTO), 0);

      return {
        name: cat.NOMBRE,
        value: total
      };
    }).filter(data => data.value > 0); // Solo mostrar categorías que tengan gastos
  }, [categorias, movimientos]);

  // Colores Lemac: Navy, Pink y variantes para contraste
  const COLORS = ["#0F172A", "#FF8FAB", "#334155", "#FFC2D1", "#64748b"];

  const formatCLP = (value: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  // Calcular total de gastos para el indicador de abajo
  const totalGastos = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm flex flex-col h-full min-h-112.5 transition-all hover:shadow-xl hover:shadow-slate-100">
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PieIcon size={14} className="text-[#FF8FAB]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Análisis de Salidas
            </h3>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] uppercase italic tracking-tighter">
            Distribución <span className="text-[#FF8FAB]">Real</span>
          </h2>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={10}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
                    className="outline-none hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCLP(value as number)}
                contentStyle={{
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#fff',
                  padding: '12px 20px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase'
                }}
                itemStyle={{ color: '#FF8FAB' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="rect"
                formatter={(value) => (
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-20">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
              No hay egresos registrados para graficar
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-green-500" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Total Gastado
          </span>
        </div>
        <span className="text-sm font-black text-[#0F172A] uppercase italic">
          {formatCLP(totalGastos)}
        </span>
      </div>
    </div>
  );
}