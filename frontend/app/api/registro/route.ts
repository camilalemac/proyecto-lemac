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
        // Si el microservicio requiere un User-Agent (vimos que el controller lo pide)
        'User-Agent': 'NextJS-Frontend' 
      },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();

      if (!response.ok) {
        // DIAGNÓSTICO PARA EL ERROR 400:
        // Imprimimos el error exacto que manda el microservicio (ej: "email is required")
        console.error("Detalle del error desde ms-auth:", result);

        return NextResponse.json(
          { 
            error: result.message || "Datos de registro inválidos", 
            details: result.errors || result.data || "Revisa los campos obligatorios" 
          }, 
          { status: response.status }
        );
      }

      return NextResponse.json({ 
        message: "¡Usuario creado con éxito en Oracle!", 
        data: result 
      }, { status: 201 });

    } else {
      const errorText = await response.text();
      console.error("Respuesta inesperada (No es JSON):", errorText);
      return NextResponse.json(
        { error: "El servidor de autenticación respondió en un formato incorrecto." }, 
        { status: 502 }
      );
    }

  } catch (error: any) {
    console.error("Error crítico de conexión:", error.message);
    return NextResponse.json(
      { error: "No se pudo conectar con ms-auth. Asegúrate de que el puerto 3001 esté activo." }, 
      { status: 500 }
    );
  }
}