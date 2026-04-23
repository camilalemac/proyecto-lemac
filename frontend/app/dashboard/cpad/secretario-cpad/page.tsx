"use client"
import { useState, useEffect } from "react"
import { 
  FileText, Save, Users, Calendar, Clock, 
  CheckCircle2, AlertCircle, Loader2, ClipboardList, ShieldAlert, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ARQUITECTURA LIMPIA (Sube 4 niveles: secretario-cpad -> cpad -> dashboard -> app -> raíz)
import { authService } from "../../../../services/authService"
import { reporteService } from "../../../../services/reporteService"

export default function SecretarioCpadPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [acta, setActa] = useState({
    titulo: "",
    fecha: new Date().toISOString().split('T')[0],
    asistentes: "",
    contenido: ""
  });

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // 1. Usamos el servicio centralizado
        const perfil = await authService.getMe();

        // 2. Validamos que pertenezca a la directiva del Centro de Padres
        const rolesDelUsuario = perfil.roles || [];
        const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
          const code = rol.rol_code;
          return [
            'CEN_PRES_CAP', 'CEN_TES_CAP', 'CEN_SEC_CAP', 
            'DIR_PRES_APO', 'DIR_TES_APO', 'DIR_SEC_APO'
          ].includes(code);
        });

        // 3. Seguridad Estricta: Idealmente solo Secretarios (y Presidentes) deberían redactar
        const puedeRedactar = rolesDelUsuario.some((rol: any) => 
          ['CEN_SEC_CAP', 'DIR_SEC_APO', 'CEN_PRES_CAP'].includes(rol.rol_code)
        );

        if (!esCentroDePadres || !puedeRedactar) {
          setIsAuthorized(false);
          setAuthLoading(false);
          return;
        }

        setIsAuthorized(true);

      } catch (e) {
        console.error("Error de autenticación:", e);
        setIsAuthorized(false);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Función refactorizada de guardado
  const handleGuardarActa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      // Usamos el servicio en lugar del fetch crudo a localhost:3001
      await reporteService.crearActa(acta);
      
      setStatus('success');
      setActa({ titulo: "", fecha: acta.fecha, asistentes: "", contenido: "" });
      
      // Opcional: Quitar el mensaje de éxito después de 3 segundos
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // PANTALLA: Cargando Autenticación
  if (authLoading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#0F172A]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.3em]">Verificando Permisos...</p>
    </div>
  );

  // PANTALLA: Acceso Denegado
  if (isAuthorized === false) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5] p-6">
      <div className="max-w-xl w-full p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-500/5 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-rose-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-2">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
          No tienes los permisos necesarios para redactar actas. Esta vista es exclusiva para la Secretaría de la directiva.
        </p>
        <Link 
          href="/dashboard/cpad/centro-padres" 
          className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-[#0F172A] hover:bg-[#FF8FAB] hover:text-[#0F172A] px-8 py-4 rounded-2xl transition-all shadow-lg"
        >
          <ArrowLeft size={16} /> Volver al Panel
        </Link>
      </div>
    </div>
  );

  // VISTA PRINCIPAL
  return (
    <div className="p-8 bg-[#FDF2F5] min-h-screen">
      
      {/* Botón Volver Sutil */}
      <div className="mb-6 flex items-center">
        <Link 
          href="/dashboard/cpad/centro-padres" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0F172A] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-50"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </Link>
      </div>

      {/* HEADER */}
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
        
        {/* FORMULARIO */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-pink-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-[#0F172A] rounded-full"></div>
            <h3 className="font-black text-[#0F172A] uppercase text-sm tracking-widest">Redactar Nueva Acta</h3>
          </div>

          <form onSubmit={handleGuardarActa} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Sesión</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Contable</label>
                <input 
                  type="date"
                  className="w-full p-5 bg-[#FDF2F5] border-none rounded-3xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#0F172A]"
                  value={acta.fecha}
                  onChange={(e) => setActa({...acta, fecha: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asistentes a la Reunión</label>
              <textarea 
                placeholder="Juan Pérez, María Soto..."
                className="w-full p-5 bg-[#FDF2F5] border-none rounded-3xl text-sm font-bold text-[#0F172A] h-24 focus:ring-2 focus:ring-[#0F172A] transition-all"
                value={acta.asistentes}
                onChange={(e) => setActa({...acta, asistentes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desarrollo y Acuerdos</label>
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
              className="w-full py-6 bg-[#0F172A] text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#FF8FAB] hover:text-[#0F172A] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Sincronizando...' : 'Guardar Acta Oficial'}
            </button>
          </form>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3.5rem] border border-pink-50 shadow-sm">
            <h3 className="font-black text-[#0F172A] mb-6 text-[10px] uppercase tracking-widest">Estado de Sincronización</h3>
            
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
                <div className="bg-rose-50 p-5 rounded-3xl flex items-center gap-3 text-rose-600 text-xs font-black uppercase tracking-tighter">
                  <AlertCircle size={20} /> Error de Microservicio
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8FAB] opacity-10 rounded-full -mr-16 -mt-16"></div>
            <Users size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            <div className="relative z-10">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-[#FF8FAB]">Recordatorio Legal</p>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                La persistencia en <code>COM_ACTAS_REUNION</code> asegura la integridad referencial para el módulo de auditoría del colegio. Todo documento guardado genera un Hash en la base de datos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}