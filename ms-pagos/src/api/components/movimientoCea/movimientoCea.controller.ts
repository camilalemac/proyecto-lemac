import { Request, Response } from 'express';
import { CentroAlumnosService } from './movimientoCea.service';

export class CentroAlumnosController {
  
  static async getMovimientosHandler(req: Request, res: Response) {
    try {
      // Asumimos que tienes un middleware que mete el usuario decodificado en req.user
      // Si no, puedes sacarlo de req.params.colegioId
      const colegioId = req.user?.colegioId || 1; // Ajusta según tu lógica de tokens
      
      const movimientos = await CentroAlumnosService.getMovimientos(colegioId);
      
      // ✅ ARREGLO: Adaptamos la respuesta buscando de forma segura tanto en Sequelize (dataValues) como en formato crudo (mayúsculas/minúsculas)
      const movimientosMapeados = movimientos.map((mov: any) => {
        const data = mov.dataValues || mov; // Extraemos la data real
        
        return {
          id: data.MOVIMIENTO_CEA_ID || data.movimiento_cea_id || data.id,
          tipo: data.TIPO_MOVIMIENTO_CEA || data.tipo_movimiento_cea || data.tipo,
          monto: data.MONTO_MOVIMIENTO_CEA || data.monto_movimiento_cea || data.monto,
          descripcion: data.DESC_MOVIMIENTO_CEA || data.desc_movimiento_cea || data.descripcion,
          fecha: data.FECHA_MOVIMIENTO_CEA || data.fecha_movimiento_cea || data.fecha
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
      
      const resumen = await CentroAlumnosService.getResumen(colegioId);
      
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

      await CentroAlumnosService.crearMovimiento(colegioId, { tipo, monto, descripcion, categoria });
      return res.status(201).json({ message: "Movimiento financiero registrado exitosamente" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}