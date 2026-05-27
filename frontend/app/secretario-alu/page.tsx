"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Loader2, 
  AlertCircle, 
  LogOut, 
  Printer,
  User,
  ArrowRightLeft,
  FileText,
  Users
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

export default function SecretarioAlumnoDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [secretarioName, setSecretarioName] = useState<string>("Alumno Secretario");
  const [actaText, setActaText] = useState<string>("");

  useEffect(() => {
    const fetchDatosSecretario = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) throw new Error("No hay sesión activa");

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
          
          if (payload.role !== "DIR_SEC_ALU" && payload.rol !== "DIR_SEC_ALU") {
            throw new Error("Acceso denegado: Esta vista es exclusiva para la Secretaría Estudiantil.");
          }
          
          const nombreEncontrado = payload.nombre || payload.nombres || payload.name;
          if (nombreEncontrado) {
            setSecretarioName(nombreEncontrado.includes('@') ? nombreEncontrado.split('@')[0] : nombreEncontrado);
          }
        } catch (e: any) {
          throw new Error(e.message || "No se pudo verificar la identidad del usuario.");
        }

        // 2. Obtener información de perfil para el nombre
        try {
          const perfilRes = await fetch(`${API_URL}/identity/me`, { headers: headersAuth });
          if (perfilRes.ok) {
            const perfilJson = await perfilRes.json();
            if (perfilJson.data?.perfil?.nombres) {
              const nombreLimpio = perfilJson.data.perfil.nombres.split(' ')[0]; 
              const apellidoLimpio = perfilJson.data.perfil.apellidos ? perfilJson.data.perfil.apellidos.split(' ')[0] : '';
              setSecretarioName(`${nombreLimpio} ${apellidoLimpio}`);
            }
          }
        } catch (perfilErr) {
          console.warn("No se pudo mapear el nombre desde el módulo de identidad.", perfilErr);
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

    fetchDatosSecretario();
  }, []);

  const handleLogout = () => {
    Cookies.remove("authToken");
    router.push("/");
  };

  const handleImprimirActa = () => {
    if (!actaText.trim()) {
      alert("El acta está vacía. Escribe algo antes de imprimir.");
      return;
    }
    window.print();
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center print:hidden"><div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 flex items-center gap-3 shadow-sm"><AlertCircle /> {error}</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 pb-16 print:bg-white print:pb-0">
      
      {/* NAVBAR (Se oculta al imprimir) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><FileText className="h-6 w-6" /></div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:inline-block">Liceo Juana Ross de Edwards</span>
              <span className="font-bold text-xl tracking-tight text-slate-800 sm:hidden">LJRE</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">Portal Secretaría Estudiantil</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {secretarioName}</span>
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

            <button onClick={handleLogout} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600 hover:border-red-200">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:p-0 print:m-0">
        
        {/* HEADER DE LA SECCIÓN (Se oculta al imprimir) */}
        <header className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Actas de Consejo de Curso
            </h1>
            <p className="text-slate-500 mt-1">
              Redacta los acuerdos de la reunión del curso e imprime el documento físico.
            </p>
          </div>
          <button 
            onClick={handleImprimirActa} 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-md sm:w-auto w-full"
          >
            <Printer className="h-5 w-5" />
            Imprimir Acta
          </button>
        </header>

        {/* ÁREA DE TRABAJO DEL ACTA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col print:border-none print:shadow-none print:rounded-none">
          
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:hidden">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documento de Reunión
            </h2>
            <span className="text-xs text-slate-400">El texto se ajustará al papel al imprimir</span>
          </div>

          {/* VISTA EN PANTALLA (Textarea editable) */}
          <div className="p-6 print:hidden">
            <textarea
              className="w-full min-h-[500px] p-4 text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed"
              placeholder="Escribe aquí el acta de la reunión... Ej: En Valparaíso, a 26 de mayo de 2026, se da inicio al consejo de curso..."
              value={actaText}
              onChange={(e) => setActaText(e.target.value)}
            />
          </div>

          {/* VISTA DE IMPRESIÓN (Solo visible al usar Ctrl+P) */}
          <div className="hidden print:block print:p-8 print:w-full">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
              <h1 className="text-2xl font-bold uppercase tracking-wider">Acta de Consejo de Curso</h1>
              <h2 className="text-lg font-semibold mt-1">Liceo Juana Ross de Edwards</h2>
            </div>
            <div className="whitespace-pre-wrap text-justify leading-relaxed text-black text-base">
              {actaText || "Acta sin contenido."}
            </div>
            
            {/* Espacios para firmas en la hoja impresa */}
            <div className="mt-24 pt-8 flex justify-around items-end">
              <div className="text-center">
                <div className="w-48 border-t border-black mb-2"></div>
                <p className="font-semibold text-sm">Firma Profesor(a) Jefe</p>
              </div>
              <div className="text-center">
                <div className="w-48 border-t border-black mb-2"></div>
                <p className="font-semibold text-sm">Firma Alumno(a) Secretario(a)</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}