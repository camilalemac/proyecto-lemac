"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  Wallet,
  ArrowUpCircle,
  PiggyBank,
  Printer,
  Building,
  List,
  Users,
  User,
  ArrowDownCircle,
  ArrowRightLeft // <-- Agregamos este ícono
} from "lucide-react";

interface Curso {
  CURSO_ID: number;
  NIVEL_NOMBRE_LARGO?: string;
  LETRA?: string;
  PERIODO_ANIO?: number;
}

interface DetalleRecaudacion {
  concepto: string;
  montoTotal: number;
  cantidadPagos: number;
}

interface HistorialPago {
  alumno: string;
  concepto: string;
  monto: number;
  fecha: string;
}

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

export default function TesoreroAlumnoDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [tesoreroName, setTesoreroName] = useState<string>("Alumno Tesorero");
  const [curso, setCurso] = useState<Curso | null>(null);
  
  const [totalExtraordinarioRecaudado, setTotalExtraordinarioRecaudado] = useState<number>(0);
  const [totalExtraordinarioPendiente, setTotalExtraordinarioPendiente] = useState<number>(0);
  
  const [detalleRecaudacion, setDetalleRecaudacion] = useState<DetalleRecaudacion[]>([]);
  const [historialPagos, setHistorialPagos] = useState<HistorialPago[]>([]);
  
  const [saldoApertura, setSaldoApertura] = useState<number>(0);

  useEffect(() => {
    const fetchDatosTesoreroAlumno = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        let alumnoIdDesdeToken: number | null = null;
        const headersAuth = { Authorization: `Bearer ${token}` };

        // 1. Decodificar Token y Validar Rol
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
          );
          const payload = JSON.parse(jsonPayload);
          
          if (payload.role !== "DIR_TES_ALU" && payload.rol !== "DIR_TES_ALU") {
            throw new Error("Acceso denegado: Esta vista es exclusiva para Tesorería Estudiantil.");
          }

          // Extracción del ID
          alumnoIdDesdeToken = payload.userId || payload.alumnoId || payload.id;
          
          const nombreEncontrado = payload.nombre || payload.nombres || payload.name;
          if (nombreEncontrado) {
            setTesoreroName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
          }
        } catch (e: any) {
          throw new Error(e.message || "No se pudo verificar la identidad del usuario.");
        }

        if (!alumnoIdDesdeToken) throw new Error("No se encontró el ID del alumno en la sesión.");

        // 2. Obtener información de perfil del alumno para formatear su nombre
        try {
          const perfilRes = await fetch(`${API_URL}/identity/me`, { headers: headersAuth });
          if (perfilRes.ok) {
            const perfilJson = await perfilRes.json();
            if (perfilJson.data?.perfil?.nombres) {
              const nombreLimpio = perfilJson.data.perfil.nombres.split(' ')[0]; 
              const apellidoLimpio = perfilJson.data.perfil.apellidos ? perfilJson.data.perfil.apellidos.split(' ')[0] : '';
              setTesoreroName(`${nombreLimpio} ${apellidoLimpio}`);
            }
          }
        } catch (perfilErr) {
          console.warn("No se pudo mapear el nombre desde el módulo de identidad.", perfilErr);
        }

        // 3. Obtener Curso a través de la matrícula del alumno
        const matriculaRes = await fetch(`${API_URL}/academico/matriculas/alumno/${alumnoIdDesdeToken}`, {
          headers: headersAuth
        });

        if (!matriculaRes.ok) throw new Error("No se encontró una matrícula activa para obtener el curso.");
        const matriculaJson = await matriculaRes.json();
        
        const rawData = matriculaJson.data;
        let exactCursoId: number | null = null;
        let nivelNombre = "Curso Asignado";
        let letraCurso = "";
        let anioCurso = new Date().getFullYear();

        if (rawData) {
          if (Array.isArray(rawData) && rawData.length > 0) {
            const activeMat = rawData[0];
            exactCursoId = activeMat.CURSO_ID || activeMat.cursoId || activeMat.curso_id || null;
            nivelNombre = activeMat.NIVEL_NOMBRE_LARGO || activeMat.curso || nivelNombre;
            letraCurso = activeMat.LETRA || "";
            anioCurso = activeMat.PERIODO_ANIO || anioCurso;
          } else {
            exactCursoId = rawData.CURSO_ID || rawData.cursoId || rawData.curso_id || rawData.curso?.CURSO_ID || null;
            nivelNombre = rawData.NIVEL_NOMBRE_LARGO || rawData.curso?.NIVEL_NOMBRE_LARGO || rawData.curso || nivelNombre;
            letraCurso = rawData.LETRA || rawData.curso?.LETRA || "";
            anioCurso = rawData.PERIODO_ANIO || rawData.curso?.PERIODO_ANIO || anioCurso;
          }
        }

        if (!exactCursoId) {
          throw new Error("No se pudo determinar el ID del curso para buscar las finanzas.");
        }

        setCurso({
          CURSO_ID: Number(exactCursoId),
          NIVEL_NOMBRE_LARGO: nivelNombre,
          LETRA: letraCurso,
          PERIODO_ANIO: anioCurso
        });

        // 4. Obtener Apertura de Caja (Solo lectura)
        try {
          const aperturaRes = await fetch(`${API_URL}/pagos/apertura/curso/${exactCursoId}?periodoAnio=${anioCurso}`, {
            headers: headersAuth
          });
          if (aperturaRes.ok) {
            const aperturaJson = await aperturaRes.json();
            if (aperturaJson.data && aperturaJson.data.montoApertura !== undefined) {
              setSaldoApertura(Number(aperturaJson.data.montoApertura));
            }
          }
        } catch (e) {
          console.warn("No se pudo obtener la apertura de caja o no existe.", e);
        }

        // 5. Obtener Resumen Financiero del Curso
        try {
          const finanzasCursoRes = await fetch(`${API_URL}/pagos/cobros/curso/${exactCursoId}/resumen`, {
            headers: headersAuth
          });

          if (finanzasCursoRes.ok) {
            const finanzasCursoJson = await finanzasCursoRes.json();
            const datosFinanzas = finanzasCursoJson.data || finanzasCursoJson;

            setTotalExtraordinarioRecaudado(Number(datosFinanzas.totalPagado || datosFinanzas.Ingresos || 0));
            setTotalExtraordinarioPendiente(Number(datosFinanzas.totalPendiente || datosFinanzas.Deuda || 0));
            
            setDetalleRecaudacion(datosFinanzas.detalleRecaudacion || []);
            setHistorialPagos(datosFinanzas.historialPagos || datosFinanzas.pagosIndividuales || []);
          }
        } catch (e) {
          console.error("Error al consultar el resumen financiero del curso:", e);
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

    fetchDatosTesoreroAlumno();
  }, []); 

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  const handleImprimirBalance = () => window.print();

  const totalEgresos = 0; 
  const saldoActualEnCaja = (saldoApertura + totalExtraordinarioRecaudado) - totalEgresos; 

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><Wallet className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">Portal Tesorería Estudiantil</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {tesoreroName}</span>
            </div>
            
            {/* BOTÓN CAMBIO DE VISTA A ALUMNO */}
            <button 
              onClick={() => router.push("/alumno")} 
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              title="Volver al Portal de Alumno"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline-block">Vista Alumno</span>
            </button>

            <button onClick={handleImprimirBalance} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
              <Printer className="h-4 w-4" /><span className="hidden sm:inline-block">Imprimir</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600 hover:border-red-200">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <header className="mb-2 print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estado Financiero del Curso</h1>
            <p className="text-slate-500 mt-1">
              Resumen de cuotas de alumnos y estado de caja.
            </p>
          </div>
          {curso && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3 self-start sm:self-center shadow-sm">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Curso Administrado</p>
                <p className="text-base font-black text-blue-900">{curso.NIVEL_NOMBRE_LARGO} {curso.LETRA}</p>
              </div>
            </div>
          )}
        </header>

        {/* TARJETAS KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center lg:col-span-2">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Building className="h-4 w-4" /> <span className="font-semibold text-sm">Saldo Neto Total Caja</span>
            </div>
            <p className="text-3xl font-black text-slate-800">${saldoActualEnCaja.toLocaleString('es-CL')}</p>
            <p className="text-xs text-slate-400 mt-1">Incluye apertura, ingresos totales y descuentos de egresos.</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Wallet className="h-4 w-4" /> <span className="font-semibold text-sm">Fondo Apertura</span>
            </div>
            <p className="text-2xl font-bold text-slate-700">${saldoApertura.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <ArrowUpCircle className="h-4 w-4" /> <span className="font-semibold text-sm">Cuotas Pagadas</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">${totalExtraordinarioRecaudado.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <PiggyBank className="h-4 w-4" /> <span className="font-semibold text-sm">Cuotas Pendientes</span>
            </div>
            <p className="text-2xl font-black text-amber-700">${totalExtraordinarioPendiente.toLocaleString('es-CL')}</p>
          </div>
        </div>

        {/* EGRESOS MOCK (Temporalmente 0) */}
        <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg text-red-600"><ArrowDownCircle className="h-5 w-5" /></div>
            <div>
              <p className="font-bold text-red-800">Total Egresos Registrados</p>
              <p className="text-xs text-red-600/80">Gastos documentados del curso a la fecha.</p>
            </div>
          </div>
          <p className="text-xl font-bold text-red-700">${totalEgresos.toLocaleString('es-CL')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* RESUMEN POR CONCEPTO */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <List className="h-5 w-5 text-blue-600" /> Recaudación por Concepto
              </h2>
            </div>
            {detalleRecaudacion.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Concepto</th>
                      <th className="px-5 py-3 font-semibold text-center">Pagos Realizados</th>
                      <th className="px-5 py-3 font-semibold text-right">Total Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {detalleRecaudacion.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{item.concepto}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-full text-xs font-semibold border border-slate-200">
                            {item.cantidadPagos}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600">
                          ${item.montoTotal.toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No hay recaudaciones registradas para este curso.</p>
              </div>
            )}
          </section>

          {/* HISTORIAL DE PAGOS */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Últimos Pagos de Alumnos
              </h2>
            </div>
            {historialPagos.length > 0 ? (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left text-slate-600 relative">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Alumno</th>
                      <th className="px-5 py-3 font-semibold">Concepto</th>
                      <th className="px-5 py-3 font-semibold">Fecha</th>
                      <th className="px-5 py-3 font-semibold text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {historialPagos.map((pago, index) => (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{toTitleCase(pago.alumno)}</td>
                        <td className="px-5 py-3 text-slate-500">{pago.concepto}</td>
                        <td className="px-5 py-3 text-slate-500">{pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-CL') : '--'}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600">${pago.monto.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No hay historial de pagos disponible.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}