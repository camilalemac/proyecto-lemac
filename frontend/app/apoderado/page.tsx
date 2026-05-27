"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  Users, 
  AlertCircle, 
  DollarSign, 
  CheckCircle, 
  GraduationCap, 
  LogOut, 
  User,
  CreditCard,
  CheckSquare,
  Square,
  Info,
  Home,
  ArrowLeftRight,
  HelpCircle,
  X,
  Clock,
  XCircle
} from "lucide-react";

// --- INTERFACES ---
interface Alumno {
  alumnoId: number;
  nombres: string;
  apellidos: string;
  rutCompleto: string | null;
  curso?: string;
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
  ESTADO: "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO" | "EXIMIDO" | "EXENTO"; 
  FECHA_EMISION: string;
  FECHA_VENCIMIENTO: string;
  concepto?: Concepto;
  exencion_estado?: string;
  ESTADO_EXENCION?: string;
  exencionEstado?: string;
  exencion?: {
    ESTADO_FINAL: string;
    OBSERVACION_TESORERO?: string;
    [key: string]: any;
  };
  [key: string]: any; // Tolerancia para propiedades dinámicas extras del backend
}

interface ResumenFinanciero {
  totalPendiente: number;
  totalPagado: number;
  cobros: Cuota[];
}

export default function ApoderadoDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const estadoPago = searchParams.get("pago");

  const [hijos, setHijos] = useState<Alumno[]>([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number | null>(null);
  const [finanzas, setFinanzas] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userName, setUserName] = useState<string>("Apoderado");
  const [userRole, setUserRole] = useState<string | string[]>("");
  
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "PENDIENTE" | "PAGADO">("TODOS");
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<number[]>([]);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const [modalExencionOpen, setModalExencionOpen] = useState(false);
  const [cobroParaExencion, setCobroParaExencion] = useState<number | null>(null);
  const [motivoExencion, setMotivoExencion] = useState("");
  const [procesandoExencion, setProcesandoExencion] = useState(false);
  const [errorExencion, setErrorExencion] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";
  const COMISION_MP_PORCENTAJE = 4.15;
  const alumnoActual = hijos.find(h => h.alumnoId === hijoSeleccionado);

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

  useEffect(() => {
    if (estadoPago) {
      if (estadoPago === "exito") {
        alert("¡Muchas gracias! Tu pago se ha realizado. En unos instantes se actualizará tu cartola.");
        setCuotasSeleccionadas([]); 
      } else if (estadoPago === "fallido") {
        alert("El pago no se pudo procesar o fue cancelado. Por favor, intenta nuevamente.");
      } else if (estadoPago === "pendiente") {
        alert("Tu pago está pendiente de confirmación por el medio de pago.");
      }

      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [estadoPago]);

  useEffect(() => {
    const fetchHijos = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
          );
          const payload = JSON.parse(jsonPayload);
          const role = payload.role || payload.rol || "";
          setUserRole(role);

          const rolesPermitidos = ["FAM_APO", "DIR_PRES_APO", "DIR_TES_APO", "DIR_SEC_APO", "CEN_TES_CAP", "CEN_PRES_CAP", "CEN_SEC_CAP"];
          const tieneRolValido = Array.isArray(role)
            ? role.some((r: string) => rolesPermitidos.includes(r))
            : rolesPermitidos.includes(role);

          if (!tieneRolValido) {
            throw new Error("Acceso denegado: Tu rol no tiene autorización para ver el portal de apoderados.");
          }

          const nombreEncontrado = payload.nombres || payload.nombre || payload.name || payload.email;
          if (nombreEncontrado) {
            setUserName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
          }
        } catch (e: any) {
          if (e.message.includes("Acceso denegado")) throw e;
          console.warn("No se pudo decodificar el payload del token");
        }

        const res = await fetch(`${API_URL}/identity/mis-hijos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (!res.ok || json.success === false) {
          throw new Error(json.message || `Error del servidor (Código ${res.status})`);
        }
        
        setHijos(json.data || []);
        if (json.data && json.data.length > 0) {
          setHijoSeleccionado(json.data[0].alumnoId);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHijos();
  }, [API_URL]);

  const fetchFinanzas = async () => {
    if (!hijoSeleccionado) return;
    try {
      setFiltroEstado("TODOS"); 
      setCuotasSeleccionadas([]); 
      
      const token = Cookies.get("authToken");
      const res = await fetch(`${API_URL}/pagos/cobros/alumno/${hijoSeleccionado}/resumen`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.message || `Error del servidor (Código ${res.status})`);
      }
      
      setFinanzas(json.data);
    } catch (err: any) {
      console.error("Error al buscar finanzas:", err.message);
    }
  };

  useEffect(() => {
    fetchFinanzas();
  }, [hijoSeleccionado, API_URL]);

  const handleToggleCuota = (cobroId: number, estExencion: string | null) => {
    if (estExencion === "APROBADO" || estExencion === "PENDIENTE" || estExencion === "EXIMIDO") return;
    setCuotasSeleccionadas(prev => 
      prev.includes(cobroId) ? prev.filter(id => id !== cobroId) : [...prev, cobroId]
    );
  };

  const calcularSubtotal = () => {
    if (!finanzas || !finanzas.cobros) return 0;
    return finanzas.cobros
      .filter(c => cuotasSeleccionadas.includes(c.COBRO_ID))
      .reduce((sum, c) => sum + (Number(c.MONTO_ORIGINAL) - Number(c.MONTO_PAGADO)), 0);
  };

  const handleIrAPagar = async () => {
    if (cuotasSeleccionadas.length === 0) return;
    try {
      setProcesandoPago(true);
      const token = Cookies.get("authToken");
      const res = await fetch(`${API_URL}/pagos/pasarela/checkout/mercadopago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cobrosIds: cuotasSeleccionadas })
      });
      if (!res.ok) {
        throw new Error("Ocurrió un error al contactar con la pasarela de pago.");
      }

      const json = await res.json();
      if (json.success && json.data.init_point) {
        window.location.href = json.data.init_point;
      } else {
        throw new Error("No se pudo generar el enlace de pago seguro.");
      }

    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setProcesandoPago(false);
    }
  };

  const handleSubmitExencion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cobroParaExencion || !motivoExencion.trim()) return;

    setProcesandoExencion(true);
    setErrorExencion(null);
    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`${API_URL}/pagos/exenciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ COBRO_ID: cobroParaExencion, MOTIVO: motivoExencion })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al solicitar la exención");
      }

      alert("Solicitud de exención enviada y en espera de revisión.");
      setModalExencionOpen(false);
      setMotivoExencion("");
      setCobroParaExencion(null);
      fetchFinanzas();
    } catch (err: any) {
      setErrorExencion(err.message);
    } finally {
      setProcesandoExencion(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  const subtotal = calcularSubtotal();
  const recargoMP = Math.round(subtotal * (COMISION_MP_PORCENTAJE / 100));
  const totalFinal = subtotal + recargoMP;

  const renderCardCuota = (cuota: Cuota) => {
    // ==========================================
    // ¡DEBUGGER DE BACKEND EN CONSOLA (F12)!
    // ==========================================
    console.log(`[LJRE DEBUG] Propiedades de la cuota ID ${cuota.COBRO_ID}:`, cuota);

    // 1. Obtener y limpiar estado principal
    const estadoCuotaLimpio = String(cuota.ESTADO || "").toUpperCase().trim();

    // 2. Extraer el estado de exención de forma hiper-segura y normalizada
    let estadoExencionRaw: string | null = null;
    
    if (cuota.exencion) {
      estadoExencionRaw = cuota.exencion.ESTADO_FINAL || cuota.exencion.estadoFinal || cuota.exencion.ESTADO || cuota.exencion.estado;
    }
    if (!estadoExencionRaw) {
      estadoExencionRaw = cuota.exencion_estado || cuota.exencionEstado || cuota.ESTADO_EXENCION || cuota.estadoExencion || cuota.ESTADO_FINAL;
    }

    const estadoExencion = estadoExencionRaw ? String(estadoExencionRaw).toUpperCase().trim() : null;

    // 3. Evaluar banderas lógicas de exención cruzando todas las opciones posibles
    const esEximido = 
      estadoExencion === "APROBADO" || 
      estadoExencion === "EXIMIDO" || 
      estadoCuotaLimpio === "EXIMIDO" || 
      estadoCuotaLimpio === "EXENTO";

    const esPendienteRevision = 
      estadoExencion === "PENDIENTE" || 
      estadoExencion === "REVISION" || 
      estadoExencion === "ESPERA" ||
      estadoCuotaLimpio === "PENDIENTE_EXENCION";

    const esRechazado = estadoExencion === "RECHAZADO";

    // 4. Condiciones de acciones en interfaz
    const esPagado = estadoCuotaLimpio === "PAGADO";
    const sePuedePagar = (estadoCuotaLimpio === "PENDIENTE" || estadoCuotaLimpio === "VENCIDO") && !esEximido && !esPendienteRevision;
    const isFamiliar = esCobroFamiliar(cuota);
    
    // Solo puede pedir si es familiar, está pendiente de pago y no existe proceso previo
    const sePuedePedirExencion = isFamiliar && (estadoCuotaLimpio === "PENDIENTE" || estadoCuotaLimpio === "VENCIDO") && !esPagado && !esEximido && !esPendienteRevision && !esRechazado && !estadoExencion;

    const estaSeleccionada = cuotasSeleccionadas.includes(cuota.COBRO_ID);
    const montoPendiente = Number(cuota.MONTO_ORIGINAL) - Number(cuota.MONTO_PAGADO);

    // Extraer feedback de tesorería flexible
    const observacionTesorero = cuota.exencion?.OBSERVACION_TESORERO || cuota.exencion?.observacionTesorero || cuota.observacion_tesorero || cuota.observacionTesorero;

    return (
      <div 
        key={cuota.COBRO_ID} 
        onClick={() => sePuedePagar && handleToggleCuota(cuota.COBRO_ID, estadoExencion || (esEximido ? "APROBADO" : null))}
        className={`relative overflow-hidden flex flex-col rounded-xl p-5 transition-all border ${
          estaSeleccionada 
            ? "bg-blue-50/50 border-blue-500 shadow-md ring-1 ring-blue-500" 
            : esEximido
            ? "bg-emerald-50/40 border-emerald-200 shadow-sm"
            : "bg-white border-slate-200 shadow-sm hover:shadow-md"
        } ${sePuedePagar ? "cursor-pointer" : "cursor-default"}`}
      >
        {/* Barra lateral indicadora de color */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          esEximido || esPagado ? "bg-emerald-500" : 
          esPendienteRevision ? "bg-indigo-500" :
          estadoCuotaLimpio === "PENDIENTE" ? "bg-amber-500" : 
          estadoCuotaLimpio === "VENCIDO" ? "bg-red-500" : "bg-slate-400"
        }`} />

        <div className="flex justify-between items-start mb-4 pl-2">
          <div className="flex gap-3">
            {sePuedePagar && (
              <div className="mt-1 text-slate-400">
                {estaSeleccionada ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5" />}
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                {cuota.concepto?.categoria?.NOMBRE || "General"}
              </span>
              <h3 className="font-semibold text-slate-800 leading-tight">
                {cuota.concepto?.NOMBRE || "Cobro"}
              </h3>
            </div>
          </div>
          
          {/* Badge del Estado Principal */}
          <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
            esEximido ? "bg-emerald-100 text-emerald-800" :
            esPagado ? "bg-emerald-100 text-emerald-700" :
            estadoCuotaLimpio === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
            estadoCuotaLimpio === "VENCIDO" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
          }`}>
            {esEximido ? "EXIMIDO" : estadoCuotaLimpio}
          </span>
        </div>

        <div className={`pl-2 mb-2 ${sePuedePagar ? "ml-8" : ""}`}>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${esEximido ? "text-slate-400 line-through" : "text-slate-900"}`}>
              ${montoPendiente.toLocaleString("es-CL")}
            </span>
          </div>
          {Number(cuota.MONTO_PAGADO || 0) > 0 && !esPagado && !esEximido && (
            <p className="text-xs text-slate-500 mt-1">Abonado: <span className="font-medium text-emerald-600">${Number(cuota.MONTO_PAGADO).toLocaleString("es-CL")}</span></p>
          )}

          {/* ========================================================= */}
          {/* BLOQUE DINÁMICO DE VISUALIZACIÓN DE EXENCIONES             */}
          {/* ========================================================= */}
          
          {/* Caso 1: Se puede solicitar exención */}
          {sePuedePedirExencion && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setCobroParaExencion(cuota.COBRO_ID);
                setModalExencionOpen(true);
              }}
              className="mt-3 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors w-fit flex items-center gap-1.5 border border-indigo-100"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Solicitar Exención
            </button>
          )}

          {/* Caso 2: Solicitud ingresada y pendiente de evaluación */}
          {esPendienteRevision && (
            <div className="mt-3 text-xs bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-indigo-800 flex items-start gap-2 max-w-xs animate-pulse">
              <Clock className="h-4 w-4 mt-0.5 text-indigo-500 flex-shrink-0" />
              <div>
                <p className="font-semibold">Exención en revisión</p>
                <p className="text-[11px] text-indigo-600/90 mt-0.5">La solicitud espera la aprobación de Tesorería.</p>
              </div>
            </div>
          )}

          {/* Caso 3: Solicitud Aprobada de Exención */}
          {esEximido && (
            <div className="mt-3 text-xs bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-emerald-800 flex items-start gap-2 max-w-xs">
              <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-900">¡Exención Aprobada!</p>
                <p className="text-[11px] text-emerald-700/90 mt-0.5">Se le ha liberado del pago de esta cuota extraordinaria.</p>
              </div>
            </div>
          )}

          {/* Caso 4: Solicitud Evaluada y Rechazada */}
          {esRechazado && (
            <div className="mt-3 text-xs bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-rose-800 flex flex-col gap-1.5 max-w-xs">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 mt-0.5 text-rose-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-rose-900">Exención Rechazada</p>
                  <p className="text-[11px] text-rose-700/90 mt-0.5">La solicitud no fue autorizada. Debe proceder con el pago regular.</p>
                </div>
              </div>
              {observacionTesorero && (
                <div className="text-[11px] bg-white/70 p-1.5 rounded border border-rose-100 text-slate-600 italic">
                  Motivo: "{observacionTesorero}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filtrado de cobros cruzando estados de exención en frontend
  const cobrosBase = finanzas?.cobros?.filter(cuota => {
    const estadoCuotaLimpio = String(cuota.ESTADO || "").toUpperCase().trim();
    const estadoExencionRaw = cuota.exencion?.ESTADO_FINAL || cuota.exencion_estado || cuota.ESTADO_EXENCION || "";
    const esEximido = String(estadoExencionRaw).toUpperCase() === "APROBADO" || estadoCuotaLimpio === "EXIMIDO" || estadoCuotaLimpio === "EXENTO";

    if (filtroEstado === "TODOS") return true;
    if (filtroEstado === "PAGADO") return estadoCuotaLimpio === "PAGADO";
    if (filtroEstado === "PENDIENTE") return (estadoCuotaLimpio === "PENDIENTE" || estadoCuotaLimpio === "VENCIDO") && !esEximido;
    return true;
  }) || [];
  
  const cobrosMensualidades = cobrosBase.filter(cuota => !esCobroFamiliar(cuota));
  const cobrosFamiliares = cobrosBase.filter(cuota => esCobroFamiliar(cuota));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-36">
      
      {/* NAVBAR SUPERIOR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><GraduationCap className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-150">Portal de Pagos</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-blue-600" /><span>Hola, {userName}</span>
            </div>

            {userRole.includes("DIR_TES_APO") && (
              <button 
                onClick={() => router.push("/tesorero-apo")} 
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline-block">Ir a Tesorería</span>
              </button>
            )}

            {userRole.includes("DIR_SEC_APO") && (
              <button 
                onClick={() => router.push("/secretario-apo")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Ir al Portal de Secretaría"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Secretario</span>
              </button>
            )}
              
            {userRole.includes("DIR_PRES_APO") && (
              <button 
                onClick={() => router.push("/presidente-apo")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Ir al Portal de Presidencia"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Presidente</span>
              </button>
            )}
              
            {userRole.includes("CEN_TES_CAP") && (
              <button 
                onClick={() => router.push("/tesorero-cep")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Ir al Portal de Secretaría"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Secretario</span>
              </button>
            )}
              
            {userRole.includes("CEN_PRES_CAP") && (
              <button 
                onClick={() => router.push("/presidente-cep")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Ir al Portal de Presidencia"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Presidente</span>
              </button>
            )}
              
            {userRole.includes("CEN_SEC_CAP") && (
              <button 
                onClick={() => router.push("/secretario-cep")} 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                title="Ir al Portal de Secretaría"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline-block">Vista Secretario</span>
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
        
        <header className="mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Portal del Apoderado</h1>
          <p className="text-slate-500 mt-1">Revisa el estado de cuenta y selecciona las cuotas a pagar</p>
        </header>

        {/* SELECTOR DE HIJOS */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-blue-600 h-5 w-5" />
            <h2 className="text-lg font-semibold text-slate-800">Mi Grupo Familiar</h2>
          </div>
          
          {hijos.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> No tienes alumnos asociados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hijos.map((hijo) => {
                return (
                  <button
                    key={hijo.alumnoId}
                    onClick={() => setHijoSeleccionado(hijo.alumnoId)}
                    className={`p-4 rounded-xl border text-left transition-all shadow-sm flex flex-col justify-between relative overflow-hidden h-28 ${
                      hijoSeleccionado === hijo.alumnoId ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className={`font-bold text-base ${hijoSeleccionado === hijo.alumnoId ? "text-blue-800" : "text-slate-800"}`}>
                        {hijo.nombres} {hijo.apellidos}
                      </p>
                      <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                        <p><span className="font-medium text-slate-400">RUT:</span> {hijo.rutCompleto || "No registrado"}</p>
                        <p><span className="font-medium text-slate-400">Curso:</span> <span className="bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">{hijo.curso}</span></p>
                      </div>
                    </div>
                    {hijoSeleccionado === hijo.alumnoId && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* DETALLE DE CUOTAS */}
        {finanzas && finanzas.cobros && finanzas.cobros.length > 0 && (
          <section className="mt-8 space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Estado de Cuentas</h2>
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

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Home className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-base tracking-tight">Cobros Generales del Grupo Familiar</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-150 font-medium px-2 py-0.5 rounded-full">
                  1 por Familia
                </span>
              </div>
              
              {cobrosFamiliares.length === 0 ? (
                <p className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  No hay cobros familiares registrados o pendientes con el filtro actual.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cobrosFamiliares.map(renderCardCuota)}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-slate-700">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-base tracking-tight">
                  Mensualidades y Colegiaturas de: <span className="text-blue-700">{alumnoActual?.nombres || "Alumno"}</span>
                </h3>
              </div>

              {cobrosMensualidades.length === 0 ? (
                <p className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  No hay mensualidades registradas para este alumno con el filtro actual.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cobrosMensualidades.map(renderCardCuota)}
                </div>
              )}
            </div>

          </section>
        )}
      </main>

      {/* FOOTER DE PAGO */}
      {cuotasSeleccionadas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex w-full md:w-auto flex-col sm:flex-row items-center gap-6 md:gap-12">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 hidden sm:block">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{cuotasSeleccionadas.length} cuotas seleccionadas</p>
                  <p className="text-xl font-semibold text-slate-800">Subtotal: ${subtotal.toLocaleString("es-CL")}</p>
                </div>
              </div>

              <div className="w-full sm:w-auto bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Recargo por servicio ({COMISION_MP_PORCENTAJE}%)</p>
                  <p className="text-sm font-bold text-slate-700">+ ${recargoMP.toLocaleString("es-CL")}</p>
                </div>
              </div>
            </div>
            
            <div className="flex w-full md:w-auto items-center justify-between sm:justify-end gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total a Pagar</p>
                <p className="text-3xl font-black text-blue-600 leading-none">${totalFinal.toLocaleString("es-CL")}</p>
              </div>
              
              <button
                onClick={handleIrAPagar}
                disabled={procesandoPago}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold shadow-sm shadow-blue-200 transition-colors flex items-center justify-center gap-2 ${
                  procesandoPago 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {procesandoPago ? (
                  <><Loader2 className="animate-spin h-5 w-5" /> Procesando...</>
                ) : (
                  "Pagar con MercadoPago"
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL DE EXENCIÓN */}
      {modalExencionOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => {
                setModalExencionOpen(false);
                setMotivoExencion("");
                setErrorExencion(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Solicitar Exención</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-5">
              Por favor, detalla el motivo de fuerza mayor por el cual solicitas la exención de este cobro extraordinario. La solicitud pasará por la revisión del Profesor Jefe y Tesorería.
            </p>
            
            <form onSubmit={handleSubmitExencion}>
              <textarea
                className="w-full border border-slate-300 rounded-xl p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow resize-none"
                rows={4}
                placeholder="Escribe el motivo detallado aquí..."
                value={motivoExencion}
                onChange={(e) => setMotivoExencion(e.target.value)}
                required
              />
              
              {errorExencion && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{errorExencion}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalExencionOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 font-medium rounded-lg hover:bg-slate-200 transition"
                  disabled={procesandoExencion}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                  disabled={procesandoExencion || !motivoExencion.trim()}
                >
                  {procesandoExencion ? (
                    <><Loader2 className="animate-spin h-4 w-4" /> Enviando...</>
                  ) : (
                    "Enviar Solicitud"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}