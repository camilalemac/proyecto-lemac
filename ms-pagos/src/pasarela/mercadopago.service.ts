import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import CuentaCobrar from "../models/cuentaCobrar.model"; // Ajusta la ruta a tu modelo
import { ApiError } from "../utils/ApiError";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export const mercadopagoService = {
  // --- FUNCIÓN CORREGIDA Y DEFINITIVA ---
  crearPreferenciaCheckout: async (cobrosIds: number[]) => {
    const cobros = await CuentaCobrar.findAll({ where: { COBRO_ID: cobrosIds } });
    if (!cobros || cobros.length === 0) throw new ApiError(404, "No se encontraron los cobros.");

    let subtotal = 0;
    cobros.forEach((c: any) => {
      subtotal += (Number(c.MONTO_ORIGINAL) - Number(c.MONTO_PAGADO));
    });

    if (subtotal <= 0) throw new ApiError(400, "Monto debe ser mayor a 0.");

    const recargoMP = Math.round(subtotal * 0.0415);
    const totalFinal = subtotal + recargoMP;

    const preference = new Preference(client);
    
    try {
      const response = await preference.create({
        body: {
          items: [{
            id: "pago_cuotas",
            title: "Pago de Cuotas Escolares LJRE",
            description: `Pago de ${cobros.length} cuota(s) y recargo por servicio`,
            quantity: 1,
            unit_price: totalFinal,
            currency_id: "CLP",
          }],
          back_urls: {
            success: "https://clever-ghosts-tell.loca.lt/apoderado?pago=exito",
            failure: "https://clever-ghosts-tell.loca.lt/apoderado?pago=fallido",
            pending: "https://clever-ghosts-tell.loca.lt/apoderado?pago=pendiente"
          },
          // ✅ REACTIVADO: Al haber saltado la alerta de la IP, esto te redirigirá solo y de inmediato
          auto_return: "approved", 
          notification_url: "https://nontransmittible-priestlier-grazyna.ngrok-free.dev/api/v1/pagos/pasarela/mercadopago/webhook",
          metadata: {
            cobros_ids: cobrosIds.join(",") 
          }
        }
      });

      return {
        sandbox_init_point: response.sandbox_init_point,
        init_point: response.init_point
      };
    } catch (error: any) {
      console.log("🚨 DETALLE DEL ERROR DE MERCADOPAGO:", JSON.stringify(error.cause || error.message || error, null, 2));
      throw new ApiError(500, "Error al comunicar con MercadoPago");
    }
  },

  // --- PROCESAR EL WEBHOOK ---
  procesarNotificacionWebhook: async (paymentId: string) => {
    try {
      const paymentClient = new Payment(client);
      
      // 1. Consultamos a MercadoPago los detalles oficiales de esta transacción
      const paymentData = await paymentClient.get({ id: paymentId });

      // 2. Si el pago fue aprobado exitosamente
      if (paymentData.status === "approved") {
        const cobrosIdsString = paymentData.metadata?.cobros_ids;
        
        if (!cobrosIdsString) {
          console.warn(`[Webhook MP] Pago ${paymentId} aprobado pero no contiene metadata de cobros_ids.`);
          return;
        }

        // Recuperamos el arreglo de números [102, 103]
        const cobrosIds = cobrosIdsString.split(",").map(Number);

        console.log(`[Webhook MP] Procesando pago aprobado para los cobros: ${cobrosIds}`);

        // 3. Actualizamos las cuotas en tu Base de Datos
        for (const id of cobrosIds) {
          const cobro: any = await CuentaCobrar.findByPk(id);
          if (cobro) {
            // Marcamos el cobro como pagado al 100%
            cobro.ESTADO = "PAGADO";
            cobro.MONTO_PAGADO = cobro.MONTO_ORIGINAL; 
            await cobro.save();
          }
        }
        console.log(`[Webhook MP] Base de datos actualizada con éxito para el pago ${paymentId}`);
      }
    } catch (error) {
      console.error("Error al procesar el Webhook de MercadoPago:", error);
      throw error;
    }
  }
};