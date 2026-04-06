import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // En modo desarrollo, dejamos pasar todo para evitar el "rebote" al login
  return NextResponse.next()
}

// El matcher define en qué rutas actúa el middleware
export const config = {
  matcher: ['/dashboard/:path*'], 
}