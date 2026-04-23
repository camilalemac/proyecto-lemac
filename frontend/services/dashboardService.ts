import { fetchClient } from "./apiConfig";
import { IUserProfile, ITransaccion, IApiResponse } from "../types/admin.types";

export const adminService = {
  // 1. Obtener el perfil del usuario logueado
  getMe: async (): Promise<IUserProfile> => {
    const response: IApiResponse<IUserProfile> = await fetchClient("/auth/me");
    if (!response.success || !response.data) {
      throw new Error("Token inválido o expirado");
    }
    return response.data;
  },

  // 2. Obtener las transacciones y estandarizar los nombres de las propiedades
  getTransaccionesColegio: async (colegioId: number): Promise<ITransaccion[]> => {
    try {
      const response = await fetchClient(`/pagos/transaccion/colegio/${colegioId}`);
      const rawData = Array.isArray(response) ? response : (response.data || []);
      
      // Mapeo (Adapter): Nos aseguramos de que la UI siempre reciba los datos limpios
      return rawData.map((t: any) => ({
        cobroId: t.COBRO_ID || t.cobroId,
        montoPago: Number(t.MONTO_PAGO || t.montoPago || 0),
        metodoPago: t.METODO_PAGO || t.metodoPago || "DB_RECORD",
      }));
    } catch (error) {
      console.error("Error obteniendo transacciones:", error);
      return []; // Retorna arreglo vacío en caso de fallo para no romper la UI
    }
  }
};