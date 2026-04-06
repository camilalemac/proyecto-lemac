"use client"
import { Check, X, ShieldCheck, Banknote, AlertCircle } from "lucide-react"

export default function ValidacionCuentas({ cuentas = [], onRefresh }: { cuentas: any[], onRefresh: () => void }) {
  
  // Conexión real al microservicio de Pagos (Puerto 3002)
  const handleValidar = async (id: number, nuevoEstado: 'APROBADA' | 'RECHAZADA') => {
    try {
      const response = await fetch(`http://127.0.0.1:3002/api/v1/pagos/cuentas-bancarias/${id}/validar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (response.ok) {
        onRefresh(); // Gatilla la recarga de datos en el dashboard principal
      }
    } catch (error) {
      console.error("Error en la validación de cuenta:", error);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#0F172A] p-2.5 rounded-xl text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.2em]">
            Validación de Cuentas Oficiales
          </span>
        </div>
        <span className="text-[9px] font-black bg-[#FDF2F5] text-[#FF8FAB] px-3 py-1.5 rounded-full uppercase tracking-widest">
          Pendientes: {cuentas.length}
        </span>
      </div>
      
      {cuentas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <AlertCircle className="text-slate-200 mb-3" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            No hay cuentas por auditar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cuentas.map((c: any) => (
            <div 
              key={c.CUENTA_ID} 
              className="group flex justify-between items-center p-6 bg-white border border-slate-50 rounded-4xl hover:border-[#FF8FAB]/20 hover:shadow-md transition-all duration-500"
            >
              <div className="flex items-center gap-5">
                <div className="bg-slate-50 p-4 rounded-2xl text-[#0F172A] group-hover:bg-[#FDF2F5] group-hover:text-[#FF8FAB] transition-colors">
                  <Banknote size={22} />
                </div>
                <div>
                  <p className="text-xs font-black text-[#0F172A] uppercase tracking-tight">
                    {c.BANCO}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      N°: {c.NUMERO_CUENTA}
                    </p>
                    <span className="text-[9px] text-[#FF8FAB] font-black uppercase tracking-tighter">
                      • {c.TIPO_CUENTA}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleValidar(c.CUENTA_ID, 'APROBADA')} 
                  className="bg-slate-50 text-slate-400 p-3 rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all shadow-sm active:scale-95"
                  title="Aprobar Cuenta"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => handleValidar(c.CUENTA_ID, 'RECHAZADA')} 
                  className="bg-slate-50 text-slate-400 p-3 rounded-2xl hover:bg-[#FF8FAB] hover:text-white transition-all shadow-sm active:scale-95"
                  title="Rechazar Cuenta"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}