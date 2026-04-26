import { fetchClient } from "./apiConfig";
import { 
  IMetodoPago, 
  IMetodoPagoPayload, 
  IResumenCuotas,
  ICuotaFamiliar,
  IMovimientoCaja,
  ITransaccionFamiliar
} from "../types/admin.types";

export const pagosService = {
  // ==========================================
  // 1. MÉTODOS DE ADMINISTRACIÓN (PASARELAS)
  // ==========================================

  getMetodos: async (): Promise<IMetodoPago[]> => {
    try {
      const response = await fetchClient("/pagos/metodos-pago");
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Error obteniendo métodos de pago:", error);
      throw error;
    }
  },

  createMetodo: async (payload: IMetodoPagoPayload): Promise<unknown> => {
    return await fetchClient("/pagos/metodos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateMetodo: async (metodoId: number, payload: IMetodoPagoPayload): Promise<unknown> => {
    return await fetchClient(`/pagos/metodos/${metodoId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteMetodo: async (metodoId: number): Promise<unknown> => {
    return await fetchClient(`/pagos/metodos/${metodoId}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // 2. MÉTODOS DEL PORTAL ALUMNO (CUOTAS)
  // ==========================================

  getMisCuotasResumen: async (): Promise<IResumenCuotas> => {
    try {
      const response = await fetchClient("/pagos/cuentas-cobrar/mis-cobros/resumen");
      
      if (!response.success) {
        console.warn("⚠️ Backend devolvió 404 para el resumen. Cargando dashboard vacío.");
        return {
          cobros: [],
          totalPendiente: 0,
          cuotasPagadas: 0,
          totalPagado: 0,
          totalCuotas: 0,
          proximoVencimiento: "N/A",
          estado: "AL_DIA"
        } as unknown as IResumenCuotas;
      }
      
      return response.data;
    } catch {
      console.warn("⚠️ Fallo en getMisCuotasResumen. Cargando valores por defecto.");
      return {
        cobros: [],
        totalPendiente: 0,
        cuotasPagadas: 0,
        totalPagado: 0,
        totalCuotas: 0,
        proximoVencimiento: "N/A",
        estado: "AL_DIA"
      } as unknown as IResumenCuotas;
    }
  },

  iniciarPago: async (cobroId: number): Promise<{ url: string }> => {
    try {
      const response = await fetchClient("/pagos/transacciones/iniciar", {
        method: 'POST',
        body: JSON.stringify({ cobroId })
      });
      if (!response.success) {
        throw new Error(response.message || "No se pudo iniciar el proceso de pago");
      }
      return response.data;
    } catch (error) {
      console.error("Error en iniciarPago:", error);
      throw error;
    }
  },

  getHistorialPagos: async (): Promise<ITransaccionFamiliar[]> => {
    try {
      const response = await fetchClient("/pagos/transacciones/historial");
      
      if (!response.success) {
        console.warn("⚠️ Backend devolvió 404 para el historial. Cargando lista vacía.");
        return [];
      }
      
      return response.data || [];
    } catch {
      console.warn("⚠️ Fallo en getHistorialPagos. Cargando lista vacía por defecto.");
      return [];
    }
  },

  // ==========================================
  // 3. MÉTODOS DEL PORTAL APODERADO / DIRECTIVAS
  // ==========================================

  getMovimientosPorColegio: async (colegioId: number): Promise<IMovimientoCaja[]> => {
    try {
      const response = await fetchClient(`/pagos/movimientos/colegio/${colegioId}`);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar movimientos del colegio");
      }
      return response.data || [];
    } catch (error) {
      console.error("Error en getMovimientosPorColegio:", error);
      throw error;
    }
  },

  getCuentasPorColegio: async (colegioId: number): Promise<unknown[]> => {
    try {
      const response = await fetchClient(`/pagos/cuentas-bancarias/colegio/${colegioId}`);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar las cuentas del colegio");
      }
      return response.data || [];
    } catch (error) {
      console.error("Error en getCuentasPorColegio:", error);
      throw error;
    }
  },

  getCuentasPorCobrar: async (colegioId: number = 1): Promise<unknown[]> => {
    const response = await fetchClient(`/pagos/cobros/colegio/${colegioId}`);
    if (!response.success) {
      throw new Error(response.message || "Error al cargar la cartera de cuotas");
    }
    return response.data || [];
  },

  getCuotasByAlumno: async (alumnoId: number): Promise<ICuotaFamiliar[]> => {
    try {
      const response = await fetchClient(`/pagos/cuentas-cobrar/alumno/${alumnoId}`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error(`Error al obtener cuotas del alumno ${alumnoId}:`, error);
      return [];
    }
  },

  iniciarPagoMercadoPago: async (payload: { 
    monto: number; 
    cuotasIds: number[]; 
    buyOrder: string; 
    returnUrl: string 
  }): Promise<{ url: string }> => {
    try {
      const response = await fetchClient("/pagos/transacciones/iniciar-mercadopago", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!response.success) {
        throw new Error(response.message || "Error al iniciar MercadoPago");
      }
      return response.data;
    } catch (error) {
      console.error("Error en iniciarPagoMercadoPago:", error);
      throw error;
    }
  },

  // 🛡️ SOLUCIÓN: Simplificamos este método para que no use 'new Error()' ni 'console.error'
  getMovimientosByCuenta: async (cuentaId: number): Promise<IMovimientoCaja[]> => {
    const response = await fetchClient(`/pagos/movimientos-caja/cuenta/${cuentaId}`);
    if (!response.success) {
      // Al lanzar un string, el 'catch' de page.tsx lo ataja perfectamente, 
      // pero Next.js no lanza su pantalla roja superpuesta.
      throw response.message || "Error al cargar movimientos";
    }
    return response.data || [];
  },

  getResumenGlobal: async (colegioId: number): Promise<unknown> => {
    try {
      const response = await fetchClient(`/pagos/movimientos/resumen-global/${colegioId}`);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar el resumen financiero");
      }
      return response.data;
    } catch (error) {
      console.error("Error en getResumenGlobal:", error);
      throw error;
    }
  },

  getHistorialPorColegio: async (colegioId: number): Promise<ITransaccionFamiliar[]> => {
    try {
      const response = await fetchClient(`/pagos/transacciones/colegio/${colegioId}`);
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Error en getHistorialPorColegio:", error);
      throw error;
    }
  },

  ejecutarAperturaCaja: async (payload: { cuentaOrigenId: number, cuentaDestinoId: number }): Promise<unknown> => {
    try {
      const response = await fetchClient("/pagos/cuentas-bancarias/apertura-caja", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      if (!response.success) {
        throw new Error(response.message || "Fallo en el proceso de apertura de caja");
      }
      return response.data;
    } catch (error) {
      console.error("Error en ejecutarAperturaCaja:", error);
      throw error;
    }
  },
  getDeudoresInstitucionales: async (colegioId: number): Promise<unknown[]> => {
    try {
      const response = await fetchClient(`/pagos/cuotas/total-institucional/${colegioId}`);
      if (!response.success) throw new Error(response.message || "Error al cargar deudores");
      return response.data || [];
    } catch (error) {
      console.error("Error en getDeudoresInstitucionales:", error);
      throw error;
    }
  },

  crearCuentaBancaria: async (payload: unknown): Promise<unknown> => {
    const response = await fetchClient("/pagos/cuentas-bancarias", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (!response.success) throw new Error(response.message || "Error al crear cuenta");
    return response.data;
  },

  actualizarCuentaBancaria: async (id: number, payload: unknown): Promise<unknown> => {
    const response = await fetchClient(`/pagos/cuentas-bancarias/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    if (!response.success) throw new Error(response.message || "Error al actualizar cuenta");
    return response.data;
  },

  eliminarCuentaBancaria: async (id: number): Promise<unknown> => {
    const response = await fetchClient(`/pagos/cuentas-bancarias/${id}`, {
      method: "DELETE"
    });
    if (!response.success) throw new Error(response.message || "No se pudo eliminar la cuenta");
    return response.data;
  },

  getResumenCuotasAlumno: async (alumnoId: string): Promise<unknown> => {
    try {
      const response = await fetchClient(`/pagos/cuotas/alumno/${alumnoId}/resumen`);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar el resumen del alumno");
      }
      return response.data;
    } catch (error) {
      console.error("Error en getResumenCuotasAlumno:", error);
      throw error;
    }
  },

  getDetalleCuotasAlumno: async (alumnoId: string): Promise<unknown[]> => {
    try {
      const response = await fetchClient(`/pagos/cuotas/alumno/${alumnoId}`);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar el detalle de cuotas");
      }
      return response.data || [];
    } catch (error) {
      console.error("Error en getDetalleCuotasAlumno:", error);
      throw error;
    }
  },

  getExenciones: async (): Promise<unknown[]> => {
    try {
      const response = await fetchClient("/pagos/exenciones");
      if (!response.success) throw new Error(response.message || "Error al cargar exenciones");
      return response.data || [];
    } catch (error) {
      console.error("Error en getExenciones:", error);
      throw error;
    }
  },

  revisarExencionTesorero: async (exencionId: number, aprobado: boolean, observacion?: string | null): Promise<unknown> => {
    try {
      const response = await fetchClient(`/pagos/exenciones/${exencionId}/revision-tesorero`, {
        method: 'PATCH',
        body: JSON.stringify({ aprobado, observacion })
      });
      if (!response.success) throw new Error(response.message || "Error al procesar la firma digital");
      return response.data;
    } catch (error) {
      console.error("Error en revisarExencionTesorero:", error);
      throw error;
    }
  },

  getCategoriasPagos: async (): Promise<unknown[]> => {
    try {
      const response = await fetchClient("/pagos/categorias");
      if (!response.success) throw new Error(response.message || "Error al cargar categorías");
      return response.data || [];
    } catch (error) {
      console.error("Error en getCategoriasPagos:", error);
      throw error;
    }
  },

  registrarMovimientoManual: async (payload: unknown): Promise<unknown> => {
    try {
      const response = await fetchClient("/pagos/movimientos", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!response.success) throw new Error(response.message || "Error al registrar el movimiento");
      return response.data;
    } catch (error) {
      console.error("Error en registrarMovimientoManual:", error);
      throw error;
    }
  },
  
  validarCuentaBancaria: async (cuentaId: number, estado: 'APROBADA' | 'RECHAZADA'): Promise<unknown> => {
    try {
      const response = await fetchClient(`/pagos/cuentas-bancarias/${cuentaId}/validar`, {
        method: "PATCH", 
        body: JSON.stringify({ estado })
      });
      
      if (!response.success) throw new Error(response.message || "Error al validar la cuenta");
      return response.data;
    } catch (error) {
      console.error("Error en validarCuentaBancaria:", error);
      throw error;
    }
  },
};