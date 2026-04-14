"use client"
import React, { useEffect, useState } from "react"
import { 
  FileText, PieChart, Users, Receipt, 
  ArrowRight, ClipboardCheck, Loader2, AlertCircle, ShieldAlert, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// Definición de interfaces para que TypeScript no de errores
interface Role {
  rol_code: string;
  nombre_rol: string;
  categoria: string;
}

interface UserProfile {
  perfil: {
    user_id: number;
    nombres: string;
    apellidos: string;
    email: string;
    estado: string;
  };
  roles: Role[];
}

export default function CentroPadresDashboard() {
  const router = useRouter()
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controlar la autorización
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("auth-token");
        
        if (!token) {
          setError("No hay sesión activa");
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const res = await fetch("http://127.0.0.1:3007/api/v1/auth/me", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const json = await res.json();

        if (json.status === "success") {
          // --- VALIDACIÓN DE ROLES DEL CENTRO DE PADRES ---
          const rolesDelUsuario = json.data?.roles || [];
          const esCentroDePadres = rolesDelUsuario.some((rol: any) => {
            const code = rol.rol_code;
            return code === 'CEN_PRES_CAP' || code === 'CEN_TES_CAP' || code === 'CEN_SEC_CAP' ||
                   code === 'DIR_PRES_APO' || code === 'DIR_TES_APO' || code === 'DIR_SEC_APO';
          });

          if (!esCentroDePadres) {
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          setIsAuthorized(true);
          setData(json.data);
        } else {
          setError("Error en el formato de respuesta");
          setIsAuthorized(false);
        }
      } catch (e) {
        console.error("Error conectando al backend:", e);
        setError("Error de conexión con el servidor");
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Función hasRole ultra-segura para TypeScript
  const hasRole = (roleCode: string): boolean => {
    if (!data || !data.roles) return false;
    return data.roles.some((r) => r.rol_code === roleCode);
  };

  // Definición de permisos basados en tu lógica de negocio
  const isSecretario = hasRole('CEN_SEC_CAP') || hasRole('DIR_SEC_APO') || hasRole('SECRETARIO_CAP');
  const isTesorero = hasRole('CEN_TES_CAP') || hasRole('DIR_TES_APO') || hasRole('TESORERO_CAP');

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={40} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando Identidad...</p>
    </div>
  );

  // Pantalla de Acceso Denegado
  if (isAuthorized === false) return (
    <div className="max-w-3xl mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-500/5 text-center animate-in zoom-in-95 duration-500">
      <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert size={40} className="text-rose-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-2">Acceso Restringido</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
        No tienes los permisos necesarios para ver el Panel de Administración. Esta vista es exclusiva para miembros activos de la directiva del Centro de Padres.
      </p>
      <button 
        onClick={() => router.push('/login')} 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1A1A2E] bg-slate-50 hover:bg-rose-50 px-6 py-3 rounded-2xl transition-colors border border-slate-100 hover:border-rose-200"
      >
        <ArrowLeft size={16} /> Ir al Login
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Alerta de error si falla el backend (y tiene permisos) */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
          <AlertCircle size={18} />
          <span>{error}. Verifica que el Microservicio 3007 esté corriendo.</span>
        </div>
      )}

      {/* Header de Bienvenida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-[#1A1A2E] to-[#2A2A4E] p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between relative overflow-hidden border-b-4 border-[#FF8FAB]">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2 tracking-tighter italic">
              ¡Hola, {data?.perfil.nombres.split(' ')[0] || 'Usuario'}!
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Panel Directiva: {data?.roles[0]?.nombre_rol || 'Cargando rol...'}
            </p>
          </div>
          <div className="mt-8 relative z-10">
             <button 
              disabled={!isSecretario}
              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                isSecretario 
                ? "bg-[#FF8FAB] text-[#1A1A2E] hover:scale-105 shadow-lg shadow-[#FF8FAB]/20" 
                : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
             >
               {isSecretario ? "Redactar Acta Nueva" : "Acceso Solo Secretaría"}
             </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <h3 className="font-black text-[#1A1A2E] uppercase text-[10px] tracking-[0.3em] mb-6 opacity-30">Navegación Rápida</h3>
           <div className="grid grid-cols-2 gap-4">
              <QuickAction icon={<Receipt size={18}/>} label="Cuotas" href="/dashboard/cpad/centro-padres/cuotas" />
              <QuickAction icon={<PieChart size={18}/>} label="Reportes" href="/dashboard/cpad/centro-padres/reportes" />
              <QuickAction icon={<Users size={18}/>} label="Libro Caja" href="/dashboard/cpad/centro-padres/movimientos" />
              <QuickAction icon={<FileText size={18}/>} label="Documentos" href="/dashboard/cpad/centro-padres/reportes" />
           </div>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-[#1A1A2E] pl-2 uppercase tracking-tighter">Módulos Administrativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModuleCard 
            title="Tesorería" 
            desc="Gestión de finanzas, morosidad y cuentas bancarias del colegio." 
            icon={<Receipt />} 
            features={["Cuotas Curso", "Egresos"]} 
            enabled={isTesorero} 
          />
          <ModuleCard 
            title="Secretaría" 
            desc="Gestión documental y libros de actas de reuniones mensuales." 
            icon={<ClipboardCheck />} 
            features={["Actas", "Certificados"]} 
            enabled={isSecretario} 
          />
          <ModuleCard 
            title="Reportes" 
            desc="Generación de balances y estadísticas de recaudación anual." 
            icon={<FileText />} 
            features={["Balances PDF", "Estadísticas"]} 
            enabled={true} 
          />
        </div>
      </div>
    </div>
  )
}

// --- Subcomponentes con tipos definidos ---

function QuickAction({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-[#FF8FAB]/10 border border-transparent hover:border-[#FF8FAB]/30 transition-all group">
      <div className="text-slate-400 group-hover:text-[#FF8FAB] transition-colors">{icon}</div>
      <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{label}</span>
    </Link>
  )
}

function ModuleCard({ title, desc, icon, features, enabled }: { title: string, desc: string, icon: React.ReactNode, features: string[], enabled: boolean }) {
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border transition-all duration-500 ${
      enabled ? "border-slate-100 shadow-sm" : "border-slate-50 opacity-40 grayscale"
    }`}>
      <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-[#FF8FAB] border border-slate-100">
        {icon}
      </div>
      <h4 className="text-lg font-black text-[#1A1A2E] mb-2">{title}</h4>
      <p className="text-slate-500 text-xs mb-6 leading-relaxed">{desc}</p>
      <ul className="space-y-2 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-1 h-1 rounded-full bg-[#FF8FAB]" />
            {f}
          </li>
        ))}
      </ul>
      <button 
        disabled={!enabled} 
        className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${
          enabled ? "bg-[#1A1A2E] text-white hover:bg-[#FF8FAB] hover:text-[#1A1A2E] shadow-lg shadow-slate-900/10" : "bg-slate-100 text-slate-300 cursor-not-allowed"
        }`}
      >
        {enabled ? "Ingresar al Módulo" : "Acceso Denegado"}
        {enabled && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
      </button>
    </div>
  )
}