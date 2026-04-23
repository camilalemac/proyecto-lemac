import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://127.0.0.1:3007/api/v1";

export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = Cookies.get("auth-token");
  
  // Forzamos el tipado para evitar errores de TypeScript con los headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 🛑 MAGIA AQUÍ: Atrapamos los errores HTTP sin lanzar un "throw"
    if (!response.ok) {
      if (response.status === 401) {
        console.warn(`🔒 Token inválido o expirado al consultar: ${endpoint}`);
        // Nota: No borramos la cookie aquí para dejar que authService lo maneje
      } else if (response.status === 404) {
        console.warn(`🔍 Ruta no encontrada (404) en el backend: ${endpoint}`);
      } else {
        console.warn(`⚠️ Error ${response.status} en el servidor al consultar: ${endpoint}`);
      }

      // Retornamos un objeto estructurado simulando una respuesta fallida del backend
      return {
        success: false,
        message: `Error HTTP: ${response.status}`,
        status: response.status
      };
    }

    // ✅ Si el status es 200 OK, devolvemos el JSON normal
    return await response.json();

  } catch (error: any) {
    // 🔌 Este bloque atrapa cuando el Backend está APAGADO o no hay internet
    console.error(`❌ Fallo crítico de red conectando a ${endpoint}:`, error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
      networkError: true
    };
  }
};