import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");

    const res = await fetch(
      "http://127.0.0.1:3007/api/v1/pagos/mis-cobros/resumen", // 👈 ajusta si cambiaste
      {
        method: "GET",
        headers: {
          Authorization: token || "",
        },
      }
    );

    let data;

    try {
      data = await res.json();
    } catch {
      // 🔥 Si backend devuelve HTML o vacío
      const text = await res.text();
      console.error("Respuesta NO JSON del backend:", text);

      return NextResponse.json(
        { error: "Backend no devolvió JSON", detalle: text },
        { status: res.status }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Error desde backend", detalle: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API RESUMEN ERROR:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}