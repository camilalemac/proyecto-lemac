"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  GraduationCap, 
  LogOut, 
  User,
  Info,
  BookOpen,
  Users, 
  ArrowRightLeft
} from "lucide-react";

// --- INTERFACES ---
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

interface ResumenFinanciero {
  totalPendiente: number;
  totalPagado: number;
  cobros: Cuota[];
}

// --- FUNCIÓN PREDICTIVA TODO TERRENO ---
const esCobroFamiliar = (cuota: any): boolean => {
  const nombreConcepto = cuota.concepto?.NOMBRE || cuota.concepto?.nombre || "";
  const descripcionCobro = cuota.DESCRIPCION || cuota.descripcion || "";
  const nombreCategoria = cuota.concepto?.categoria?.NOMBRE || cuota.concepto?.categoria?.nombre || "";

  const textoCompleto = `${nombreConcepto} ${descripcionCobro} ${nombreCategoria}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); 

  const esMateriales = textoCompleto.includes("materiales") && textoCompleto.includes("aseo");
  const esDiaNino = textoCompleto.includes("dia del nino") || textoCompleto.includes("aporte dia");
  const esCoronaFlores = textoCompleto.includes("corona flores") || textoCompleto.includes("cuota extra corona");

  return esMateriales || esDiaNino || esCoronaFlores;
};

export default function AlumnoDashboard() {
  const router = useRouter();

  const [finanzas, setFinanzas] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Alumno");
  const [userCurso, setUserCurso] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // <-- Estado para almacenar el rol
  
  // Filtro de Estado
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "PENDIENTE" | "PAGADO">("TODOS");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

  useEffect(() => {
    const fetchDatosAlumno = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        let alumnoIdDesdeToken: number | null = null;

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
          
          const rolUsuario = payload.role || payload.rol;
          setUserRole(rolUsuario); // <-- Guardamos el rol en el estado de React

          if (rolUsuario !== "ALU_REG" && rolUsuario !== "DIR_TES_ALU" && rolUsuario !== "DIR_SEC_ALU" && rolUsuario !== "DIR_PRES_ALU" && rolUsuario !== "CEN_PRES_CAL" && rolUsuario !== "CEN_TES_CAL" && rolUsuario !== "CEN_SEC_CAL") {
            throw new Error("Acceso denegado: No tienes un rol de alumno válido.");
          }

          alumnoIdDesdeToken = payload.userId || payload.alumnoId || payload.id;
          
          const nombreEncontrado = payload.nombre || payload.nombres || payload.name;
          if (nombreEncontrado) {
            setUserName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
          }
          
          if (payload.curso) {
            setUserCurso(payload.curso);
          }
        } catch (e: any) {
          throw new Error(e.message || "No se pudo verificar la identidad del alumno.");
        }

        if (!alumnoIdDesdeToken) throw new Error("No se encontró el ID del alumno en la sesión.");

        // 2. Obtener información de perfil del alumno
        try {
          const perfilRes = await fetch(`${API_URL}/identity/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (perfilRes.ok) {
            const perfilJson = await perfilRes.json();
            
            if (perfilJson.data?.academico?.curso) {
              setUserCurso(perfilJson.data.academico.curso);
            }
            if (perfilJson.data?.perfil?.nombres) {
              const nombreLimpio = perfilJson.data.perfil.nombres.split(' ')[0]; 
              const apellidoLimpio = perfilJson.data.perfil.apellidos ? perfilJson.data.perfil.apellidos.split(' ')[0] : '';
              setUserName(`${nombreLimpio} ${apellidoLimpio}`);
            }
          }
        } catch (perfilErr) {
          console.warn("No se pudo mapear el curso desde el módulo de identidad:", perfilErr);
        }

        // 3. Buscar Finanzas del Alumno Autenticado
        const res = await fetch(`${API_URL}/pagos/cobros/alumno/${alumnoIdDesdeToken}/resumen`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`Error al obtener cartola (Código ${res.status})`);
        
        const json = await res.json();
        setFinanzas(json.data);
      } catch (err: any) {
        setError(err.message);
        if (err.message.includes("Acceso denegado") || err.message.includes("sesión")) {
          setTimeout(() => router.push("/"), 2500);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDatosAlumno();
  }, [API_URL, router]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  // --- SEPARACIÓN DE COBROS ---
  const cobrosFiltrados = finanzas?.cobros?.filter(cuota => filtroEstado === "TODOS" || cuota.ESTADO === filtroEstado) || [];
  const cobrosMensualidades = cobrosFiltrados.filter(cuota => !esCobroFamiliar(cuota));
  const cobrosFamiliares = cobrosFiltrados.filter(cuota => esCobroFamiliar(cuota));

  // Renderizador de Tarjetas (Para no repetir código)
  const renderCuotaCard = (cuota: Cuota) => {
    const montoPendiente = Number(cuota.MONTO_ORIGINAL) - Number(cuota.MONTO_PAGADO);
    
    return (
      <div 
        key={cuota.COBRO_ID} 
        className="relative overflow-hidden flex flex-col rounded-xl p-5 bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md"
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          cuota.ESTADO === "PAGADO" ? "bg-emerald-500" : 
          cuota.ESTADO === "PENDIENTE" ? "bg-amber-500" : 
          cuota.ESTADO === "VENCIDO" ? "bg-red-500" : "bg-slate-400"
        }`} />

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
              {cuota.concepto?.categoria?.NOMBRE || "General"}
            </span>
            <h3 className="font-semibold text-slate-800 leading-tight">
              {cuota.concepto?.NOMBRE || "Cobro"}
            </h3>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
            cuota.ESTADO === "PAGADO" ? "bg-emerald-100 text-emerald-700" :
            cuota.ESTADO === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
            cuota.ESTADO === "VENCIDO" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
          }`}>{cuota.ESTADO}</span>
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Monto</p>
          <span className="text-2xl font-extrabold text-slate-900">
            ${(cuota.ESTADO === "PAGADO" ? Number(cuota.MONTO_ORIGINAL) : montoPendiente).toLocaleString("es-CL")}
          </span>
          
          {Number(cuota.MONTO_PAGADO || 0) > 0 && cuota.ESTADO !== "PAGADO" && (
            <p className="text-xs text-slate-500 mt-1">
              Abonado: <span className="font-medium text-emerald-600">${Number(cuota.MONTO_PAGADO).toLocaleString("es-CL")}</span>
            </p>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>Vencimiento:</span>
          <span className="font-semibold text-slate-700">
            {new Date(cuota.FECHA_VENCIMIENTO).toLocaleDateString("es-CL", { timeZone: "UTC" })}
          </span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16">
      
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><GraduationCap className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-150">Portal Alumno</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-blue-600" /><span>Hola, {userName}</span>
              {userCurso && <span className="bg-blue-200 text-blue-800 font-bold px-1.5 py-0.2 rounded text-[11px] ml-1">{userCurso}</span>}
            </div>

            {/* BOTÓN CAMBIO DE VISTA EXCLUSIVO PARA SECRETARIOS */}
            {userRole === "DIR_SEC_ALU" && (
              <button 
                onClick={() => router.push("/secretario-alu")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Volver al Portal de Secretaría"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Secretario</span>
              </button>
            )}

            {/* BOTÓN CAMBIO DE VISTA EXCLUSIVO PARA TESOREROS */}
            {userRole === "DIR_TES_ALU" && (
              <button 
                onClick={() => router.push("/tesorero-alu")} 
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Volver al Portal de Tesorería"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Tesorero</span>
              </button>
            )}

            {userRole === "DIR_PRES_ALU" && (
              <button 
                onClick={() => router.push("/presidente-alu")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Volver al Portal de Presidencia"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Presidente</span>
              </button>
            )}
            
            {userRole === "CEN_PRES_CAL" && (
              <button 
                onClick={() => router.push("/presidente-cea")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Volver al Portal de Presidencia"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Presidente Centro Alumnos</span>
              </button>
            )}

            
            {userRole === "CEN_TES_CAL" && (
              <button 
                onClick={() => router.push("/tesorero-cea")} 
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Volver al Portal de Tesorería"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Tesorero Centro Alumnos</span>
              </button>
            )}
            {userRole === "CEN_SEC_CAL" && (
              <button 
                onClick={() => router.push("/secretario-cea")} 
                className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Volver al Portal de Secretaría"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Secretario CEA</span>
              </button>
            )}

            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600 hover:border-red-200">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* CABECERO CON DETALLE DE CURSO */}
        <header className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Estado de Cuentas</h1>
            <p className="text-slate-500 mt-1">Consulta tus cuotas vigentes, vencidas e historial de pagos</p>
          </div>
          {userCurso && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3 self-start sm:self-center shadow-sm animate-in fade-in duration-300">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Curso Actual</p>
                <p className="text-base font-black text-blue-900">{userCurso}</p>
              </div>
            </div>
          )}
        </header>

        {/* TARJETAS INFORMATIVAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Pagado a la Fecha</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">${(finanzas?.totalPagado || 0).toLocaleString("es-CL")}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg"><Info className="h-6 w-6" /></div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Pendiente / Por Pagar</p>
              <p className="text-2xl font-black text-amber-600 mt-1">${(finanzas?.totalPendiente || 0).toLocaleString("es-CL")}</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg"><AlertCircle className="h-6 w-6" /></div>
          </div>
        </div>

        {/* CONTROLES DE FILTRO */}
        {finanzas && finanzas.cobros && finanzas.cobros.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" /> Registro de Cuotas
            </h2>
            <div className="flex bg-slate-200/60 p-1 rounded-lg w-fit">
              {(["TODOS", "PENDIENTE", "PAGADO"] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filtroEstado === estado ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {estado === "TODOS" ? "Todas" : estado === "PENDIENTE" ? "Por Pagar" : "Pagadas"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DETALLE DE CUOTAS */}
        {finanzas && finanzas.cobros && finanzas.cobros.length > 0 ? (
          <div className="space-y-10">
            
            {/* SECCIÓN 1: Mensualidades */}
            {cobrosMensualidades.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
                  Mensualidades y Aranceles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cobrosMensualidades.map(renderCuotaCard)}
                </div>
              </section>
            )}

            {/* SECCIÓN 2: Cobros Familiares */}
            {cobrosFamiliares.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Cobros Generales del Grupo Familiar
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cobrosFamiliares.map(renderCuotaCard)}
                </div>
              </section>
            )}

            {/* Mensaje de vacío si el filtro oculta todo */}
            {cobrosMensualidades.length === 0 && cobrosFamiliares.length === 0 && (
               <div className="bg-slate-50 p-8 rounded-xl text-center border border-dashed border-slate-300">
                 <p className="text-slate-500 font-medium">No se encontraron cuotas para el estado seleccionado.</p>
               </div>
            )}

          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl text-center border border-slate-200 shadow-sm mt-8">
            <p className="text-slate-500 font-medium">No registras cuotas asociadas en este periodo académico.</p>
          </div>
        )}
      </main>

    </div>
  );
}