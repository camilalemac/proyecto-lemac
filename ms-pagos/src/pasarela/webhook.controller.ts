import { Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { transaccionRepository } from "../api/components/transaccion/transaccion.repository";
import { cuentaCobrarRepository } from "../api/components/cuentaCobrar/cuentaCobrar.repository";
import sequelize from "../config/database.config";

export const webhookMercadoPago = async (req: Request, res: Response): Promise<void> => {
  // 1. Respondemos 200 OK lo más rápido posible.
  console.log("🚨 [DEBUG WEBHOOK] Query:", req.query, "Body:", req.body);
  res.status(200).send("OK");

  try {
    // 🔍 EL CAMBIO CLAVE: Leer de query y de body por seguridad
    const type = req.query.type || req.body?.type;
    const topic = req.query.topic;
    const dataId = req.query["data.id"] || req.query.id || req.body?.data?.id;

    // Solo nos interesan los eventos de tipo "payment"
    if ((type === "payment" || topic === "payment") && dataId) {
      console.log(`[Webhook MP] Procesando pago ID: ${dataId}`); // Log para saber que entramos al bloque

      const accessToken = process.env.MP_ACCESS_TOKEN;
      if (!accessToken) throw new Error("MP_ACCESS_TOKEN no definido");

      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      // 2. Buscamos el pago real en MP usando el ID que extrajimos
      // Convertimos dataId a string porque el SDK de MP a veces es estricto
      const paymentData = await payment.get({ id: String(dataId) });

      // 3. Si el pago fue aprobado, hacemos la magia en la base de datos
      if (paymentData.status === "approved" && paymentData.metadata) {
        const colegioId = Number(paymentData.metadata.colegio_id);
        const cobrosIds = paymentData.metadata.cobros_ids as number[];

        const t = await sequelize.transaction();

        try {
          const cobros = await cuentaCobrarRepository.findByIds(cobrosIds, colegioId);

          const transaccionesData = cobros.map((cobro) => ({
            COLEGIO_ID: colegioId,
            COBRO_ID: cobro.COBRO_ID,
            MONTO_PAGO: Number(cobro.MONTO_ORIGINAL) - Number(cobro.DESCUENTO),
            METODO_PAGO: "MERCADOPAGO",
          }));

          await transaccionRepository.registrarMultiples(transaccionesData, t);
          await cuentaCobrarRepository.marcarComoPagados(cobrosIds, colegioId, t);

          await t.commit();
          console.log(`✅ [Webhook MP] Pago ${dataId} consolidado con éxito. Cobros: ${cobrosIds}`);
        } catch (dbError) {
          await t.rollback();
          console.error(`❌ [Webhook MP] Error al consolidar pago ${dataId} en BD:`, dbError);
        }
      } else {
        console.log(`[Webhook MP] Pago ${dataId} ignorado. Estado: ${paymentData.status}`);
      }
    }
  } catch (error) {
    console.error("🚨 [Webhook MP] Error general procesando el webhook:", error);
  }
};
