
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  User,
  ArrowRightLeft,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

// --- INTERFACES SIMULADAS ---
interface Movimiento {
  id: number;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  fecha: string;
  descripcion: string;
}

interface ResumenCurso {
  totalPagado: number;
  totalPendiente: number;
  ingresosExtra: number;
  egresos: number;
  saldoActual: number;
}

interface CuotaApoderado {
  id: number;
  apoderadoNombre: string;
  concepto: string;
  monto: number;
  estado: "PAGADO" | "PENDIENTE" | "VENCIDO";
}

export default function PresidenteAlumnoDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presidenteName, setPresidenteName] = useState<string>("Presidente(a)");
  const [cursoName, setCursoName] = useState<string>("Cargando curso...");
  
  // Estados para la data financiera
  const [resumen, setResumen] = useState<ResumenCurso | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cuotas, setCuotas] = useState<CuotaApoderado[]>([]);

  // Pestañas de navegación interna
  const [activeTab, setActiveTab] = useState<"CUOTAS" | "MOVIMIENTOS">("CUOTAS");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        const headersAuth = { Authorization: `Bearer ${token}` };
        let cursoIdDesdeToken: number | null = null;

        // 1. Decodificar Token y Validar Rol (Ajustado para Alumno)
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
          );
          const payload = JSON.parse(jsonPayload);
          
          // 👇 VALIDACIÓN ACTUALIZADA
          if (payload.role !== "DIR_PRES_ALU" && payload.rol !== "DIR_PRES_ALU") {
            throw new Error("Acceso denegado: Vista exclusiva para Presidencia de Alumnos.");
          }
          
          const nombreEncontrado = payload.nombre || payload.nombres || payload.name;
          if (nombreEncontrado) {
            setPresidenteName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
          }

          cursoIdDesdeToken = payload.cursoId || payload.curso_id || null;
          if (payload.cursoNombre) setCursoName(payload.cursoNombre);

        } catch (e: any) {
          throw new Error(e.message || "No se pudo verificar la identidad.");
        }

        // 2. Obtener datos financieros del curso
        if (cursoIdDesdeToken) {
          const [resResumen, resMovimientos, resCuotas] = await Promise.all([
            fetch(`${API_URL}/pagos/curso/${cursoIdDesdeToken}/resumen`, { headers: headersAuth }).catch(() => null),
            fetch(`${API_URL}/pagos/curso/${cursoIdDesdeToken}/movimientos`, { headers: headersAuth }).catch(() => null),
            fetch(`${API_URL}/pagos/curso/${cursoIdDesdeToken}/cuotas`, { headers: headersAuth }).catch(() => null)
          ]);

          if (resResumen?.ok) {
            const data = await resResumen.json();
            setResumen(data.data || data);
          } else {
            setResumen({ totalPagado: 450000, totalPendiente: 120000, ingresosExtra: 50000, egresos: 35000, saldoActual: 465000 });
          }

          if (resMovimientos?.ok) {
            const data = await resMovimientos.json();
            setMovimientos(data.data || data);
          } else {
            setMovimientos([
              { id: 1, tipo: "INGRESO", monto: 50000, fecha: "2026-05-20", descripcion: "Aporte Rifa" },
              { id: 2, tipo: "EGRESO", monto: 35000, fecha: "2026-05-22", descripcion: "Compra insumos convivencia" }
            ]);
          }

          if (resCuotas?.ok) {
            const data = await resCuotas.json();
            setCuotas(data.data || data);
          } else {
            setCuotas([
              { id: 101, apoderadoNombre: "Juan Pérez", concepto: "Cuota Centro de Padres", monto: 15000, estado: "PAGADO" },
              { id: 102, apoderadoNombre: "María González", concepto: "Cuota Centro de Padres", monto: 15000, estado: "PENDIENTE" },
              { id: 103, apoderadoNombre: "Carlos Rojas", concepto: "Cuota Centro de Padres", monto: 15000, estado: "VENCIDO" }
            ]);
          }
        }

      } catch (err: any) {
        setError(err.message);
        if (err.message.includes("Acceso denegado") || err.message.includes("sesión")) {
          setTimeout(() => router.push("/"), 2500);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-indigo-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg"><BarChart3 className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              {/* 👇 ETIQUETA ACTUALIZADA */}
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">Presidencia Alumnos</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {presidenteName}</span>
            </div>
            
            {/* 👇 BOTÓN CAMBIO DE VISTA A ALUMNO */}
            <button 
              onClick={() => router.push("/alumno")} 
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              title="Volver al Portal de Alumno"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline-block">Vista Alumno</span>
            </button>

            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600 hover:border-red-200">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER DE LA SECCIÓN */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              Transparencia del Curso
            </h1>
            <p className="text-slate-500 mt-1">
              Visualización general de cuotas, ingresos y egresos de {cursoName}.
            </p>
          </div>
        </header>

        {/* TARJETAS DE RESUMEN FINANCIERO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuotas Recaudadas</p>
            <p className="text-2xl font-black text-emerald-600">${(resumen?.totalPagado || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuotas Pendientes</p>
            <p className="text-2xl font-black text-amber-600">${(resumen?.totalPendiente || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Egresos (Gastos)</p>
            <p className="text-2xl font-black text-red-600">${(resumen?.egresos || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-indigo-600 p-5 rounded-xl shadow-sm border border-indigo-700 text-white">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Saldo a Favor
            </p>
            <p className="text-2xl font-black">${(resumen?.saldoActual || 0).toLocaleString("es-CL")}</p>
          </div>
        </div>

        {/* CONTROLES DE PESTAÑAS */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("CUOTAS")}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "CUOTAS" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="h-4 w-4" /> Estado de Cuotas
          </button>
          <button
            onClick={() => setActiveTab("MOVIMIENTOS")}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "MOVIMIENTOS" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" /> Ingresos y Egresos
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* VISTA 1: CUOTAS */}
          {activeTab === "CUOTAS" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Apoderado</th>
                    <th className="px-6 py-4">Concepto</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cuotas.length > 0 ? cuotas.map((cuota) => (
                    <tr key={cuota.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{cuota.apoderadoNombre}</td>
                      <td className="px-6 py-4">{cuota.concepto}</td>
                      <td className="px-6 py-4 text-right font-medium">${cuota.monto.toLocaleString("es-CL")}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          cuota.estado === "PAGADO" ? "bg-emerald-100 text-emerald-700" :
                          cuota.estado === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {cuota.estado}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay registros de cuotas disponibles.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VISTA 2: MOVIMIENTOS (INGRESOS Y EGRESOS) */}
          {activeTab === "MOVIMIENTOS" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movimientos.length > 0 ? movimientos.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{new Date(mov.fecha).toLocaleDateString("es-CL", { timeZone: "UTC" })}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{mov.descripcion}</td>
                      <td className="px-6 py-4">
                        {mov.tipo === "INGRESO" ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium"><TrendingUp className="h-4 w-4" /> Ingreso</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-medium"><TrendingDown className="h-4 w-4" /> Egreso</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${mov.tipo === "INGRESO" ? "text-emerald-600" : "text-red-600"}`}>
                        {mov.tipo === "INGRESO" ? "+" : "-"}${mov.monto.toLocaleString("es-CL")}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay movimientos registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}