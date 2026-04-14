// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // --- ELIMINAMOS TODA LA LÓGICA DE TOKEN PARA DESARROLLO ---
  
  // Con esto, simplemente dejamos que pase cualquier persona a cualquier ruta
  return NextResponse.next()
}

// Mantenemos esto para que el middleware sepa dónde actuar, 
// aunque ahora solo esté dejando pasar a todos.
export const config = {
  matcher: ['/dashboard/:path*'],
}