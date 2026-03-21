import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Reemplaza esta URL por la dirección real de tu microservicio de Oracle
    const microservicioUrl = process.env.BACKEND_URL || "http://localhost:8080/api/usuarios/registrar";

    const response = await fetch(microservicioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.message || "Error al registrar en la base de datos" }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Registro exitoso", data: result }, { status: 201 });

  } catch (error) {
    console.error("Error en el puente API:", error);
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor de base de datos" }, 
      { status: 500 }
    );
  }
}