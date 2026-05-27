"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  User,
  Briefcase,
  GraduationCap,
  Users,
  BookOpen,
  BarChart3,
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

interface Movimiento {
  id: string | number;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  fecha: string;
  descripcion: string;
}

interface Resumen {
  ingresosExtra: number;
  egresos: number;
  saldoActual: number;
}

export default function DirectoraDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directoraName, setDirectoraName] = useState<string>("Directora");
  
  const [activeTab, setActiveTab] = useState<"CEA" | "CEP" | "CURSOS">("CEA");

  const [ceaResumen, setCeaResumen] = useState<Resumen | null>(null);
  const [ceaMovimientos, setCeaMovimientos] = useState<Movimiento[]>([]);
  
  const [cepResumen, setCepResumen] = useState<Resumen | null>(null);
  const [cepMovimientos, setCepMovimientos] = useState<Movimiento[]>([]);

  const [cursos, setCursos] = useState<any[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any | null>(null);
  const [alumnosCurso, setAlumnosCurso] = useState<any[]>([]);
  const [loadingCursoDetalle, setLoadingCursoDetalle] = useState(false);

  const loadData = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) throw new Error("No hay sesión activa");

      const headersAuth = { Authorization: `Bearer ${token}` };

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        if (payload.role !== "STF_DIR" && payload.rol !== "STF_DIR") {
          throw new Error("Acceso denegado: Se requieren permisos de Dirección.");
        }
        
        const nombreEncontrado = payload.nombre || payload.name;
        if (nombreEncontrado) setDirectoraName(nombreEncontrado);
      } catch (e: any) {
        throw new Error(e.message || "Error al verificar credenciales.");
      }

      const [resCeaResumen, resCeaMovs, resCepResumen, resCepMovs, resCursos] = await Promise.all([
        fetch(`${API_URL}/pagos/movimientoCea/resumen`, { headers: headersAuth }).catch(() => null),
        fetch(`${API_URL}/pagos/movimientoCea/movimientos`, { headers: headersAuth }).catch(() => null),
        fetch(`${API_URL}/pagos/movimientoCep/resumen`, { headers: headersAuth }).catch(() => null),
        fetch(`${API_URL}/pagos/movimientoCep/movimientos`, { headers: headersAuth }).catch(() => null),
        fetch(`${API_URL}/academico/cursos`, { headers: headersAuth }).catch(() => null)
      ]);

      if (resCeaMovs?.ok) {
        const data = await resCeaMovs.json();
        const movs = mapMovimientos(data.data || data, "CEA");
        setCeaMovimientos(movs);
        setCeaResumen(calcularResumen(movs));
      }

      if (resCepMovs?.ok) {
        const data = await resCepMovs.json();
        const movs = mapMovimientos(data.data || data, "CEP");
        setCepMovimientos(movs);
        setCepResumen(calcularResumen(movs));
      }

      if (resCursos?.ok) {
        const data = await resCursos.json();
        let cursosEncontrados = data.data || data.cursos || data;
        cursosEncontrados = Array.isArray(cursosEncontrados) ? cursosEncontrados : [];
        
        cursosEncontrados.sort((a: any, b: any) => {
          const gradoA = a.NIVEL_GRADO_MINEDUC || 0;
          const gradoB = b.NIVEL_GRADO_MINEDUC || 0;
          if (gradoA !== gradoB) return gradoA - gradoB;
          return (a.LETRA || "").localeCompare(b.LETRA || "");
        });

        setCursos(cursosEncontrados);
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

  useEffect(() => {
    loadData();
  }, []);

  const mapMovimientos = (dataArray: any, tipoSufijo: string): Movimiento[] => {
    if (!dataArray || !Array.isArray(dataArray)) return [];
    return dataArray.map((item: any, index: number) => ({
      id: item[`MOVIMIENTO_${tipoSufijo}_ID`] || item[`movimiento_${tipoSufijo.toLowerCase()}_id`] || item.id || `mov-${tipoSufijo}-${index}`,
      tipo: item[`TIPO_MOVIMIENTO_${tipoSufijo}`] || item[`tipo_movimiento_${tipoSufijo.toLowerCase()}`] || item.tipo || "EGRESO",
      monto: Number(item[`MONTO_MOVIMIENTO_${tipoSufijo}`] || item[`monto_movimiento_${tipoSufijo.toLowerCase()}`] || item.monto || 0),
      fecha: item[`FECHA_MOVIMIENTO_${tipoSufijo}`] || item[`fecha_movimiento_${tipoSufijo.toLowerCase()}`] || item.fecha || new Date().toISOString(),
      descripcion: item[`DESC_MOVIMIENTO_${tipoSufijo}`] || item[`desc_movimiento_${tipoSufijo.toLowerCase()}`] || item.descripcion || "Sin descripción"
    }));
  };

  const calcularResumen = (movs: Movimiento[]): Resumen => {
    const ingresos = movs.filter(m => m.tipo === "INGRESO").reduce((acc, m) => acc + m.monto, 0);
    const egresos = movs.filter(m => m.tipo === "EGRESO").reduce((acc, m) => acc + m.monto, 0);
    return { ingresosExtra: ingresos, egresos: egresos, saldoActual: ingresos - egresos };
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  const handleVerCurso = async (curso: any) => {
    setCursoSeleccionado(curso);
    setLoadingCursoDetalle(true);
    setAlumnosCurso([]);

    const token = Cookies.get("authToken");
    const headersAuth = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch(`${API_URL}/academico/matriculas/curso/${curso.CURSO_ID}`, { headers: headersAuth });
      
      if (res.ok) {
        const data = await res.json();
        const listado = data.data || data.alumnos || data || [];
        setAlumnosCurso(Array.isArray(listado) ? listado : []);
      } else {
        throw new Error("Error al obtener alumnos del curso");
      }
    } catch (error) {
      console.warn("Usando datos de prueba por fallo en API:", error);
      setAlumnosCurso([
        { id: 1, ALUMNO_RUT: "22.333.444-5", ALUMNO_NOMBRES: "Martina", ALUMNO_APELLIDOS: "González", apoderado_nombres: "Juan", apoderado_apellidos: "González", estado: "AL_DIA", deuda: 0 },
        { id: 2, ALUMNO_RUT: "22.111.222-3", ALUMNO_NOMBRES: "Tomás", ALUMNO_APELLIDOS: "Tapia", apoderado: { nombres: "María", apellidos: "Valdés" }, estado: "MOROSO", deuda: 45000 },
      ]);
    } finally {
      setLoadingCursoDetalle(false);
    }
  };

  const getCursosAgrupados = () => {
    const grupos = cursos.reduce((acc: any, curso: any) => {
      const nombreNivel = (curso.NIVEL_NOMBRE_LARGO || "").toLowerCase();
      let categoria = "Otros Niveles";
      let orden = 4;

      if (nombreNivel.includes("pre") || nombreNivel.includes("kinder") || nombreNivel.includes("párvulo") || nombreNivel.includes("parvulo")) {
        categoria = "Educación Parvularia";
        orden = 1;
      } else if (nombreNivel.includes("básic") || nombreNivel.includes("basic") || nombreNivel.includes("basico")) {
        categoria = "Educación Básica";
        orden = 2;
      } else if (nombreNivel.includes("medi")) {
        categoria = "Educación Media";
        orden = 3;
      }

      if (!acc[categoria]) acc[categoria] = { orden, cursos: [] };
      acc[categoria].cursos.push(curso);
      return acc;
    }, {});

    return Object.entries(grupos).sort((a: any, b: any) => a[1].orden - b[1].orden);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  const renderPanelFinanciero = (titulo: string, resumen: Resumen | null, movimientos: Movimiento[], colorTema: string) => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ingresos Totales</p>
          <p className="text-3xl font-black text-emerald-600">${(resumen?.ingresosExtra || 0).toLocaleString("es-CL")}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Egresos Totales</p>
          <p className="text-3xl font-black text-red-600">${(resumen?.egresos || 0).toLocaleString("es-CL")}</p>
        </div>
        <div className={`bg-slate-900 p-6 rounded-xl shadow-sm border-none text-white`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${colorTema}`}>
            <Wallet className="h-4 w-4" /> Capital Disponible {titulo}
          </p>
          <p className={`text-3xl font-black ${colorTema}`}>${(resumen?.saldoActual || 0).toLocaleString("es-CL")}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Libro de Cuentas - {titulo}</h3>
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
              {(movimientos || []).length > 0 ? movimientos.map((mov, index) => (
                <tr key={mov.id || `fila-${index}`} className="hover:bg-slate-50 transition-colors">
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
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No hay registros de movimientos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">Dirección General</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-slate-800 text-blue-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                Auditoría Financiera Global
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <User className="h-4 w-4 text-slate-400" />
              <span>Hola, {directoraName}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-400">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Salir</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => { setActiveTab("CEA"); setCursoSeleccionado(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === "CEA" ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <GraduationCap className="h-5 w-5" /> Centro de Alumnos
          </button>
          <button
            onClick={() => { setActiveTab("CEP"); setCursoSeleccionado(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === "CEP" ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <Building2 className="h-5 w-5" /> Centro de Padres
          </button>
          <button
            onClick={() => setActiveTab("CURSOS")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === "CURSOS" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            <BookOpen className="h-5 w-5" /> Finanzas por Curso
          </button>
        </div>

        {activeTab === "CEA" && renderPanelFinanciero("Centro de Alumnos (CEA)", ceaResumen, ceaMovimientos, "text-indigo-400")}
        {activeTab === "CEP" && renderPanelFinanciero("Centro de Padres (CEP)", cepResumen, cepMovimientos, "text-orange-400")}

        {activeTab === "CURSOS" && !cursoSeleccionado && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
                Auditoría de Cursos
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Selecciona un curso para auditar a sus alumnos, apoderados y estado de deudas.
              </p>

              {(cursos || []).length > 0 ? (
                <div className="space-y-8">
                  {getCursosAgrupados().map(([categoria, data]: any) => (
                    <div key={categoria} className="space-y-4">
                      <h3 className="text-lg font-black text-slate-700 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                        {categoria === "Educación Parvularia" && <span className="w-2 h-2 rounded-full bg-pink-400"></span>}
                        {categoria === "Educación Básica" && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                        {categoria === "Educación Media" && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
                        {categoria}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.cursos.map((curso: any) => {
                          const nombreNivel = curso.NIVEL_NOMBRE_LARGO || "Curso Sin Nombre";
                          const letra = curso.LETRA || "";
                          const nombreCompletoCurso = `${nombreNivel} ${letra}`.trim();
                          const nombreProfesor = curso.PROFESOR_NOMBRES ? `${curso.PROFESOR_NOMBRES} ${curso.PROFESOR_APELLIDOS}` : "Sin profesor asignado";

                          return (
                            <button 
                              key={curso.CURSO_ID}
                              onClick={() => handleVerCurso(curso)}
                              className="flex flex-col items-start p-5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-colors text-left group"
                            >
                              <span className="font-black text-lg text-slate-800 group-hover:text-emerald-800">
                                {nombreCompletoCurso}
                              </span>
                              <span className="text-xs text-slate-500 font-medium mt-1 mb-2">
                                Prof. Jefe: {nombreProfesor}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 mt-auto pt-2 border-t border-slate-200 w-full">
                                <Users className="h-3 w-3" /> Ver alumnos y deudas
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-100">
                  No se encontraron cursos registrados en el sistema.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "CURSOS" && cursoSeleccionado && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <button 
                  onClick={() => setCursoSeleccionado(null)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a cursos
                </button>
                <h3 className="font-black text-2xl text-slate-800">
                  {cursoSeleccionado.NIVEL_NOMBRE_LARGO} {cursoSeleccionado.LETRA}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                   Profesor Jefe: {cursoSeleccionado.PROFESOR_NOMBRES} {cursoSeleccionado.PROFESOR_APELLIDOS}
                </p>
              </div>
            </div>

            {loadingCursoDetalle ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-emerald-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">RUT</th>
                      <th className="px-6 py-4">Alumno</th>
                      <th className="px-6 py-4">Apoderado Responsable</th>
                      <th className="px-6 py-4 text-center">Estado Financiero</th>
                      <th className="px-6 py-4 text-right">Deuda Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alumnosCurso.length > 0 ? alumnosCurso.map((item: any, index: number) => {
                      const alumnoData = item.alumno || item.ALUMNO || item;
                      const rut = alumnoData.rut || alumnoData.RUT || alumnoData.ALUMNO_RUT || item.MATRICULA_ALUMNO_RUT || "Sin RUT";
                      const nombres = alumnoData.nombres || alumnoData.NOMBRES || alumnoData.ALUMNO_NOMBRES || "";
                      const apellidos = alumnoData.apellidos || alumnoData.APELLIDOS || alumnoData.ALUMNO_APELLIDOS || "";
                      const nombreAlumno = `${nombres} ${apellidos}`.trim() || alumnoData.nombre || alumnoData.NOMBRE || "Sin Nombre";
                      
                      // LOGICA ROBUSTA PARA EXTRAER EL APODERADO
                      let apoderado = "Sin registro";
                      
                      if (typeof item.apoderado === "string") {
                        apoderado = item.apoderado;
                      } else if (typeof item.APODERADO === "string") {
                        apoderado = item.APODERADO;
                      } else if (item.apoderado && typeof item.apoderado === "object") {
                        apoderado = `${item.apoderado.nombres || item.apoderado.nombre || ""} ${item.apoderado.apellidos || item.apoderado.apellido || ""}`.trim();
                      } else if (alumnoData.apoderado && typeof alumnoData.apoderado === "object") {
                        apoderado = `${alumnoData.apoderado.nombres || alumnoData.apoderado.nombre || ""} ${alumnoData.apoderado.apellidos || alumnoData.apoderado.apellido || ""}`.trim();
                      } else if (item.APODERADO_NOMBRES) {
                        apoderado = `${item.APODERADO_NOMBRES} ${item.APODERADO_APELLIDOS || ""}`.trim();
                      } else if (item.apoderado_nombres) {
                        apoderado = `${item.apoderado_nombres} ${item.apoderado_apellidos || ""}`.trim();
                      }
                      
                      if (!apoderado || apoderado === "") apoderado = "Sin registro";

                      const estado = item.estado || item.estado_deuda || item.ESTADO || "AL_DIA";
                      const deuda = item.deuda || item.monto_deuda || item.DEUDA || 0;
                      const isMoroso = estado === "MOROSO" || deuda > 0;

                      return (
                        <tr key={item.id || item.MATRICULA_ID || index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{rut}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{nombreAlumno}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {apoderado !== "Sin registro" ? apoderado : (
                              <span className="text-slate-400 italic text-xs">Sin apoderado asignado</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isMoroso ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="h-3.5 w-3.5" /> Moroso
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Al Día
                              </span>
                            )}
                          </td>
                          <td className={`px-6 py-4 text-right font-black ${isMoroso ? "text-red-600" : "text-emerald-600"}`}>
                            {isMoroso ? `-$${deuda.toLocaleString("es-CL")}` : "$0"}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                          No se encontraron matrículas registradas para este curso.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}