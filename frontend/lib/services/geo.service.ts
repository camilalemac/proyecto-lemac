import { getApiBaseUrl } from "@/lib/api/config";
import type { GeoListSuccess, Region } from "@/lib/types/geo";

/** GET público: `/api/v1/geo/regiones` a través del gateway. */
export async function fetchRegiones(): Promise<Region[]> {
  const url = `${getApiBaseUrl()}/geo/regiones`;
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as GeoListSuccess<Region[]> | { success?: boolean; message?: string };

  if (!res.ok || !("data" in json)) {
    throw new Error("message" in json && typeof json.message === "string" ? json.message : "Error al cargar regiones");
  }

  return json.data;
}
