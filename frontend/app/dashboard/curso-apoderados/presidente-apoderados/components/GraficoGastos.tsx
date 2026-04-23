"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react' // Alias para que no choque con el de recharts

// 1. Tipado estricto para asegurar estabilidad
interface CategoriaGasto {
  nombre: string;
  monto: number;
  porcentaje?: number;
}

export default function GraficoGastos({ categorias = [] }: { categorias: CategoriaGasto[] }) {
  // Paleta EDUCA+: Azul Marino Profundo y variaciones de Rosa Pastel
  const COLORS = [
    '#0F172A', // Azul Marino Principal
    '#FF8FAB', // Rosa Pastel Principal
    '#334155', // Azul Slate (Neutro)
    '#FFC2D1', // Rosa Muy Claro
    '#1E293B'  // Marino Intenso
  ];

  // ESTADO VACÍO
  if (!categorias || categorias.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center bg-[#FDF2F5] rounded-[3rem] border-2 border-dashed border-[#FF8FAB]/30 animate-in fade-in">
        <PieChartIcon className="text-[#FF8FAB]/40 mb-3" size={48} strokeWidth={1.5} />
        <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em] px-6 text-center">
          Sin registros financieros en Oracle DB
        </p>
      </div>
    );
  }

  // GRÁFICO DONUT
  return (
    <div className="h-80 w-full animate-in zoom-in-95 duration-700">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categorias}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={95}
            paddingAngle={10}
            dataKey="monto"
            nameKey="nombre"
            stroke="none"
          >
            {categorias.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-80 transition-all duration-300 cursor-pointer outline-none"
              />
            ))}
          </Pie>
          
          <Tooltip 
            // 2. Formateador para mostrar el dinero como CLP ($)
            formatter={(value: any) => [`$${Number(value).toLocaleString('es-CL')}`, 'Gasto']}
            contentStyle={{ 
              borderRadius: '24px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
              fontSize: '11px', 
              fontWeight: '900',
              textTransform: 'uppercase',
              backgroundColor: '#FFFFFF',
              padding: '12px 20px',
              color: '#0F172A' 
            }}
            itemStyle={{ color: '#FF8FAB', fontWeight: '900' }}
            cursor={{ fill: 'transparent' }}
          />
          
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle" 
            iconSize={10}
            wrapperStyle={{ 
              fontSize: '9px', 
              fontWeight: '900', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em',
              paddingTop: '30px',
              color: '#0F172A'
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}