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
  Wallet,
  Building2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

interface Movimiento {
  id: number;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  fecha: string;
  descripcion: string;
}

interface ResumenCEA {
  ingresosExtra: number;
  egresos: number;
  saldoActual: number;
  // Estos vienen en 0 desde el backend del CEA
  totalPagado: number;
  totalPendiente: number;
}

export default function PresidenteCEADashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presidenteName, setPresidenteName] = useState<string>("Presidente(a) CEA");
  const [colegioName, setColegioName] = useState<string>("Cargando institución...");
  
  const [resumen, setResumen] = useState<ResumenCEA | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        const headersAuth = { Authorization: `Bearer ${token}` };

        // 1. Decodificar Token y Validar Rol CEA
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
          );
          const payload = JSON.parse(jsonPayload);
          
          // Validamos el rol de Presidente del Centro de Alumnos
          if (payload.role !== "CEN_PRES_CAL" && payload.rol !== "CEN_PRES_CAL") {
            throw new Error("Acceso denegado: Vista exclusiva para Presidencia del Centro de Alumnos.");
          }
          
          const nombreEncontrado = payload.nombre || payload.nombres || payload.name;
          if (nombreEncontrado) {
            setPresidenteName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
          }

          if (payload.colegioNombre) setColegioName(payload.colegioNombre);

        } catch (e: any) {
          throw new Error(e.message || "No se pudo verificar la identidad del CEA.");
        }

        // 2. Obtener datos financieros del CEA (Nuevos Endpoints)
        const [resResumen, resMovimientos] = await Promise.all([
          fetch(`${API_URL}/centro-alumnos/resumen`, { headers: headersAuth }).catch(() => null),
          fetch(`${API_URL}/centro-alumnos/movimientos`, { headers: headersAuth }).catch(() => null)
        ]);

        if (resResumen?.ok) {
          const data = await resResumen.json();
          setResumen(data.data);
        } else {
          // Fallback si la tabla está vacía o el API no responde
          setResumen({ ingresosExtra: 0, egresos: 0, saldoActual: 0, totalPagado: 0, totalPendiente: 0 });
        }

        if (resMovimientos?.ok) {
          const data = await resMovimientos.json();
          setMovimientos(data.data);
        }

      } catch (err: any) {
        setError(err.message);
        if (err.message.includes("Acceso denegado")) {
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
            <div className="bg-orange-600 text-white p-2 rounded-lg"><Building2 className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">Centro de Alumnos (CEA)</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {presidenteName}</span>
            </div>
            
            {/* BOTÓN CAMBIO DE VISTA A ALUMNO */}
            <button 
              onClick={() => router.push("/alumno")} 
              className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline-block">Vista Alumno</span>
            </button>

            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600">
              <LogOut className="h-4 w-4" />
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
              <BarChart3 className="h-8 w-8 text-orange-600" />
              Finanzas Centro de Alumnos
            </h1>
            <p className="text-slate-500 mt-1">
              Gestión de fondos generales y proyectos estudiantiles de la institución.
            </p>
          </div>
        </header>

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ingresos Totales</p>
            <p className="text-3xl font-black text-emerald-600">${(resumen?.ingresosExtra || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Egresos Totales</p>
            <p className="text-3xl font-black text-red-600">${(resumen?.egresos || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-orange-600 p-6 rounded-xl shadow-sm border-none text-white">
            <p className="text-xs font-bold text-orange-200 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Saldo Disponible CEA
            </p>
            <p className="text-3xl font-black">${(resumen?.saldoActual || 0).toLocaleString("es-CL")}</p>
          </div>
        </div>

        {/* TABLA DE MOVIMIENTOS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-orange-600" />
              Historial de Movimientos CEA
            </h3>
          </div>
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
                        <span className="text-emerald-600 font-bold flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Ingreso</span>
                      ) : (
                        <span className="text-red-600 font-bold flex items-center gap-1"><TrendingDown className="h-4 w-4" /> Egreso</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${mov.tipo === "INGRESO" ? "text-emerald-600" : "text-red-600"}`}>
                      {mov.tipo === "INGRESO" ? "+" : "-"}${mov.monto.toLocaleString("es-CL")}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No se han registrado movimientos financieros para el Centro de Alumnos todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}