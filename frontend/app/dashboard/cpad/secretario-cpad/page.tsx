"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Save, Users, Calendar, Clock, 
  CheckCircle2, AlertCircle, Loader2, ClipboardList, ShieldAlert, ArrowLeft
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function SecretarioCpadPage() {
  const router = useRouter();
  
  // Estados originales
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [acta, setActa] = useState({
    titulo: "",
    fecha: new Date().toISOString().split('T')[0],
    asistentes: "",
    contenido: ""
  });

  // NUEVOS ESTADOS PARA AUTENTICACIÓN
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // NUEVO EFFECT: Bloqueo de vista si no hay sesión o rol de Centro de Padres
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = Cookies.get("auth-token");
        if (!token) {
          setIsAuthorized(false);
          setAuthLoading(false);
          return;
        }

        const res = await fetch("http://127.0.0.1:3007/api/v1/auth/me", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.status === "success") {
            const rolesDelUsuario = json.data?.roles || [];
            // Validamos que pertenezca a la directiva del Centro de Padres
            const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
              const code = rol.rol_code;
              return [
                'CEN_PRES_CAP', 'CEN_TES_CAP', 'CEN_SEC_CAP', 
                'DIR_PRES_APO', 'DIR_TES_APO', 'DIR_SEC_APO'
              ].includes(code);
            });

            if (esCentroDePadres) {
              setIsAuthorized(true);
            } else {
              setIsAuthorized(false);
            }
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (e) {
        console.error("Error de autenticación:", e);
        setIsAuthorized(false);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Función original de guardado
  const handleGuardarActa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('http://localhost:3001/api/v1/comunicaciones/actas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acta)
      });

      if (!response.ok) throw new Error("Error en el servidor");
      
      setStatus('success');
      setActa({ titulo: "", fecha: acta.fecha, asistentes: "", contenido: "" });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // NUEVA PANTALLA: Cargando Autenticación
  if (authLoading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#0F172A]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.3em]">Verificando Permisos...</p>
    </div>
  );

  // NUEVA PANTALLA: Acceso Denegado
  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-500/5 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
          No tienes los permisos necesarios para redactar actas. Esta vista es exclusiva para la directiva del Centro de Padres.
        </p>
        <button 
          onClick={() => router.push('/login')} 
          className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-[#0F172A] hover:bg-[#FF8FAB] px-8 py-4 rounded-2xl transition-colors shadow-lg"
        >
          <ArrowLeft size={16} /> Ir al Login
        </button>
      </div>
    </div>
  );

  // RETURN ORIGINAL INTACTO
  return (
    <div className="p-8 bg-[#FDF2F5] min-h-screen">
      
      {/* HEADER: Mix Azul Marino y Rosa */}
      <div className="mb-8 flex items-center justify-between bg-white p-8 rounded-[3.5rem] shadow-sm border border-pink-100">
        <div className="flex items-center gap-5">
          <div className="bg-[#0F172A] p-4 rounded-2xl text-white shadow-lg shadow-blue-900/20">
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter">Secretaría General</h2>
            <p className="text-[10px] text-[#FF8FAB] font-black uppercase tracking-[0.3em] mt-1">Gestión de Actas Oficiales · Lemac Pay</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO: Fondo blanco con acentos Azul Marino */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-pink-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-[#0F172A] rounded-full"></div>
            <h3 className="font-black text-[#0F172A] uppercase text-sm tracking-widest">Redactar Nueva Acta</h3>
          </div>

          <form onSubmit={handleGuardarActa} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título de la Sesión</label>
                <input 
                  type="text"
                  placeholder="Ej: Asamblea Ordinaria"
                  className="w-full p-5 bg-[#FDF2F5] border-none rounded-3xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#0F172A] transition-all placeholder:text-pink-200"
                  value={acta.titulo}
                  onChange={(e) => setActa({...acta, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Contable</label>
                <input 
                  type="date"
                  className="w-full p-5 bg-[#FDF2F5] border-none rounded-3xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#0F172A]"
                  value={acta.fecha}
                  onChange={(e) => setActa({...acta, fecha: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asistentes a la Reunión</label>
              <textarea 
                placeholder="Juan Pérez, María Soto..."
                className="w-full p-5 bg-[#FDF2F5] border-none rounded-3xl text-sm font-bold text-[#0F172A] h-24 focus:ring-2 focus:ring-[#0F172A] transition-all"
                value={acta.asistentes}
                onChange={(e) => setActa({...acta, asistentes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Desarrollo y Acuerdos</label>
              <textarea 
                placeholder="Escribe los puntos clave..."
                className="w-full p-8 bg-[#FDF2F5] border-none rounded-[3rem] text-sm font-medium leading-relaxed text-[#0F172A] h-64 focus:ring-2 focus:ring-[#0F172A] transition-all"
                value={acta.contenido}
                onChange={(e) => setActa({...acta, contenido: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#0F172A] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#FF8FAB] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </form>
        </div>

        {/* COLUMNA LATERAL: Acentos Rosa y Azul */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3.5rem] border border-pink-50 shadow-sm">
            <h3 className="font-black text-[#0F172A] mb-6 text-[10px] uppercase tracking-widest">Sincronización</h3>
            
            <div className="space-y-4">
              {status === 'idle' && (
                <div className="flex items-center gap-3 text-pink-300 text-[11px] font-bold uppercase tracking-tighter">
                  <div className="h-2 w-2 rounded-full bg-pink-200 animate-pulse"></div>
                  Listo para registrar
                </div>
              )}

              {status === 'success' && (
                <div className="bg-emerald-50 p-5 rounded-3xl flex items-center gap-3 text-emerald-600 text-xs font-black uppercase tracking-tighter animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} /> Registro en Oracle OK
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-50 p-5 rounded-3xl flex items-center gap-3 text-red-600 text-xs font-black uppercase tracking-tighter">
                  <AlertCircle size={20} /> Error de Microservicio
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8FAB] opacity-10 rounded-full -mr-16 -mt-16"></div>
            <Users size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <div className="relative z-10">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-[#FF8FAB]">Recordatorio</p>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                La persistencia en <code>COM_ACTAS_REUNION</code> asegura la integridad referencial para el módulo de auditoría.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}