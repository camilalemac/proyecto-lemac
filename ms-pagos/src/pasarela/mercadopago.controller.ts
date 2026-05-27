import { Request, Response, NextFunction } from "express";
import { mercadopagoService } from "./mercadopago.service";

export const procesarCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cobrosIds } = req.body;
    if (!cobrosIds || !Array.isArray(cobrosIds) || cobrosIds.length === 0) {
      res.status(400).json({ success: false, message: "Debe enviar un arreglo de cobrosIds" });
      return;
    }
    const resultado = await mercadopagoService.crearPreferenciaCheckout(cobrosIds);
    res.status(200).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
};

// --- NUEVO CONTROLADOR PARA EL WEBHOOK ---
export const recibirWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, data } = req.body;

    // MercadoPago envía eventos de varios tipos. A nosotros solo nos importa "payment"
    if (type === "payment" && data?.id) {
      // Ejecutamos la lógica en segundo plano
      await mercadopagoService.procesarNotificacionWebhook(data.id);
    }

    // SIEMPRE responder 200 OK inmediatamente a MercadoPago
    res.status(200).send("OK");
  } catch (err) {
    console.error("Error controlado en Webhook:", err);
    // Respondemos 200 de todas formas para que MercadoPago no se quede atrapado en un loop de reintentos
    res.status(200).send("Error procesado"); 
  }
};