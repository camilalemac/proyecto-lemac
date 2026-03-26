import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const microservicioUrl = "http://127.0.0.1:3001/api/v1/auth/login";

    const response = await fetch(microservicioUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.message || "Error al iniciar sesión" }, { status: response.status });
    }

    // Aquí recibes el Token para navegar por el sistema
    return NextResponse.json({ message: "Login exitoso", data: result.data }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Error de conexión con ms-auth" }, { status: 500 });
  }
}