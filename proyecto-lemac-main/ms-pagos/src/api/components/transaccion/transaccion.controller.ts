import { Request, Response } from "express";
import { transaccionService } from "./transaccion.service";
import { transaccionRepository } from "./transaccion.repository";

export const transaccionController = {
  // Obtener todas las transacciones de un colegio (para el historial)
  obtenerPorColegio: async (req: Request, res: Response): Promise<void> => {
    try {
      const { colegioId } = req.params;
      const transacciones = await transaccionRepository.findAllByColegio(Number(colegioId));
      res.status(200).json(transacciones);
    } catch (error: any) {
      res.status(500).json({ message: "Error al obtener transacciones", error: error.message });
    }
  },

  // Confirmación manual (Caja/Tesorero) - Reemplaza al antiguo confirmarTransferenciaManual
  confirmarPagoManual: async (req: Request, res: Response): Promise<void> => {
    try {
      const { cobrosIds, colegioId, metodo } = req.body;

      if (!cobrosIds || !colegioId || !metodo) {
        res.status(400).json({ message: "Faltan datos requeridos (cobrosIds, colegioId, metodo)" });
        return;
      }

      await transaccionService.confirmarPagoManual({ cobrosIds, colegioId, metodo });
      res.status(200).json({ message: "Pago manual registrado con éxito" });
    } catch (error: any) {
      res.status(500).json({ message: "Error al confirmar pago manual", error: error.message });
    }
  },
};
