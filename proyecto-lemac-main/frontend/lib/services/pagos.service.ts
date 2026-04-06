import { getApiBaseUrl } from "@/lib/api/config";

/** Estado de una cuota/cobro tal como lo consume el dashboard. */
export type CuotaEstado = "PENDIENTE" | "PAGADO" | string;

/**
 * Una fila de cuota normalizada para UI (monto, vencimiento, estado).
 * Compatible con respuestas legacy en MAYÚSCULAS del backend.
 */
export type CuotaCobro = {
  id: string | number;
  descripcion: string;
  /** Monto en CLP */
  monto: number;
  /** ISO date string o null si no aplica */
  fechaVencimiento: string | null;
  estado: CuotaEstado;
};

export type ResumenPagosAlumno = {
  totalPendiente: number;
  totalPagado: number;
  cobros: CuotaCobro[];
};

const VACIO: ResumenPagosAlumno = {
  totalPendiente: 0,
  totalPagado: 0,
  cobros: [],
};

function parseFecha(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  const d = new Date(String(raw));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizarCobro(raw: Record<string, unknown>, index: number): CuotaCobro {
  const id = raw.COBRO_ID ?? raw.cobroId ?? raw.id ?? `cobro-${index}`;
  const descripcion = String(raw.DESCRIPCION ?? raw.descripcion ?? "Sin descripción");
  const monto = Number(raw.MONTO_ORIGINAL ?? raw.monto ?? raw.MONTO ?? 0);
  const fechaVencimiento = parseFecha(raw.FECHA_VENCIMIENTO ?? raw.fechaVencimiento);
  const estado = String(raw.ESTADO ?? raw.estado ?? "PENDIENTE") as CuotaEstado;

  return {
    id,
    descripcion,
    monto,
    fechaVencimiento,
    estado,
  };
}

/**
 * Lee el resumen de cobros del alumno directamente desde el gateway:
 * `GET /api/v1/pagos/cuentas-cobrar/mis-cobros/resumen`
 *
 * Si la respuesta es vacía, hay error HTTP o el cuerpo no es JSON válido, devuelve totales en 0 y lista vacía (sin datos de prueba).
 */
export async function fetchResumenMisCobros(accessToken: string): Promise<ResumenPagosAlumno> {
  const url = `${getApiBaseUrl()}/pagos/cuentas-cobrar/mis-cobros/resumen`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      console.warn("[pagos] Resumen: respuesta no es JSON válido");
      return { ...VACIO };
    }

    const body = json as {
      success?: boolean;
      data?: {
        totalPendiente?: number;
        totalPagado?: number;
        cobros?: Record<string, unknown>[];
      };
      message?: string;
    };

    if (!res.ok) {
      console.warn("[pagos] Resumen HTTP", res.status, body?.message ?? "");
      return { ...VACIO };
    }

    if (body.success === false) {
      console.warn("[pagos] Resumen success:false", body?.message ?? "");
      return { ...VACIO };
    }

    const data = body.data;
    const cobrosRaw = Array.isArray(data?.cobros) ? data.cobros : [];

    return {
      totalPendiente: Number(data?.totalPendiente) || 0,
      totalPagado: Number(data?.totalPagado) || 0,
      cobros: cobrosRaw.map((c, i) => normalizarCobro(c, i)),
    };
  } catch (e) {
    console.error("[pagos] Resumen error de red:", e);
    return { ...VACIO };
  }
}
