import { Request, Response } from "express";
import { MercadoPagoAdapter } from "./mercadopago.adapter";
import { IniciarPagoParams } from "./pasarela.interface";

export const iniciarPagoMercadoPago = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extraemos los datos del body (lo que enviaremos desde ThunderClient)
    const { monto, descripcion, returnUrl, cobrosIds, colegioId } = req.body;

    // 2. Validaciones básicas para no enviar basura a MercadoPago
    if (!monto || !descripcion || !returnUrl || !cobrosIds || !colegioId) {
      res.status(400).json({
        message: "Faltan datos obligatorios (monto, descripcion, returnUrl, cobrosIds, colegioId)",
      });
      return;
    }

    if (!Array.isArray(cobrosIds) || cobrosIds.length === 0) {
      res.status(400).json({ message: "cobrosIds debe ser un arreglo con al menos un ID" });
      return;
    }

    // 3. Instanciamos nuestro adaptador
    const pasarela = new MercadoPagoAdapter();

    // 4. Armamos los parámetros respetando nuestra interfaz
    const params: IniciarPagoParams = {
      monto,
      descripcion,
      returnUrl,
      cobrosIds,
      colegioId,
    };

    // 5. Llamamos a MercadoPago y esperamos el link
    const resultado = await pasarela.iniciarPago(params);

    // 6. Devolvemos el link al cliente (ThunderClient / Frontend)
    res.status(200).json({
      url: resultado.urlPago, // Aquí va el link de MercadoPago
      token: resultado.tokenPasarela, // Y el token por si lo necesitas para futuras confirmaciones
      message: "Link de pago generado con éxito",
     
    });
  } catch (error: any) {
    console.error("[Pasarela Controller] Error al iniciar pago:", error);
    res.status(500).json({
      message: "Error interno al generar el link de pago",
      error: error.message,
    });
  }
};

export const getConfiguracionBono = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      monto: 25000,
      descripcion: "Bono Cooperación 2026"
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener configuración" });
  }
}
