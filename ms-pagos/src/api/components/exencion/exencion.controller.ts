import { Request, Response, NextFunction } from "express";
import { exencionService } from "./exencion.service";
import { CuentaCobrar } from "../../../models/cuentaCobrar.model"; 

export const listarExenciones = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exenciones = await exencionService.listarExenciones(req.user!.colegioId);
    const exencionesPlanos = exenciones.map((ex: any) => (ex.toJSON ? ex.toJSON() : ex));

    if (exencionesPlanos.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const cobrosMap: Record<number, number> = {};

    // 1. Intentar extraer APODERADO_ID desde el include de Sequelize de forma segura
    exencionesPlanos.forEach((ex: any) => {
      const idCobro = ex.COBRO_ID || ex.cobroId;
      const cobroObjeto = ex.cobro;
      const idApoderado = cobroObjeto?.APODERADO_ID || cobroObjeto?.apoderadoId;

      if (idCobro && idApoderado) {
        cobrosMap[Number(idCobro)] = Number(idApoderado);
      }
    });

    // 2. Buscar en BD cobros rezagados que no traían el apoderado en la primera query
    const cobroIdsFaltantes = exencionesPlanos
      .map((ex: any) => Number(ex.COBRO_ID || ex.cobroId))
      .filter(id => id && !cobrosMap[id]);

    if (cobroIdsFaltantes.length > 0) {
      const cuentasDb = await CuentaCobrar.findAll({
        where: { COBRO_ID: cobroIdsFaltantes },
        attributes: ['COBRO_ID', 'APODERADO_ID'],
        raw: true
      });

      cuentasDb.forEach((c: any) => {
        const idCobro = c.COBRO_ID || c.cobroId;
        const idApoderado = c.APODERADO_ID || c.apoderadoId;
        if (idCobro && idApoderado) {
          cobrosMap[Number(idCobro)] = Number(idApoderado);
        }
      });
    }

    // 3. Obtener lista única de IDs de apoderados para consultar a Identity
    const apoderadosIds = [...new Set(exencionesPlanos.map((ex: any) => {
      const idCobro = Number(ex.COBRO_ID || ex.cobroId);
      return cobrosMap[idCobro];
    }).filter(Boolean))];

    const usuariosMap: Record<number, string> = {};

    if (apoderadosIds.length > 0) {
      const gatewayUrl = process.env.MS_GATEWAY_URL || "http://localhost:3002/api/v1";
      const baseUrl = gatewayUrl.replace(/\/$/, "");
      const token = req.headers.authorization;

      await Promise.all(
        apoderadosIds.map(async (id) => {
          const urlCompleta = `${baseUrl}/identity/users/${id}`;
          try {
            const response = await fetch(urlCompleta, {
              method: 'GET',
              headers: { 
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }) 
              }
            });
            
            if (response.ok) {
              const resJson = await response.json();
              const u = resJson.data?.perfil || resJson.perfil || resJson.data || resJson;
              
              if (u) {
                const nombres = u.nombres || u.NOMBRES || "";
                const apellidos = u.apellidos || u.APELLIDOS || "";
                const nombreCompleto = `${nombres} ${apellidos}`.trim();
                usuariosMap[id as number] = nombreCompleto || `Apoderado #${id}`;
              }
            }
          } catch (fetchErr) {
            console.error(`❌ Error consultando Identity para ID ${id}:`, fetchErr);
          }
        })
      );
    }

    // 4. Construcción del payload final enriquecido y aplanado para las Vistas
    const dataConNombres = exencionesPlanos.map((ex: any) => {
      const idCobro = Number(ex.COBRO_ID || ex.cobroId);
      const idApoderado = cobrosMap[idCobro];
      
      // Rescatamos de forma segura el concepto anidado traído por el repositorio
      const conceptoObj = ex.cobro?.concepto;
      const conceptoNombre = conceptoObj?.NOMBRE || conceptoObj?.nombre || conceptoObj?.DESCRIPCION || "No especificado";

      return {
        ...ex,
        APODERADO_NOMBRE: idApoderado ? (usuariosMap[idApoderado] || `Apoderado #${idApoderado}`) : "No asignado",
        CONCEPTO_NOMBRE: conceptoNombre,
        // Forzamos copia limpia en la raíz para mitigar discrepancias de mayúsculas en el frontend
        COBRO_ID: idCobro,
        ESTADO_FINAL: ex.ESTADO_FINAL || "PENDIENTE"
      };
    });

    res.status(200).json({ success: true, data: dataConNombres });
  } catch (err) {
    next(err);
  }
};

export const listarPendientes = listarExenciones; 

export const solicitarExencion = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
  try { 
    const { COBRO_ID, MOTIVO } = req.body; 
    const exencion = await exencionService.solicitarExencion({ COLEGIO_ID: req.user!.colegioId, COBRO_ID, MOTIVO }); 
    res.status(201).json({ success: true, data: exencion }); 
  } catch (err) { next(err); } 
};

export const revisarComoProfesor = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
  try { 
    const { aprobado } = req.body; 
    const exencion = await exencionService.revisarComoProfesor(Number(req.params.exencionId), req.user!.colegioId, aprobado, req.user!.userId); 
    res.status(200).json({ success: true, data: exencion }); 
  } catch (err) { next(err); } 
};

export const revisarComoTesorero = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
  try { 
    const { aprobado, observacion } = req.body; 
    const exencion = await exencionService.revisarComoTesorero(Number(req.params.exencionId), req.user!.colegioId, aprobado, req.user!.userId, observacion ?? null); 
    res.status(200).json({ success: true, data: exencion }); 
  } catch (err) { next(err); } 
};