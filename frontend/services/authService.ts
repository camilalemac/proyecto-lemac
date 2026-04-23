import { fetchClient } from "./apiConfig";
import { ILog, IUserProfile } from "../types/admin.types";
import Cookies from "js-cookie"; // Importación necesaria para el logout

export const authService = {
  // 1. Obtener la bitácora de logs (Auditoría Blockchain)
  getLogs: async (): Promise<ILog[]> => {
    try {
      const response = await fetchClient("/auth/logs");
      // Si la respuesta es un array directo lo devuelve, si viene envuelto en 'data' lo extrae
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Error obteniendo logs de auditoría:", error);
      throw error;
    }
  },

  // 2. Obtener perfil del usuario logueado (Identidad)
  getMe: async (): Promise<IUserProfile> => {
    try {
      const response = await fetchClient("/auth/me");
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "No se pudo cargar el perfil del usuario");
      }
      
      return response.data;
    } catch (error) {
      console.error("Error en authService.getMe:", error);
      throw error;
    }
  },

  // 3. Cerrar sesión y limpiar credenciales
  logout: () => {
    Cookies.remove("auth-token");
    // Si en el futuro guardas datos del usuario en localStorage, los limpias aquí:
    // localStorage.removeItem("user-data"); 
  },
  // ... dentro del objeto authService ...

  getUsuariosPendientes: async () => {
    try {
      const response = await fetchClient("/identity/usuarios");
      if (!response.success) throw new Error(response.message || "Error al cargar usuarios");
      
      // Filtrar y retornar solo los pendientes
      const usuarios = response.data || [];
      return usuarios.filter((u: any) => {
        const estado = (u.ESTADO || u.estado || "").toUpperCase();
        return estado === 'PENDIENTE' || estado === 'INACTIVO';
      });
    } catch (error) {
      console.error("Error en getUsuariosPendientes:", error);
      throw error;
    }
  },

  activarUsuario: async (id: number) => {
    try {
      const response = await fetchClient(`/identity/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "ACTIVO" })
      });
      if (!response.success) throw new Error(response.message || "Error al activar usuario");
      return response.data;
    } catch (error) {
      console.error("Error en activarUsuario:", error);
      throw error;
    }
  },
};