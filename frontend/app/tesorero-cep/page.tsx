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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  PlusCircle,
  X
} from "lucide-react";

// Ajusta la URL base si es necesario
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

interface Movimiento {
  id: number;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  fecha: string;
  descripcion: string;
}

interface ResumenCEP {
  ingresosExtra: number;
  egresos: number;
  saldoActual: number;
  totalPagado: number;
  totalPendiente: number;
}

export default function TesoreroCEPDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tesoreroName, setTesoreroName] = useState<string>("Tesorero(a) CEP");
  
  const [resumen, setResumen] = useState<ResumenCEP | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  // Estados del Formulario Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState<"INGRESO" | "EGRESO">("EGRESO");
  const [montoForm, setMontoForm] = useState<string>("");
  const [descForm, setDescForm] = useState<string>("");
  const [cateForm, setCateForm] = useState<string>("Operaciones");

  const loadData = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) throw new Error("No hay sesión activa");

      const headersAuth = { Authorization: `Bearer ${token}` };

      // 1. Validar Identidad del Token
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        // 🚨 Validamos el rol específico de Tesorero de Padres (Ajusta la sigla si usas otra)
        if (payload.role !== "CEN_TES_CAP" && payload.rol !== "CEN_TES_CAP") {
          throw new Error("Acceso denegado: Se requieren permisos de Tesorero CEP.");
        }
        
        const nombreEncontrado = payload.nombre || payload.name;
        if (nombreEncontrado) setTesoreroName(nombreEncontrado);
      } catch (e: any) {
        throw new Error(e.message || "Error al verificar credenciales.");
      }

      // 2. Traer información financiera general
      // 🚨 NOTA: Asegúrate de que esta URL coincida con cómo montaste el router en tu app.ts/index.ts
      const [resResumen, resMovimientos] = await Promise.all([
        fetch(`${API_URL}/pagos/movimientoCep/resumen`, { headers: headersAuth }).catch(() => null),
        fetch(`${API_URL}/pagos/movimientoCep/movimientos`, { headers: headersAuth }).catch(() => null)
      ]);

      if (resMovimientos?.ok) {
        const data = await resMovimientos.json();
        
        const movimientosMapeados = data.data.map((item: any, index: number) => ({
          id: item.MOVIMIENTO_CEP_ID || item.movimiento_cep_id || item.id || index,
          tipo: item.TIPO_MOVIMIENTO_CEP || item.tipo_movimiento_cep || item.tipo || "EGRESO",
          monto: Number(item.MONTO_MOVIMIENTO_CEP || item.monto_movimiento_cep || item.monto || 0),
          fecha: item.FECHA_MOVIMIENTO_CEP || item.fecha_movimiento_cep || item.fecha || new Date().toISOString(),
          descripcion: item.DESC_MOVIMIENTO_CEP || item.desc_movimiento_cep || item.descripcion || "Sin descripción"
        }));
        
        setMovimientos(movimientosMapeados);

        // Cálculo dinámico de resumen
        const totalIngresos = movimientosMapeados
          .filter((m: any) => m.tipo === "INGRESO")
          .reduce((acc: number, m: any) => acc + m.monto, 0);
          
        const totalEgresos = movimientosMapeados
          .filter((m: any) => m.tipo === "EGRESO")
          .reduce((acc: number, m: any) => acc + m.monto, 0);

        setResumen({
          ingresosExtra: totalIngresos,
          egresos: totalEgresos,
          saldoActual: totalIngresos - totalEgresos,
          totalPagado: 0,
          totalPendiente: 0
        });
      }

    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Acceso denegado")) {
        // Redirigimos a la vista principal si no tiene permisos
        setTimeout(() => router.push("/"), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoForm || !descForm) return alert("Por favor rellena todos los campos obligatorios");

    setSubmitLoading(true);
    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`${API_URL}/pagos/movimientoCep/movimientos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo: tipoForm,
          monto: Number(montoForm),
          descripcion: descForm,
          categoria: cateForm
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Error del servidor (Código HTTP: ${res.status})`);
      }

      setMontoForm("");
      setDescForm("");
      setIsModalOpen(false);
      
      await loadData();
    } catch (err: any) {
        console.error("🔍 Detalles del fallo en red:", err);
        alert("No se pudo registrar: " + err.message); 
    } finally {
        setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-orange-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 text-white p-2 rounded-lg"><Building2 className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Tesorería CEP</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">Flujo de Caja Apoderados</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {tesoreroName}</span>
            </div>
            
            {/* BOTÓN VOLVER A VISTA APODERADO */}
            <button 
              onClick={() => router.push("/apoderado")} 
              className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Vista Apoderado</span>
            </button>

            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ENCABEZADO DE ACCIONES */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              Panel Contable Centro de Padres
            </h1>
            <p className="text-slate-500 mt-1">Supervisión de balances financieros y registro de transacciones de apoderados.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md transform active:scale-95"
          >
            <PlusCircle className="h-5 w-5" />
            Registrar Movimiento
          </button>
        </header>

        {/* TARJETAS DE BALANCES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ingresos Registrados</p>
            <p className="text-3xl font-black text-emerald-600">${(resumen?.ingresosExtra || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gastos / Egresos</p>
            <p className="text-3xl font-black text-red-600">${(resumen?.egresos || 0).toLocaleString("es-CL")}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl shadow-sm border-none text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2 text-orange-400">
              <Wallet className="h-4 w-4" /> Capital Disponible CEP
            </p>
            <p className="text-3xl font-black text-orange-400">${(resumen?.saldoActual || 0).toLocaleString("es-CL")}</p>
          </div>
        </div>

        {/* HISTORIAL DE TRANSACCIONES */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Libro de Cuentas CEP</h3>
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
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No hay registros cargados. Usa el botón superior para crear el primero.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🚀 MODAL DE REGISTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              📝 Registrar Operación CEP
            </h2>

            <form onSubmit={handleSubmitGasto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setTipoForm("EGRESO")}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${tipoForm === "EGRESO" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    📉 Gasto / Egreso
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTipoForm("INGRESO")}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${tipoForm === "INGRESO" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    📈 Ingreso
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monto ($ CLP)</label>
                <input 
                  type="number" 
                  required
                  placeholder="Ej: 15000"
                  value={montoForm}
                  onChange={(e) => setMontoForm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción / Glosa</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Compra de premios para kermesse"
                  value={descForm}
                  onChange={(e) => setDescForm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
                <select 
                  value={cateForm}
                  onChange={(e) => setCateForm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                >
                  <option value="Operaciones">Operaciones Generales</option>
                  <option value="Eventos">Eventos y Beneficios</option>
                  <option value="Infraestructura">Mejoras de Infraestructura</option>
                  <option value="Donacion">Donaciones y Ayuda</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={submitLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Guardar en BD"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}