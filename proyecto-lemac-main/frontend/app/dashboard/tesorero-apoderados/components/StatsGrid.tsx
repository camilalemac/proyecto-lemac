"use client"
import { useMemo } from "react"
import { Wallet, TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react"

interface Cobro {
  ESTADO: "PAGADO" | "PENDIENTE" | "PARCIAL";
  MONTO_ORIGINAL: number;
  MONTO_PAGADO: number;
}

interface Cuenta {
  SALDO_ACTUAL: number;
  NOMBRE_CUENTA: string;
}

interface StatsGridProps {
  cuenta: Cuenta | null;
  cobros: Cobro[];
}

export default function StatsGrid({ cuenta, cobros = [] }: StatsGridProps) {
  
  // CÁLCULOS DINÁMICOS (Sin datos hardcoded)
  const stats = useMemo(() => {
    const saldoActual = Number(cuenta?.SALDO_ACTUAL || 0);
    
    // Morosidad: Diferencia real entre lo pactado y lo pagado
    const totalPendiente = cobros.reduce((acc, curr) => {
      const pendiente = Number(curr.MONTO_ORIGINAL) - Number(curr.MONTO_PAGADO);
      return acc + (pendiente > 0 ? pendiente : 0);
    }, 0);

    // Recaudación efectiva (Solo lo que ya entró a caja)
    const totalPagado = cobros.reduce((acc, curr) => acc + Number(curr.MONTO_PAGADO), 0);

    return {
      saldoActual,
      totalPendiente,
      totalPagado,
      proyectado: saldoActual + totalPendiente
    };
  }, [cuenta, cobros]);

  const formatCLP = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto);
  };

  const cards = [
    {
      title: "Saldo Disponible",
      value: formatCLP(stats.saldoActual),
      subtext: cuenta?.NOMBRE_CUENTA || "Sin cuenta vinculada",
      icon: <Wallet className="text-[#FF8FAB]" size={22} />,
      bg: "bg-[#FDF2F5]",
      border: "border-pink-100"
    },
    {
      title: "Recaudación Total",
      value: formatCLP(stats.totalPagado),
      subtext: "Efectivo ingresado",
      icon: <CheckCircle2 className="text-green-600" size={22} />,
      bg: "bg-green-50",
      border: "border-green-100"
    },
    {
      title: "Cuentas por Cobrar",
      value: formatCLP(stats.totalPendiente),
      subtext: "Morosidad de apoderados",
      icon: <AlertCircle className="text-amber-500" size={22} />,
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Balance Proyectado",
      value: formatCLP(stats.proyectado),
      subtext: "Meta final estimada",
      icon: <TrendingUp className="text-[#0F172A]" size={22} />,
      bg: "bg-slate-100",
      border: "border-slate-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-white p-8 rounded-[2.5rem] border ${card.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
        >
          {/* Indicador visual de esquina */}
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-slate-300" />
          </div>

          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${card.bg} transition-transform duration-500 group-hover:rotate-10`}>
              {card.icon}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Live Data</span>
              <div className="h-1 w-8 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#FF8FAB] animate-pulse w-full"></div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {card.title}
            </p>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter italic">
              {card.value}
            </h2>
            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#FF8FAB]"></span>
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}