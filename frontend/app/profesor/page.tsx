"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  Users,
  BookOpen,
  CheckCircle2,
  User,
  Clock,
  Minus,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";

// --- INTERFACES ---
interface Curso {
  CURSO_ID: number;
  NIVEL_NOMBRE?: string;
  NIVEL_NOMBRE_LARGO?: string;
  LETRA?: string;
  PERIODO_ANIO?: number;
}

interface Categoria {
  CATEGORIA_ID: number;
  NOMBRE: string;
}

interface Concepto {
  CONCEPTO_ID: number;
  NOMBRE: string;
  categoria?: Categoria;
}

interface Cuota {
  COBRO_ID: number;
  MONTO_ORIGINAL: string | number;
  MONTO_PAGADO: string | number;
  ESTADO: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO";
  FECHA_EMISION: string;
  FECHA_VENCIMIENTO: string;
  DESCRIPCION?: string;
  concepto?: Concepto;
}

interface AlumnoData {
  ALUMNO_ID: number;
  MATRICULA_ID: number;
  NUMERO_LISTA: number;
  NOMBRE_COMPLETO: string;
  RUT: string;
}

interface FinanzasResumen {
  totalPendiente: number;
  totalPagado: number;
  cobros: Cuota[];
}

interface AlumnoCompleto extends AlumnoData {
  finanzas: FinanzasResumen;
}

interface Exencion {
  id: number;
  alumnoNombre: string;
  conceptoNombre: string;
  motivo: string;
  estado: string; 
  fechaSolicitud: string;
  fechaProfesor: string | null;
}

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// --- FUNCIÓN CLASIFICADORA DE COBROS ---
const getCategoriaCobro = (cuota: Cuota): "Materiales" | "DiaNino" | "Corona" | "Mensualidad" => {
  const texto = `${cuota.concepto?.NOMBRE || ""} ${cuota.DESCRIPCION || ""} ${cuota.concepto?.categoria?.NOMBRE || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); 

  if (texto.includes("materiales") && texto.includes("aseo")) return "Materiales";
  if (texto.includes("dia del nino") || texto.includes("aporte dia")) return "DiaNino";
  if (texto.includes("corona flores") || texto.includes("cuota extra corona")) return "Corona";
  
  return "Mensualidad";
};

// --- CALCULADORA DE ESTADO POR CATEGORÍA ---
const obtenerEstadoPorCategoria = (cobros: Cuota[], categoriaFiltro: ReturnType<typeof getCategoriaCobro>) => {
  const cobrosCategoria = cobros.filter(c => getCategoriaCobro(c) === categoriaFiltro);
  
  if (cobrosCategoria.length === 0) return "N/A";
  
  const todosPagados = cobrosCategoria.every(c => c.ESTADO === "PAGADO" || c.ESTADO === "ANULADO");
  const algunVencido = cobrosCategoria.some(c => c.ESTADO === "VENCIDO");
  
  if (todosPagados) return "PAGADO";
  if (algunVencido) return "VENCIDO";
  return "PENDIENTE";
};

export default function ProfesorDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [profesorName, setProfesorName] = useState<string>("Profesor");
  const [profesorEmail, setProfesorEmail] = useState<string>("");
  const [curso, setCurso] = useState<Curso | null>(null);
  const [alumnosList, setAlumnosList] = useState<AlumnoCompleto[]>([]);

  // Estados para Exenciones
  const [isExencionesModalOpen, setIsExencionesModalOpen] = useState(false);
  const [exenciones, setExenciones] = useState<Exencion[]>([]);
  const [loadingExenciones, setLoadingExenciones] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

  useEffect(() => {
    const fetchDatosProfesor = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        // 1. Decodificar Token y Validar Rol
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        if (payload.role !== "STF_PROF" && payload.rol !== "STF_PROF") {
          throw new Error("Acceso denegado: Esta vista es exclusiva para profesores.");
        }

        // 2. Obtener Perfil del Profesor
        const perfilRes = await fetch(`${API_URL}/identity/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (perfilRes.ok) {
          const perfilJson = await perfilRes.json();
          if (perfilJson.data?.perfil) {
            const { nombres, apellidos, email } = perfilJson.data.perfil;
            const primerNombre = nombres ? nombres.split(' ')[0] : 'Profesor';
            const primerApellido = apellidos ? apellidos.split(' ')[0] : '';
            setProfesorName(`${primerNombre} ${primerApellido}`);
            
            if (email) {
              const prefijoCorreo = email.split('@')[0];
              setProfesorEmail(`${prefijoCorreo}@profesor.cl`.toLowerCase());
            } else {
              setProfesorEmail(`${primerNombre}.${primerApellido}@profesor.cl`.toLowerCase());
            }
          }
        }

        // 3. Obtener Curso del Profesor Jefe
        const cursoRes = await fetch(`${API_URL}/academico/cursos/mi-curso`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!cursoRes.ok) {
          if (cursoRes.status === 404) throw new Error("No tienes un curso asignado como Profesor Jefe.");
          throw new Error("Error al obtener la jefatura del profesor");
        }
        
        const cursoJson = await cursoRes.json();
        const cursoData = cursoJson.data;
        setCurso(cursoData);

        // 4. Obtener Alumnos del Curso
        if (cursoData && cursoData.CURSO_ID) {
          const matriculasRes = await fetch(`${API_URL}/academico/matriculas/curso/${cursoData.CURSO_ID}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (matriculasRes.ok) {
            const matriculasJson = await matriculasRes.json();
            const rawData = matriculasJson.data || [];

            const alumnosBase: AlumnoData[] = rawData.map((item: any, index: number) => {
              const nombres = item.ALUMNO_NOMBRES || item.alumno_nombres || item.NOMBRES || item.nombres || "";
              const apellidos = item.ALUMNO_APELLIDOS || item.alumno_apellidos || item.APELLIDOS || item.apellidos || "";
              const nombreCompleto = `${nombres} ${apellidos}`.trim() || `Alumno #${item.ALUMNO_ID || index + 1}`;
              const rutCuerpo = item.ALUMNO_RUT || item.alumno_rut || item.RUT_CUERPO || item.rut_cuerpo || "";
              const rutDv = item.ALUMNO_RUT_DV || item.alumno_rut_dv || item.RUT_DV || item.rut_dv || "";

              return {
                ALUMNO_ID: item.ALUMNO_ID || item.alumno_id,
                MATRICULA_ID: item.MATRICULA_ID || item.matricula_id,
                NUMERO_LISTA: item.NUMERO_LISTA || item.numero_lista || (index + 1),
                NOMBRE_COMPLETO: nombreCompleto,
                RUT: rutCuerpo ? `${rutCuerpo}-${rutDv}` : "Sin RUT",
              };
            });

            // 5. Obtener Finanzas por cada Alumno
            const alumnosConFinanzas = await Promise.all(alumnosBase.map(async (alumnoData) => {
              try {
                const finanzasRes = await fetch(`${API_URL}/pagos/cobros/alumno/${alumnoData.ALUMNO_ID}/resumen`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                let finanzas: FinanzasResumen = { totalPendiente: 0, totalPagado: 0, cobros: [] };
                if (finanzasRes.ok) {
                  const finanzasJson = await finanzasRes.json();
                  finanzas = {
                    totalPendiente: finanzasJson.data?.totalPendiente || 0,
                    totalPagado: finanzasJson.data?.totalPagado || 0,
                    cobros: finanzasJson.data?.cobros || [],
                  };
                }
                return { ...alumnoData, finanzas };
              } catch (e) {
                return { ...alumnoData, finanzas: { totalPendiente: 0, totalPagado: 0, cobros: [] } };
              }
            }));

            alumnosConFinanzas.sort((a, b) => a.NOMBRE_COMPLETO.localeCompare(b.NOMBRE_COMPLETO));
            setAlumnosList(alumnosConFinanzas);
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

    fetchDatosProfesor();
  }, [API_URL, router]);

  // --- MÉTODOS DE EXENCIONES ---
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
        const exencionesMapeadas = (json.data || []).map((ex: any) => ({
          id: ex.EXENCION_ID,
          fechaSolicitud: ex.FECHA_SOLICITUD,
          motivo: ex.MOTIVO,
          estado: ex.ESTADO_FINAL || ex.ESTADO || 'PENDIENTE', 
          fechaProfesor: ex.FECHA_PROFESOR || ex.FECHA_VOTO_PROFESOR || null,
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

      const res = await fetch(`${API_URL}/pagos/exenciones/${idExencion}/revision-profesor`, {
        method: "PATCH", 
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          aprobado: esAprobado,
          observacion: `Exención ${nuevoEstado.toLowerCase()} por Profesor Jefe.` 
        })
      });

      if (!res.ok) {
        const errorBackend = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorBackend.message || "Error desconocido al actualizar");
      }

      setExenciones(prev => prev.map(ex => 
        ex.id === idExencion ? { ...ex, fechaProfesor: new Date().toISOString() } : ex
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

  // --- COMPONENTE RENDERIZADOR DE INSIGNIAS DE ESTADO ---
  const StatusBadge = ({ estado, tooltip }: { estado: string, tooltip: string }) => {
    if (estado === "PAGADO") return <div title={tooltip} className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>;
    if (estado === "PENDIENTE") return <div title={tooltip} className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Clock className="h-4 w-4" /></div>;
    if (estado === "VENCIDO") return <div title={tooltip} className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600"><AlertCircle className="h-4 w-4" /></div>;
    return <div title={tooltip} className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Minus className="h-4 w-4" /></div>;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16">
      
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><BookOpen className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-150">Portal Docente</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-blue-600" /><span>Hola, {profesorName}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600 hover:border-red-200">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <header className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Jefatura</h1>
            <p className="text-slate-500 mt-1">Revisa el estado de tus alumnos y su situación financiera por concepto.</p>
          </div>
          <button 
            onClick={handleAbrirExenciones}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <FileText className="h-4 w-4 text-amber-600" /> Solicitudes de Exención
          </button>
        </header>

        {curso && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-blue-600 h-5 w-5" />
                <h2 className="text-lg font-semibold text-slate-800">Mi Curso Asignado</h2>
              </div>
              <p className="font-black text-2xl text-blue-900">
                {curso.NIVEL_NOMBRE_LARGO || "Curso"} {curso.LETRA}
              </p>
              <p className="text-sm text-slate-500">Período Académico {curso.PERIODO_ANIO}</p>
            </div>
            
            {/* LEYENDA DE ICONOS */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex gap-4">
              <div className="flex items-center gap-1.5 text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> Pagado</div>
              <div className="flex items-center gap-1.5 text-slate-600"><Clock className="h-4 w-4 text-amber-500"/> Pendiente</div>
              <div className="flex items-center gap-1.5 text-slate-600"><AlertCircle className="h-4 w-4 text-red-500"/> Vencido</div>
              <div className="flex items-center gap-1.5 text-slate-600"><Minus className="h-4 w-4 text-slate-400"/> Sin Cobro</div>
            </div>
          </section>
        )}

        {/* LISTA DE ALUMNOS MATRIZ */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-600" /> Detalle de Pagos por Alumno
            </h2>
            <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {alumnosList.length} alumnos
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-semibold w-1/4">Estudiante</th>
                  <th className="p-4 font-semibold text-center">Mensualidades</th>
                  <th className="p-4 font-semibold text-center">Materiales</th>
                  <th className="p-4 font-semibold text-center">Día del Niño</th>
                  <th className="p-4 font-semibold text-center">Corona Flores</th>
                  <th className="p-4 font-semibold text-right">Deuda Total</th>
                  <th className="p-4 font-semibold text-center">Estado General</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumnosList.map((alumno) => {
                  const cobros = alumno.finanzas.cobros;
                  const alDia = alumno.finanzas.totalPendiente === 0;
                  
                  const estadoMensualidad = obtenerEstadoPorCategoria(cobros, "Mensualidad");
                  const estadoMateriales = obtenerEstadoPorCategoria(cobros, "Materiales");
                  const estadoDiaNino = obtenerEstadoPorCategoria(cobros, "DiaNino");
                  const estadoCorona = obtenerEstadoPorCategoria(cobros, "Corona");

                  const iniciales = (alumno.NOMBRE_COMPLETO || "A N")
                    .split(" ").slice(0, 2).map((n) => n.charAt(0)).join("").toUpperCase();

                  return (
                    <tr key={alumno.ALUMNO_ID} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {iniciales}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800 leading-tight">{alumno.NOMBRE_COMPLETO}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{alumno.RUT}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge estado={estadoMensualidad} tooltip={`Mensualidades: ${estadoMensualidad}`} />
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge estado={estadoMateriales} tooltip={`Materiales y Aseo: ${estadoMateriales}`} />
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge estado={estadoDiaNino} tooltip={`Día del Niño: ${estadoDiaNino}`} />
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge estado={estadoCorona} tooltip={`Corona de Flores: ${estadoCorona}`} />
                      </td>
                      <td className="p-4 text-right">
                        {alumno.finanzas.totalPendiente > 0 ? (
                          <span className="font-bold text-sm text-amber-600">
                            ${alumno.finanzas.totalPendiente.toLocaleString("es-CL")}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 font-medium">$0</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {alDia ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                            Al Día
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                            Con Deuda
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {alumnosList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500 font-medium">
                      No hay alumnos registrados en este curso o está cargando la información.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* MODAL EXENCIONES PROFESOR */}
      {isExencionesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" /> Solicitudes de Exención
                </h3>
                <p className="text-sm text-slate-500 mt-1">Revisa y gestiona las peticiones de los apoderados como Profesor Jefe.</p>
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
                  <p>No hay solicitudes de exención pendientes en tu curso.</p>
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
                            {ex.fechaProfesor !== null ? (
                              <div className="text-center text-amber-600 font-medium text-xs leading-tight">
                                Ya revisado<br/>
                                <span className="text-[10px] text-slate-400 font-normal">Falta Tesorería</span>
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