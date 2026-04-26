import { fetchClient } from "./apiConfig";
import { ILog, IUserProfile } from "../types/admin.types";
import Cookies from "js-cookie";

export const authService = {
  // 1. Obtener perfil y persistir en LocalStorage (Identidad Real)
  getMe: async (): Promise<IUserProfile> => {
    try {
      // Llamada al microservicio de identidad (Puerto 3003)
      const response = await fetchClient("/identity/me"); 
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "No se pudo cargar el perfil");
      }

      // Guardamos en localStorage para que el Dashboard no muestre "Estudiante"
      localStorage.setItem("user-profile", JSON.stringify(response.data));
      
      return response.data;
    } catch (err) {
      console.error("Error en authService.getMe:", err);
      throw err;
    }
  },

  // 2. Auditoría Blockchain
  getLogs: async (): Promise<ILog[]> => {
    try {
      const response = await fetchClient("/auth/logs");
      return Array.isArray(response) ? response : (response.data || []);
    } catch {
      return []; // Retorno silencioso si falla
    }
  },

  // 3. Gestión de Usuarios (Corregido el error de 'unused var')
  getUsuariosPendientes: async () => {
    try {
      const response = await fetchClient("/identity/usuarios");
      if (!response.success) throw new Error(response.message || "Error al cargar usuarios");
      
      const usuarios = response.data || [];
      return usuarios.filter((u: { ESTADO?: string; estado?: string }) => {
        const estado = (u.ESTADO || u.estado || "").toUpperCase();
        return estado === 'PENDIENTE' || estado === 'INACTIVO';
      });
    } catch (err) {
      console.error("Error en getUsuariosPendientes:", err);
      return [];
    }
  },

  activarUsuario: async (id: number) => {
    try {
      const response = await fetchClient(`/identity/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "ACTIVO" })
      });
      if (!response.success) throw new Error(response.message || "Error al activar");
      return response.data;
    } catch (err) {
      console.error("Error en activarUsuario:", err);
      throw err;
    }
  },

  // 4. Logout y Limpieza
  logout: () => {
    Cookies.remove("auth-token");
    localStorage.removeItem("user-profile");
  },
};