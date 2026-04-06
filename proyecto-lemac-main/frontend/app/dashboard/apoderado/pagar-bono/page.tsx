"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, ShieldCheck, Star, Info, Loader2 } from 'lucide-react';

export default function PagarBonoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [montoBono, setMontoBono] = useState<number | null>(null);
  const [errorStatus, setErrorStatus] = useState(false);

  // Cargar el monto real desde el microservicio de pagos (ms-gateway -> ms-pagos)
  useEffect(() => {
    const fetchMonto = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/pagos/configuracion-bono');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.monto) {
          setMontoBono(data.monto);
          setErrorStatus(false);
        } else {
          throw new Error("Formato de datos inválido");
        }
      } catch (error) {
        console.error("Error cargando monto desde el backend:", error);
        setErrorStatus(true);
        setMontoBono(0); 
      }
    };
    fetchMonto();
  }, []);

  const handlePagoWebpay = async () => {
    if (!montoBono || montoBono <= 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3005/api/pagos/webpay/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: montoBono,
          buyOrder: `LEMAC-${Date.now()}`,
          sessionId: "session-123", // Reemplazar por ID real de sesión del usuario
          returnUrl: `${window.location.origin}/dashboard/apoderado/confirmacion`
        })
      });

      if (!response.ok) throw new Error("Error al iniciar transacción");

      const { url, token } = await response.json();

      // Redirección segura a Webpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = token;
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error("Error al iniciar pago:", error);
      alert("Error crítico: No se pudo establecer conexión con Webpay.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A2E] transition-all font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} />
          Volver al inicio
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RESUMEN */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute right-[-2%] top-[-2%] opacity-5 text-[#1A1A2E]">
                <Star size={150} />
            </div>
            
            <div className="relative z-10">
                <span className="bg-[#FF8FAB]/10 text-[#FF8FAB] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                    Transacción Pendiente
                </span>
                <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tighter mb-2">Resumen de Pago</h1>
                <p className="text-gray-400 font-medium mb-10">Revisa los detalles antes de proceder a la zona segura.</p>

                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Concepto</span>
                        <span className="font-bold text-[#1A1A2E]">Bono Cooperación 2026</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Institución</span>
                        <span className="font-bold text-[#1A1A2E]">Colegio Proyecto Lemac</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <span className="text-lg font-black text-[#1A1A2E] uppercase">Total a Pagar</span>
                        <div className="text-right">
                            <span className={`text-4xl font-black ${errorStatus ? 'text-red-400' : 'text-[#FF8FAB]'}`}>
                              {montoBono !== null && montoBono > 0 
                                ? `$${montoBono.toLocaleString('es-CL')}` 
                                : errorStatus ? 'Error de red' : 'Cargando...'}
                            </span>
                            <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">CLP • Exento de IVA</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 items-center">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                <Info size={20} />
            </div>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Este pago es voluntario y contribuye directamente al mantenimiento de las plataformas digitales y mejoras de infraestructura para el año académico 2026.
            </p>
          </div>
        </div>

        {/* MÉTODOS DE PAGO */}
        <div className="lg:col-span-5">
          <div className="bg-[#1A1A2E] rounded-[3rem] p-10 shadow-xl text-white">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
              <CreditCard className="text-[#FF8FAB]" /> Métodos de Pago
            </h2>
            
            <div className="space-y-4">
              <button 
                disabled={loading || !montoBono || montoBono <= 0}
                onClick={handlePagoWebpay}
                className="w-full bg-white/5 hover:bg-white/10 p-6 rounded-4xl flex items-center justify-between transition-all border border-white/10 hover:border-[#FF8FAB]/50 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-start text-left">
                    <span className="font-black text-sm uppercase tracking-widest text-white">Webpay Plus</span>
                    <span className="text-[10px] text-gray-500 font-bold">Débito / Crédito</span>
                </div>
                {loading ? <Loader2 className="animate-spin text-[#FF8FAB]" /> : <CreditCard size={24} className="text-gray-600 group-hover:text-[#FF8FAB] transition-all" />}
              </button>
              
              <button 
                disabled={loading || !montoBono || montoBono <= 0}
                onClick={() => alert("Mostrando datos de transferencia bancaria de Proyecto Lemac...")}
                className="w-full bg-white/5 hover:bg-white/10 p-6 rounded-4xl flex items-center justify-between transition-all border border-white/10 hover:border-blue-400/50 group disabled:opacity-50"
              >
                <div className="flex flex-col items-start text-left">
                    <span className="font-black text-sm uppercase tracking-widest text-white">Transferencia</span>
                    <span className="text-[10px] text-gray-500 font-bold">Confirmación manual</span>
                </div>
                <ShieldCheck size={24} className="text-gray-600 group-hover:text-blue-400 transition-all" />
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] italic mb-4">
                    Pago 100% Protegido
                </p>
                <div className="flex justify-center gap-4 opacity-30">
                    <div className="w-8 h-5 bg-white rounded-sm" />
                    <div className="w-8 h-5 bg-white rounded-sm" />
                    <div className="w-8 h-5 bg-white rounded-sm" />
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}