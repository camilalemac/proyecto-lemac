"use client"
import Link from "next/link"
import { GraduationCap, CreditCard, Shield, Clock, ChevronRight, CheckCircle, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#375879] selection:bg-[#FF8FAB]/30 overflow-x-hidden">
      
      {/* Background Decor Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-[#FF8FAB]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#0F172A]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-[#0F172A] p-2 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-[#FF8FAB]" />
            </div>
            <span className="text-2xl font-black text-[#0F172A] tracking-tighter">
              LEMAC<span className="text-[#FF8FAB]">.</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0F172A] transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="bg-[#0F172A] text-white px-7 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#FF8FAB] hover:text-[#0F172A] transition-all shadow-xl shadow-slate-200 active:scale-95">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="container mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 px-5 py-2.5 rounded-full mb-10 shadow-sm animate-fade-in">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Sistema Validado para Cuotas Escolares 2026</span>
          </div>
          
          <h1 className="mx-auto max-w-5xl text-6xl font-black leading-[1.05] text-[#0F172A] md:text-8xl tracking-tighter">
            El control de cuotas <br/>
            <span className="text-[#FF8FAB] underline decoration-slate-200 decoration-8 underline-offset-12">ahora es simple.</span>
          </h1>
          
          {/* TEXTO MODIFICADO: Solo cuotas */}
          <p className="mx-auto mt-12 max-w-2xl text-xl text-slate-500 font-medium leading-relaxed">
            Organiza las cuotas de tu curso de forma eficiente y centralizada. 
            Transparencia total para apoderados y tesoreros en cada movimiento.
          </p>

          <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/login" className="group flex items-center gap-4 bg-[#0F172A] text-white px-12 py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:shadow-[0_20px_50px_rgba(15,23,42,0.3)] transition-all active:scale-95">
              Entrar al Portal
              <ChevronRight className="h-5 w-5 text-[#FF8FAB] group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* SE ELIMINÓ LA SECCIÓN DE +50 CURSOS REGISTRADOS */}
          </div>
        </div>
      </section>

      {/* Grid de Beneficios */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-[#0F172A] skew-y-3 origin-right -z-10" />
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-[11px] font-black text-[#FF8FAB] uppercase tracking-[0.5em] mb-4">¿Por qué usar Lemac?</h2>
            {/* COLOR CAMBIADO: Asegurando visibilidad sobre fondo oscuro */}
            <p className="text-4xl font-black text-slate-100 uppercase tracking-tighter">Diseñado para la comunidad escolar</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Gestión de Apoderados"
              description="Lista completa de alumnos y sus responsables. Envío de notificaciones de cobro automáticas."
            />
            <FeatureCard
              icon={<CreditCard className="h-8 w-8" />}
              title="Pagos y Abonos"
              description="Registra pagos completos o parciales. El sistema calcula la morosidad automáticamente por ti."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Respaldo OCI"
              description="Toda la contabilidad respaldada en la nube de Oracle, garantizando que los datos nunca se pierdan."
            />
          </div>
        </div>
      </section>

      {/* Footer Final */}
      <footer className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-12 md:flex-row border-t border-slate-200 pt-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#0F172A] p-2 rounded-xl">
                <GraduationCap className="h-5 w-5 text-[#FF8FAB]" />
              </div>
              <span className="font-black text-[#0F172A] tracking-tighter uppercase">Lemac v3.0</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Proyecto de Título • Ingeniería en Informática
            </p>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">Infraestructura</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Oracle Cloud Infrastructure</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-[3rem] bg-white/10 border border-white/20 p-12 transition-all duration-500 hover:bg-white hover:shadow-[0_30px_100px_rgba(0,0,0,0.2)] hover:-translate-y-4">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FF8FAB] text-[#0F172A] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[5deg]">
        {icon}
      </div>
      {/* CAMBIO DE COLOR: text-slate-100 para que se vea sobre el fondo azul oscuro */}
      <h3 className="mb-4 text-2xl font-black text-slate-100 uppercase tracking-tighter leading-none group-hover:text-[#0F172A] transition-colors">
        {title}
      </h3>
      {/* CAMBIO DE COLOR: text-slate-300 para mejor legibilidad */}
      <p className="text-slate-300 font-medium text-sm leading-relaxed group-hover:text-slate-500 transition-colors">
        {description}
      </p>
    </div>
  )
}