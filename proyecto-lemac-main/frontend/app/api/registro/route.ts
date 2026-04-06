import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Usamos la variable del Gateway (Puerto 3007)
    // La ruta en tu backend es /api/v1/auth/register
    const gatewayUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend' 
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    // 2. Manejo de errores basado en la estructura de tu ApiError (ms-auth)
    if (!response.ok) {
      console.error("Detalle del error desde el Gateway/ms-auth:", responseData);
      
      return NextResponse.json(
        { 
          error: responseData.message || "Error en el registro", 
          // Si el backend devuelve validaciones de express-validator, las pasamos aquí
          details: responseData.errors || "Verifica los datos ingresados (RUT, Email o Password)" 
        }, 
        { status: response.status }
      );
    }

    // 3. Éxito: Tu backend devuelve { success: true, data: { userId, email, ... } }
    return NextResponse.json({ 
      message: "Usuario registrado con éxito", 
      user: responseData.data 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error crítico de conexión en Registro:", error.message);
    return NextResponse.json(
      { error: "No se pudo establecer conexión con el servicio de autenticación." }, 
      { status: 500 }
    );
  }
}