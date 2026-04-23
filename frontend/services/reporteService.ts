import { fetchClient } from "./apiConfig";
import { IReporteDocumento } from "../types/admin.types";

export const reporteService = {
  /**
   * Obtener todos los reportes oficiales (Actas, Balances, Memorias)
   * Consulta el endpoint base del microservicio de reportes
   */
  getReportes: async () => {
    const response = await fetchClient("/documentos");
    if (!response.success) {
      throw new Error(response.message || "Error al cargar el repositorio de reportes");
    }
    return response.data || [];
  },

  /**
   * Generar una nueva acta de reunión
   * Envía los datos al microservicio de reportes para su procesamiento y guardado
   * @param payload Objeto con titulo, lugar, asistentes, contenido, etc.
   */
  createActa: async (payload: any) => {
    const response = await fetchClient("/documentos/actas", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    
    if (!response.success) {
      throw new Error(response.message || "No se pudo generar el acta oficial");
    }
    
    return response.data;
  },

  // ✅ AÑADE ESTA NUEVA FUNCIÓN PARA EL SECRETARIO
  crearActa: async (actaPayload: any) => {
    try {
      // Apuntamos al endpoint que usabas: /comunicaciones/actas
      const response = await fetchClient("/comunicaciones/actas", {
        method: "POST",
        body: JSON.stringify(actaPayload)
      });
      
      if (!response.success) {
        throw new Error(response.message || "Error al guardar el acta");
      }
      return response.data;
    } catch (error) {
      console.error("Error en crearActa:", error);
      throw error;
    }
  },
  // En reporteService.ts
  getHistorialReportes: async () => {
    try {
      // Ajusta la ruta según tu Gateway
      const response = await fetchClient("/notificaciones/reportes");
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Error obteniendo el historial de reportes:", error);
      throw error;
    }
  },
};