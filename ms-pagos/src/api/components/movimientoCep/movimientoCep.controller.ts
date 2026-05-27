import { Request, Response } from 'express';
import { CentroPadresService } from './movimientoCep.service';

export class CentroPadresController {
  
  static async getMovimientosHandler(req: Request, res: Response) {
    try {
      const colegioId = req.user?.colegioId || 1; 
      
      const movimientos = await CentroPadresService.getMovimientos(colegioId);
      
      const movimientosMapeados = movimientos.map((mov: any) => {
        const data = mov.dataValues || mov; 
        
        return {
          id: data.MOVIMIENTO_CEP_ID || data.movimiento_cep_id || data.id,
          tipo: data.TIPO_MOVIMIENTO_CEP || data.tipo_movimiento_cep || data.tipo,
          monto: data.MONTO_MOVIMIENTO_CEP || data.monto_movimiento_cep || data.monto,
          descripcion: data.DESC_MOVIMIENTO_CEP || data.desc_movimiento_cep || data.descripcion,
          fecha: data.FECHA_MOVIMIENTO_CEP || data.fecha_movimiento_cep || data.fecha
        };
      });

      return res.status(200).json({ data: movimientosMapeados });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getResumenHandler(req: Request, res: Response) {
    try {
      const colegioId = req.user?.colegioId || 1;
      
      const resumen = await CentroPadresService.getResumen(colegioId);
      
      return res.status(200).json({ data: resumen });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async crearMovimientoHandler(req: Request, res: Response) {
    try {
      const colegioId = req.user?.colegioId || 1;
      const { tipo, monto, descripcion, categoria } = req.body;

      if (!tipo || !monto || !descripcion) {
        return res.status(400).json({ message: "Faltan campos obligatorios: tipo, monto o descripcion" });
      }

      await CentroPadresService.crearMovimiento(colegioId, { tipo, monto, descripcion, categoria });
      return res.status(201).json({ message: "Movimiento financiero del CEP registrado exitosamente" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}