import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // Definimos rutas
  const isDashboardPage = pathname.startsWith('/dashboard')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/registro') || pathname === '/'

  // 1. SI intenta entrar a zona privada (Dashboard) Y NO tiene token -> Al Login
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. SI ya tiene token E intenta ir a Login, Registro o Raíz -> Al Dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configuración del guardián
export const config = {
  // Se ejecuta en dashboard, login, registro y la página de inicio
  matcher: ['/dashboard/:path*', '/login', '/registro', '/'],
}