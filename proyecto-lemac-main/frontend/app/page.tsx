"use client"
import Link from "next/link"
import { GraduationCap, CreditCard, Shield, Clock, ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand p-1.5 rounded-lg">
              < GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">EduPago</span>
          </div>
          
          {/* Navegación central vacía para mantener el espaciado entre logo y botones */}
          <nav className="hidden items-center gap-8 md:flex">
            {/* Los enlaces de Características y Cómo Funciona han sido eliminados */}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-brand transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-all shadow-md shadow-purple-100">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-linear-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] text-gray-900 md:text-7xl tracking-tight text-balance">
            Administra las Cuotas <br/> <span className="text-brand">de Forma Sencilla</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-500 leading-relaxed">
            La plataforma más confiable para gestionar pagos escolares. 
            Consulta saldos, realiza pagos y mantén un historial completo de tus transacciones.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login" className="flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-purple-100 active:scale-95 text-center">
              Acceder a Mi Cuenta
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link href="/registro" className="px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all active:scale-95 text-center">
              Crear Cuenta Nueva
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Con cuadros plomos */}
      <section id="caracteristicas" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="mb-16 text-center text-3xl font-extrabold text-gray-900 tracking-tight uppercase opacity-60">
            Beneficios de la plataforma
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<CreditCard className="h-8 w-8" />}
              title="Pagos Seguros"
              description="Realiza pagos de manera segura con múltiples métodos de pago disponibles y encriptación de datos."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Historial Completo"
              description="Accede al historial de todos tus pagos y descarga tus recibos oficiales en cualquier momento."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="100% Confiable"
              description="Tus datos y transacciones están protegidos bajo los más altos estándares de seguridad informática."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            < GraduationCap className="h-6 w-6 text-brand" />
            <span className="font-bold text-gray-900">EduPago</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 EduPago. Proyecto de cuotas Lemac.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-gray-400 hover:text-brand">Soporte</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-brand">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-3xl border border-gray-200 bg-plomo p-10 transition-all hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 hover:-translate-y-2 hover:border-brand/20">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand shadow-sm group-hover:bg-brand group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{description}</p>
    </div>
  )
}