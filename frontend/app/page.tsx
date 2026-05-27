import Link from 'next/link';
import { LogIn, UserPlus, GraduationCap, ShieldCheck, CreditCard } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* NAVBAR SUPERIOR (Fiel a tu imagen corporativa) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Liceo Juana Ross de Edwards</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-150">
                Portal de Pagos
              </span>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm shadow-blue-100"
            >
              <LogIn className="h-4 w-4" />
              <span>Acceso Intranet</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION (Imitando el fondo oscuro y disposición de la captura) */}
      <main className="flex-grow">
        <div className="relative bg-slate-900 min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
          
          {/* Imagen de Fondo con Opacidad / Filtro Oscuro */}
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none transform scale-105 transition-transform duration-1000"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop')` 
            }}
          />
          
          {/* Efecto de degradado sutil en el fondo */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

          {/* Contenido Central del Hero */}
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-12">
            
            {/* Tag institucional */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-blue-300 border border-white/10 mb-6 animate-fade-in">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Plataforma Oficial de Gestión Financiera</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Sistema Escolar de <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                Control y Pago de Cuotas
              </span>
            </h1>

            {/* Subtítulo / Descripción */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bienvenido al portal institucional. Aquí podrás revisar de forma transparente el estado de tus cuotas, mensualidades académicas y realizar transacciones de forma ágil y segura.
            </p>

            {/* Bloque de Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/login" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="h-5 w-5" />
                <span>Ingresar al Portal</span>
              </Link>
              
              <Link 
                href="/registro" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-8 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserPlus className="h-5 w-5 text-slate-300" />
                <span>Registrar Nueva Cuenta</span>
              </Link>
            </div>

            {/* Mini características en el Footer del Hero (Opcional, añade peso visual) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-20 pt-10 border-t border-white/10 text-left text-slate-400 text-sm">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-400 shrink-0" />
                <span>Pagos en línea integrados</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                <span>Conexión cifrada segura</span>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-blue-400 shrink-0" />
                <span>Información en tiempo real</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Liceo Juana Ross de Edwards. Todos los derechos reservados. Módulo de Finanzas Integrado.</p>
      </footer>
    </div>
  );
}