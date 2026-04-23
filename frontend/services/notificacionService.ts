import { fetchClient } from "./apiConfig";

export const notificacionService = {
  enviarRecordatorioPago: async (payload: any) => {
    try {
      const response = await fetchClient("/notificaciones/correos/pagos-pendientes", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!response.success) throw new Error(response.message || "Error al enviar notificación");
      return response.data;
    } catch (error) {
      console.error("Error en enviarRecordatorioPago:", error);
      throw error;
    }
  },
  // ... dentro de notificacionService ...

  citarAsamblea: async (payload: { titulo: string, fecha: string }) => {
    try {
      const response = await fetchClient("/comunicaciones/notificar-asamblea", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      // Si el backend responde sin success, lanzamos error
      if (response && response.success === false) {
        throw new Error(response.message || "Fallo al enviar notificación");
      }
      return response;
    } catch (error) {
      console.error("Error en citarAsamblea:", error);
      throw error;
    }
  },
};