import Cookies from "js-cookie";

// 1. CORRECCIÓN VITAL: El salvavidas debe apuntar a 3002 (Gateway) siempre.
const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3002/api/v1";

export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = Cookies.get("auth-token");
  
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
      } else if (response.status === 404) {
        console.warn(`🔍 Ruta no encontrada (404) en el backend: ${endpoint}`);
      } else {
        console.warn(`⚠️ Error ${response.status} en el servidor al consultar: ${endpoint}`);
      }

      return {
        success: false,
        message: `Error HTTP: ${response.status}`,
        status: response.status
      };
    }

    // ✅ Parseamos el JSON
    const data = await response.json();
    
    // 2. BLINDAJE EXTRA: Si el microservicio devuelve los datos "desnudos" 
    // sin la etiqueta "success", se la agregamos para que authService no colapse.
    if (typeof data === "object" && data !== null && !('success' in data)) {
        return {
            success: true,
            data: data.data || data 
        };
    }

    return data;

  // 👇 AQUÍ ESTÁ LA CORRECCIÓN DEL LINTER (Cambiado de 'any' a 'unknown')
  } catch (error: unknown) { 
    console.error(`❌ Fallo crítico de red conectando a ${endpoint}:`, error);
    return {
      success: false,
      message: "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
      networkError: true
    };
  }
};