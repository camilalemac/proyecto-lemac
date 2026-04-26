/**
 * Base de API detrás del gateway. En `.env.local`: `NEXT_PUBLIC_GATEWAY_URL=http://localhost:3002/api/v1`
 */
export function getApiBaseUrl(): string {
  // Ahora busca la variable correcta y por defecto apunta al Gateway real (3002)
  const raw = process.env.NEXT_PUBLIC_GATEWAY_URL?.trim() || "http://localhost:3002/api/v1";
  return raw.replace(/\/$/, "");
}

/** Origen del gateway (sin `/api/v1`), útil para `/health`. */
export function getGatewayOrigin(): string {
  const base = getApiBaseUrl();
  const stripped = base.replace(/\/api\/v1\/?$/i, "");
  return stripped || "http://localhost:3002";
}