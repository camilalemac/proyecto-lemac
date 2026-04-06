"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function GraficoGastos({ categorias = [] }: { categorias: any[] }) {
  // Paleta EDUCA+: Azul Marino Profundo y variaciones de Rosa Pastel
  const COLORS = [
    '#0F172A', // Azul Marino Principal
    '#FF8FAB', // Rosa Pastel Principal
    '#334155', // Azul Slate (Neutro)
    '#FFC2D1', // Rosa Muy Claro
    '#1E293B'  // Marino Intenso
  ];

  if (!categorias || categorias.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center bg-[#FDF2F5] rounded-[3rem] border-2 border-dashed border-[#FF8FAB]/20">
        <p className="text-[10px] font-black text-[#FF8FAB] uppercase tracking-[0.2em]">
          Sin registros financieros en Oracle
        </p>
      </div>
    );
  }

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
                className="hover:opacity-80 transition-all duration-300 cursor-pointer"
              />
            ))}
          </Pie>
          
          <Tooltip 
            contentStyle={{ 
              borderRadius: '24px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
              fontSize: '11px', 
              fontWeight: '900',
              textTransform: 'uppercase',
              backgroundColor: '#FFFFFF',
              padding: '12px',
              color: '#0F172A' // Texto en azul marino
            }}
            itemStyle={{ color: '#0F172A' }}
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
              color: '#0F172A' // Leyenda en azul marino
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}