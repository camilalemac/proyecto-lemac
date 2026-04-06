import { NextResponse } from "next/server";
import { getGatewayOrigin } from "@/lib/api/config";

/**
 * Prueba de conectividad con el gateway (GET `/health`).
 * Útil para verificar que el stack está levantado antes de login.
 */
export async function GET() {
  try {
    const res = await fetch(`${getGatewayOrigin()}/health`, { cache: "no-store" });
    const text = await res.text();
    let body: unknown = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }
    return NextResponse.json(
      { ok: res.ok, status: res.status, gateway: body },
      { status: res.ok ? 200 : res.status }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
