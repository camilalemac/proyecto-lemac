"use client"
import { useState, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { ShieldCheck, PieChart as PieIcon } from "lucide-react"
import { 
  ResumenFinancieroCard, 
  GraficoGastos, 
  TablaFlujoCaja, 
  ArchivoReportes, 
  ValidacionCuentas 
} from "./components/index";

export default function PresidentePage() {
  const [data, setData] = useState({
    stats: null,
    movimientos: [],
    categorias: [],
    reportes: [],
    cuentasPendientes: [],
    loading: true
  });

  // Forzamos localhost para asegurar compatibilidad local
  const API_PAGOS = "http://localhost:3002/api/v1/pagos";
  const API_DOCS = "http://localhost:3006/api/v1/documentos";

  const fetchData = useCallback(async () => {
    const token = Cookies.get("auth-token");
    
    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url, { 
          headers: { "Authorization": `Bearer ${token}` } 
        });
        const json = await res.json();
        return json.success ? json : { data: null };
      } catch (err) {
        console.error(`❌ Sin respuesta en: ${url}`);
        return { data: null };
      }
    };

    try {
      const [resumen, movs, docs, cuentas] = await Promise.all([
        safeFetch(`${API_PAGOS}/cuentas-bancarias/mi-cuenta`),
        safeFetch(`${API_PAGOS}/movimientos-caja/resumen`),
        safeFetch(`${API_DOCS}/reportes`),
        safeFetch(`${API_PAGOS}/cuentas-bancarias/pendientes-validacion`)
      ]);

      setData({
        stats: resumen.data,
        movimientos: movs.data || [],
        categorias: movs.categorias || [],
        reportes: docs.data || [],
        cuentasPendientes: cuentas.data || [],
        loading: false
      });
    } catch (e) {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (data.loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="animate-pulse font-black text-brand uppercase tracking-tighter">Conectando con Oracle...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-gray-50/30 min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">Presidente de Apoderados</h1>
        <ShieldCheck className="text-green-500" size={24} />
      </header>

      <ResumenFinancieroCard stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] shadow-sm border">
           <GraficoGastos categorias={data.categorias} />
        </div>
        <div className="lg:col-span-2">
           <TablaFlujoCaja movimientos={data.movimientos} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ValidacionCuentas cuentas={data.cuentasPendientes} onRefresh={fetchData} />
        <ArchivoReportes reportes={data.reportes} />
      </div>
    </div>
  );
}