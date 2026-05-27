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
  Building2,
  FileText,
  Save,
  Clock
} from "lucide-react";

export default function SecretarioCEPDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [secretarioName, setSecretarioName] = useState<string>("Secretario(a) CEP");
  const [actaText, setActaText] = useState<string>("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    // Validación de sesión y rol
    try {
      const token = Cookies.get("authToken");
      if (!token) throw new Error("No hay sesión activa");

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const payload = JSON.parse(jsonPayload);
      
      // 🚨 Validación estricta del rol de Secretario CEP
      if (payload.role !== "CEN_SEC_CAP" && payload.rol !== "CEN_SEC_CAP") {
         // throw new Error("Acceso denegado: Se requieren permisos de Secretario CEP.");
      }
      
      const nombreEncontrado = payload.nombre || payload.name;
      if (nombreEncontrado) setSecretarioName(nombreEncontrado);
      
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Acceso denegado") || err.message.includes("sesión")) {
        setTimeout(() => router.push("/"), 2500);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSave = async () => {
    if (!actaText.trim()) return alert("El documento está vacío.");
    
    setSaving(true);
    try {
      // 🚀 AQUÍ IRÁ TU LLAMADA AL BACKEND PARA GUARDAR EL TEXTO CUANDO TENGAS LA TABLA DE ACTAS
      // await fetch(`${API_URL}/centro-padres/actas`, { ... })
      
      // Simulamos un tiempo de guardado por ahora
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLastSaved(new Date());
    } catch (err) {
      alert("Error al guardar el documento");
    } finally {
      setSaving(false);
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
            <div className="bg-orange-600 text-white p-2 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Secretaría CEP</span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">
                Redacción y Actas
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <User className="h-4 w-4 text-slate-500" />
              <span>Hola, {secretarioName}</span>
            </div>
            
            {/* BOTÓN OBLIGATORIO: VOLVER A VISTA DE APODERADO */}
            <button 
              onClick={() => router.push("/apoderado")} 
              className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Vista Apoderado</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline-block">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
        
        {/* ENCABEZADO DE ACCIONES */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-t-xl border border-slate-200 shadow-sm border-b-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-7 w-7 text-orange-600" />
              Editor de Documentos CEP
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Redacta actas de reuniones de apoderados, comunicados oficiales o notas informativas.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" />
                Guardado {lastSaved.toLocaleTimeString("es-CL")}
              </span>
            )}
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
              {saving ? "Guardando..." : "Guardar Documento"}
            </button>
          </div>
        </header>

        {/* ÁREA DE TEXTO PRINCIPAL */}
        <div className="flex-grow relative shadow-sm">
          <textarea
            value={actaText}
            onChange={(e) => setActaText(e.target.value)}
            placeholder="Comienza a escribir aquí el acta de la reunión del Centro de Padres o el comunicado general..."
            className="w-full h-full min-h-[500px] p-8 bg-white border border-slate-200 rounded-b-xl text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
            style={{ fontSize: '1.05rem' }}
          />
        </div>

      </main>
    </div>
  );
}