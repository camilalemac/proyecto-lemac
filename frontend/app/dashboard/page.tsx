import { Receipt } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">¡Hola de nuevo! 👋</h1>
        <p className="text-gray-500 mt-1">Aquí tienes el resumen de tus cuotas escolares.</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pendiente</p>
          <p className="text-3xl font-black text-gray-900 mt-2">$45.000</p>
        </div>
        
        {/* Próximo vencimiento con color Brand */}
        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Próximo Vencimiento</p>
          <p className="text-3xl font-black text-brand mt-2">05 Abr</p>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado Cuenta</p>
          <p className="text-3xl font-black text-green-500 mt-2">Al Día</p>
        </div>
      </div>

      {/* Placeholder para contenido futuro */}
      <div className="bg-white p-8 rounded-4xl border border-gray-100 border-dashed flex flex-col items-center justify-center text-gray-400 min-h-50">
        <Receipt size={48} className="mb-4 opacity-20" />
        <p className="font-medium">No hay cuotas pendientes para mostrar hoy.</p>
      </div>
    </div>
  )
}