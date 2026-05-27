"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Printer,
  PlusCircle,
  BarChart3,
  Building,
  List,
  Users,
  User,
  ArrowLeftRight,
  FileText,
  CheckCircle,
  XCircle
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

interface Exencion {
  id: number;
  alumnoNombre: string;
  conceptoNombre: string;
  motivo: string;
  estado: string; 
  fechaSolicitud: string;
  fechaTesorero: string | null;
}

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function TesoreroDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [tesoreroName, setTesoreroName] = useState<string>("Tesorero");
  const [curso, setCurso] = useState<Curso | null>(null);
  
  const [totalExtraordinarioRecaudado, setTotalExtraordinarioRecaudado] = useState<number>(0);
  const [totalExtraordinarioPendiente, setTotalExtraordinarioPendiente] = useState<number>(0);
  
  const [detalleRecaudacion, setDetalleRecaudacion] = useState<DetalleRecaudacion[]>([]);
  const [historialPagos, setHistorialPagos] = useState<HistorialPago[]>([]);
  
  const [saldoApertura, setSaldoApertura] = useState<number>(0);
  
  const [isAperturaModalOpen, setIsAperturaModalOpen] = useState(false);
  const [saldoAnteriorInput, setSaldoAnteriorInput] = useState("");
  const [isSavingApertura, setIsSavingApertura] = useState(false);

  const [isExencionesModalOpen, setIsExencionesModalOpen] = useState(false);
  const [exenciones, setExenciones] = useState<Exencion[]>([]);
  const [loadingExenciones, setLoadingExenciones] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

  useEffect(() => {
    const fetchDatosTesorero = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        if (payload.role !== "DIR_TES_APO" && payload.rol !== "DIR_TES_APO") {
          throw new Error("Acceso denegado: Esta vista es exclusiva para Tesorería.");
        }

        const nombreEncontrado = payload.nombres || payload.nombre || payload.name || payload.email;
        if (nombreEncontrado) {
          setTesoreroName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
        }

        const headersAuth = { Authorization: `Bearer ${token}` };

        const hijosRes = await fetch(`${API_URL}/identity/mis-hijos`, { headers: headersAuth });
        
        if (!hijosRes.ok) throw new Error("No se pudo obtener la información familiar del tesorero.");
        const hijosJson = await hijosRes.json();
        const listaHijos = hijosJson.data || [];

        if (listaHijos.length === 0) {
          throw new Error("El usuario no tiene alumnos asociados para determinar el curso a administrar.");
        }

        const primerHijo = listaHijos[0];
        let exactCursoId: number | null = primerHijo.cursoId || primerHijo.CURSO_ID || primerHijo.curso_id || null;
        let nivelNombre = primerHijo.curso || "Curso Asignado";
        let letraCurso = "";
        let anioCurso = new Date().getFullYear();

        if (!exactCursoId) {
          const matriculaAlumnoRes = await fetch(`${API_URL}/academico/matriculas/alumno/${primerHijo.alumnoId || primerHijo.ALUMNO_ID}`, {
            headers: headersAuth
          });

          if (matriculaAlumnoRes.ok) {
            const matriculaAlumnoJson = await matriculaAlumnoRes.json();
            const rawData = matriculaAlumnoJson.data;
            if (rawData) {
              if (Array.isArray(rawData) && rawData.length > 0) {
                const activeMat = rawData[0];
                exactCursoId = activeMat.CURSO_ID || activeMat.cursoId || activeMat.curso_id || null;
                nivelNombre = activeMat.NIVEL_NOMBRE_LARGO || activeMat.curso || nivelNombre;
                letraCurso = activeMat.LETRA || "";
                anioCurso = activeMat.PERIODO_ANIO || anioCurso;
              } else {
                exactCursoId = rawData.CURSO_ID || rawData.cursoId || rawData.curso_id || rawData.curso?.CURSO_ID || rawData.curso?.cursoId || null;
                nivelNombre = rawData.NIVEL_NOMBRE_LARGO || rawData.curso?.NIVEL_NOMBRE_LARGO || rawData.curso || nivelNombre;
                letraCurso = rawData.LETRA || rawData.curso?.LETRA || "";
                anioCurso = rawData.PERIODO_ANIO || rawData.curso?.PERIODO_ANIO || anioCurso;
              }
            }
          }
        }

        if (!exactCursoId) {
          throw new Error("Estructura de curso no válida. No se encontró un ID numérico de curso.");
        }

        setCurso({
          CURSO_ID: Number(exactCursoId),
          NIVEL_NOMBRE_LARGO: nivelNombre,
          LETRA: letraCurso,
          PERIODO_ANIO: anioCurso
        });

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
          console.warn("No se pudo obtener la apertura de caja o no existe:", e);
        }

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
          console.error("Error de red al consultar el resumen financiero del curso:", e);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosTesorero();
  }, [API_URL]);

  const handleAbrirExenciones = async () => {
    setIsExencionesModalOpen(true);
    if (!curso?.CURSO_ID) return;
    
    setLoadingExenciones(true);
    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`${API_URL}/pagos/exenciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        console.log(json.data)
        const exencionesMapeadas = (json.data || []).map((ex: any) => ({
          id: ex.EXENCION_ID,
          fechaSolicitud: ex.FECHA_SOLICITUD,
          motivo: ex.MOTIVO,
          estado: ex.ESTADO_FINAL || ex.ESTADO || 'PENDIENTE', 
          fechaTesorero: ex.FECHA_TESORERO || ex.FECHA_VOTO_TESORERO || null,
          
          // Corrección del mapeo del nombre usando la propiedad inyectada por el backend
          alumnoNombre: ex.APODERADO_NOMBRE || ex.cobro?.apoderado?.NOMBRES || `Apoderado #${ex.cobro?.APODERADO_ID || ''}`,
          
          conceptoNombre: ex.cobro?.concepto?.CONCEPTO_NOMBRE || ex.cobro?.concepto?.NOMBRE || `Cobro #${ex.COBRO_ID}` 
        }));

        setExenciones(exencionesMapeadas);
      }
    } catch (e) {
      console.error("Error al obtener exenciones:", e);
    } finally {
      setLoadingExenciones(false);
    }
  };

  const handleActualizarEstadoExencion = async (idExencion: number, nuevoEstado: string) => {
    try {
      const token = Cookies.get("authToken");
      const esAprobado = nuevoEstado === 'APROBADA';

      const res = await fetch(`${API_URL}/pagos/exenciones/${idExencion}/revision-tesorero`, {
        method: "PATCH", 
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          aprobado: esAprobado,
          observacion: `Exención ${nuevoEstado.toLowerCase()} por Tesorería.` 
        })
      });

      if (!res.ok) {
        const errorBackend = await res.json().catch(() => ({ message: res.statusText }));
        console.error("❌ Error devuelto por el backend:", errorBackend);
        throw new Error(errorBackend.message || "Error desconocido al actualizar");
      }

      // Seteamos la fecha localmente para ocultar inmediatamente los botones de acción en esa fila
      setExenciones(prev => prev.map(ex => 
        ex.id === idExencion ? { ...ex, fechaTesorero: new Date().toISOString() } : ex
      ));
      
      alert(`Revisión enviada exitosamente.`);
    } catch (e: any) {
      console.error(e);
      alert(`Hubo un error: ${e.message}`);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  const handleImprimirBalance = () => window.print();

  const handleAperturaCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso?.CURSO_ID || !curso?.PERIODO_ANIO) return alert("Error: No se ha identificado el curso o el periodo.");

    setIsSavingApertura(true);
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API_URL}/pagos/apertura`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cursoId: curso.CURSO_ID,
          periodoAnio: curso.PERIODO_ANIO,
          montoApertura: Number(saldoAnteriorInput)
        })
      });

      if (!response.ok) throw new Error("No se pudo guardar la apertura de caja.");

      setSaldoApertura(Number(saldoAnteriorInput));
      setIsAperturaModalOpen(false);
      alert("Saldo inicial de apertura actualizado con éxito.");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al registrar la apertura de caja.");
    } finally {
      setIsSavingApertura(false);
    }
  };

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
              <span className="font-bold text-xl tracking-tight text-slate-800">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">Portal Tesorería</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {tesoreroName}</span>
            </div>
            <button onClick={() => router.push("/apoderado")} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
              <ArrowLeftRight className="h-4 w-4" /><span className="hidden sm:inline-block">Vista Apoderado</span>
            </button>
            <button onClick={handleImprimirBalance} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
              <Printer className="h-4 w-4" /><span className="hidden sm:inline-block">Imprimir Balance</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HEADER */}
        <header className="mb-2 print:hidden flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión Financiera de Caja</h1>
            <p className="text-slate-500 mt-1">
              {curso?.NIVEL_NOMBRE_LARGO} {curso?.LETRA} • Control exclusivo de Fondos Extraordinarios y Remanentes.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAbrirExenciones}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4 text-amber-600" /> Solicitudes de Exención
            </button>
            <button 
              onClick={() => {
                setSaldoAnteriorInput(saldoApertura.toString());
                setIsAperturaModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> Configurar Apertura
            </button>
          </div>
        </header>

        {/* TARJETAS KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Building className="h-4 w-4" /> <span className="font-semibold text-sm">Saldo Neto Total Caja</span>
            </div>
            <p className="text-2xl font-black text-slate-800">${saldoActualEnCaja.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <PlusCircle className="h-4 w-4" /> <span className="font-semibold text-sm">Fondo Apertura Inicial</span>
            </div>
            <p className="text-2xl font-black text-slate-700">${saldoApertura.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-center bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <ArrowUpCircle className="h-4 w-4" /> <span className="font-semibold text-sm">Extraordinario Recaudado</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">${totalExtraordinarioRecaudado.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-center bg-gradient-to-br from-amber-50 to-white">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <PiggyBank className="h-4 w-4" /> <span className="font-semibold text-sm">Extraordinario Pendiente</span>
            </div>
            <p className="text-2xl font-black text-amber-700">${totalExtraordinarioPendiente.toLocaleString('es-CL')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {detalleRecaudacion.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <List className="h-5 w-5 text-blue-600" /> Resumen por Concepto
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Concepto</th>
                      <th className="px-5 py-3 font-semibold text-center">Pagos</th>
                      <th className="px-5 py-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {detalleRecaudacion.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">{item.concepto}</td>
                        <td className="px-5 py-3 text-center"><span className="bg-slate-100 text-slate-700 py-1 px-2.5 rounded-full text-xs font-semibold border border-slate-200">{item.cantidadPagos}</span></td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600">${item.montoTotal.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {historialPagos.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> Historial de Pagos
                </h2>
              </div>
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
            </section>
          )}
        </div>
      </main>

      {/* MODAL APERTURA */}
      {isAperturaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Apertura Inicial de Caja</h3>
              <p className="text-sm text-slate-500 mt-1">Declara saldos y remanentes iniciales de la directiva.</p>
            </div>
            <form onSubmit={handleAperturaCaja} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto de Apertura ($)</label>
                <input 
                  type="number" required min="0" value={saldoAnteriorInput}
                  onChange={(e) => setSaldoAnteriorInput(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 45000" disabled={isSavingApertura}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAperturaModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors" disabled={isSavingApertura}>Cancelar</button>
                <button type="submit" disabled={isSavingApertura} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSavingApertura && <Loader2 className="h-4 w-4 animate-spin" />} Guardar Saldo Inicial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXENCIONES */}
      {isExencionesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" /> Solicitudes de Exención
                </h3>
                <p className="text-sm text-slate-500 mt-1">Revisa y gestiona las peticiones de los apoderados del curso.</p>
              </div>
              <button 
                onClick={() => setIsExencionesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {loadingExenciones ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                </div>
              ) : exenciones.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p>No hay solicitudes de exención para este curso.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold w-24">Fecha</th>
                        <th className="px-4 py-3 font-semibold">Apoderado</th>
                        <th className="px-4 py-3 font-semibold">Concepto</th>
                        <th className="px-4 py-3 font-semibold w-1/3">Motivo</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {exenciones.map((ex) => (
                        <tr key={ex.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            {new Date(ex.fechaSolicitud).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{toTitleCase(ex.alumnoNombre)}</td>
                          <td className="px-4 py-3 text-slate-700">{ex.conceptoNombre}</td>
                          <td className="px-4 py-3 text-slate-500 whitespace-normal break-words">
                            {ex.motivo}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ex.estado === 'APROBADA' || ex.estado === 'APROBADO' ? 'bg-emerald-100 text-emerald-700' : 
                              ex.estado === 'RECHAZADA' || ex.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' : 
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {ex.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {/* 🔥 NUEVA LÓGICA DE CONTROL DE ACCIONES DE REVISIÓN */}
                            {ex.fechaTesorero !== null ? (
                              <div className="text-center text-amber-600 font-medium text-xs leading-tight">
                                Ya revisado<br/>
                                <span className="text-[10px] text-slate-400 font-normal">Falta Prof.</span>
                              </div>
                            ) : (ex.estado !== 'PENDIENTE' && ex.estado !== 'PENDIENTES') ? (
                              <div className="text-center text-slate-400 text-xs">Resuelto</div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleActualizarEstadoExencion(ex.id, 'APROBADA')}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleActualizarEstadoExencion(ex.id, 'RECHAZADA')}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Rechazar"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}