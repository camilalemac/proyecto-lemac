import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getApiBaseUrl } from "@/lib/api/config";
import type { AuthAccessTokenPayload } from "@/lib/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiUrl = `${getApiBaseUrl()}/auth/login`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const responseData = text ? JSON.parse(text) : {};

    if (!res.ok) {
      const message =
        typeof responseData === "object" && responseData !== null && "message" in responseData
          ? String((responseData as { message?: string }).message)
          : "Credenciales inválidas";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const accessToken = responseData.data?.accessToken as string | undefined;
    const refreshToken = responseData.data?.refreshToken as string | undefined;
    if (!accessToken) {
      return NextResponse.json({ error: "Respuesta inválida del servidor" }, { status: 502 });
    }

    const decoded = jwt.decode(accessToken) as AuthAccessTokenPayload | null;

    const nextResponse = NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: decoded?.userId,
          colegioId: decoded?.colegioId,
          role: decoded?.role ?? "alumno",
          nombre: decoded?.nombre ?? "Usuario",
        },
      },
    });

    // ✅ ACTUALIZACIÓN: httpOnly puesto en false para lectura del lado del cliente
    nextResponse.cookies.set("auth-token", accessToken, {
      httpOnly: false, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("API LOGIN ERROR:", error);
    return NextResponse.json({ error: "Error de conexión con el Gateway" }, { status: 500 });
  }
}