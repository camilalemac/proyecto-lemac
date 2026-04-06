/**
 * Base de API detrás del gateway. En `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3007/api/v1`
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3007/api/v1";
  return raw.replace(/\/$/, "");
}

/** Origen del gateway (sin `/api/v1`), útil para `/health`. */
export function getGatewayOrigin(): string {
  const base = getApiBaseUrl();
  const stripped = base.replace(/\/api\/v1\/?$/i, "");
  return stripped || "http://localhost:3007";
}
