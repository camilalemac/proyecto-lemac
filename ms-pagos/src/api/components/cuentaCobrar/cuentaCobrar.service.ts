import { cuentaCobrarRepository } from "./cuentaCobrar.repository";
import { conceptoRepository } from "../concepto/concepto.repository";
import { metodoPagoService, CotizacionPago } from "../metodoPago/metodoPago.service";
import { ApiError } from "../../../utils/ApiError";
import CuentaCobrar from "../../../models/cuentaCobrar.model";
import sequelize from "../../../config/database.config";
import { Op } from "sequelize";
import exencion from "../../../models/exencion.model"; 

export interface ResumenCobros {
  cobros: any[]; // Cambiado a any[] temporalmente porque le inyectaremos propiedades dinámicas
  totalPendiente: number;
  totalPagado: number;
  cotizacion?: CotizacionPago;
}

// --- FUNCIÓN HELPER INTERNA MODIFICADA CON LEFT JOIN DE EXENCIONES ---
const obtenerCobrosAlumnoYFamilia = async (alumnoId: number, colegioId: number): Promise<any[]> => {
  const cobroBase = await CuentaCobrar.findOne({
    where: { ALUMNO_ID: alumnoId, COLEGIO_ID: colegioId, FECHA_BAJA: null },
    attributes: ["APODERADO_ID"],
  });

  const apoderadoId = cobroBase?.getDataValue("APODERADO_ID") || (cobroBase as any)?.APODERADO_ID;

  const cobrosEncontrados = await CuentaCobrar.findAll({
    where: {
      COLEGIO_ID: colegioId,
      FECHA_BAJA: null,
      [Op.or]: [
        { ALUMNO_ID: alumnoId }, 
        ...(apoderadoId 
          ? [{ APODERADO_ID: apoderadoId, ALUMNO_ID: { [Op.is]: null } as any }] 
          : []
        )
      ]
    },
    include: [
      {
        association: "concepto",
        required: false,
        include: [
          {
            association: "categoria",
            required: false,
          }
        ]
      },
      {
        model: exencion, 
        as: "exenciones", 
        required: false
      }
    ],
    order: [["FECHA_VENCIMIENTO", "ASC"]],
  });

  return cobrosEncontrados.map((cobro: any) => {
    const jsonCobro = cobro.toJSON();
    
    // 1. EXTRAER EL ARRAY DE EXENCIONES SOPORTANDO MAYÚSCULAS/MINÚSCULAS DE ORACLE
    const listaExenciones = jsonCobro.exenciones || jsonCobro.EXENCIONES || [];
    
    let tieneExencionAprobada = false;

    if (listaExenciones && listaExenciones.length > 0) {
      // 2. LOG DIAGNÓSTICO: Borra esto una vez verifiques en la terminal qué campos tiene tu exención
      console.log("👉 EXENCION DETECTADA PARA COBRO_ID", jsonCobro.COBRO_ID, "-> ESTRUCTURA:", listaExenciones[0]);

      tieneExencionAprobada = listaExenciones.some((ex: any) => {
        // Buscamos de forma flexible cualquier propiedad de estado
        const estado = ex.ESTADO || ex.estado || ex.ESTADO_SOLICITUD || ex.ESTADO_EXENCION || ex.ESTADO_FINAL || "";
        const valorEstado = String(estado).toUpperCase().trim();

        // Si la base de datos usa palabras clave, números o indicadores de activo/vigente
        return valorEstado === "APROBADO" || 
               valorEstado === "APROBADA" || 
               valorEstado === "ACEPTADO" ||
               ex.VIGENTE === 1 || ex.VIGENTE === "S" ||
               // Si no sabemos el estado pero el registro existe, de momento lo dejamos pasar para probar:
               (valorEstado === "" && ex.COBRO_ID !== undefined);
      });
    }

    // 3. SI TIENE EXENCIÓN Y NO ESTÁ PAGADO, FORZAMOS EL CAMBIO
    if (tieneExencionAprobada && jsonCobro.ESTADO !== "PAGADO") {
      jsonCobro.ESTADO = "EXIMIDO"; 
    }

    return jsonCobro;
  });
};


export const cuentaCobrarService = {
  listarCobrosDelAlumno: async (alumnoId: number, colegioId: number): Promise<any[]> => {
    return await obtenerCobrosAlumnoYFamilia(alumnoId, colegioId);
  },

  resumenCobros: async (
    alumnoId: number,
    colegioId: number,
    metodoId?: number,
  ): Promise<ResumenCobros> => {
    // Esta función ya recibe los cobros con el ESTADO corregido ("EXIMIDO") gracias al helper
    const cobros = await obtenerCobrosAlumnoYFamilia(alumnoId, colegioId);

    // 4. CRUCIAL: Modificados los filtros de los sumatorios
    const totalPendiente = cobros
      .filter((c: any) => c.ESTADO === "PENDIENTE") // Al ser "EXIMIDO", ya NO entrará en esta suma
      .reduce(
        (acc: number, curr: any) =>
          acc + (Number(curr.MONTO_ORIGINAL) - Number(curr.MONTO_PAGADO)),
        0,
      );

    const totalPagado = cobros
      .filter((c: any) => c.ESTADO === "PAGADO")
      .reduce((acc: number, curr: any) => acc + Number(curr.MONTO_PAGADO), 0);

    let cotizacion;
    if (metodoId && totalPendiente > 0) {
      cotizacion = await metodoPagoService.cotizarPago(totalPendiente, metodoId, colegioId);
    }

    return { cobros, totalPendiente, totalPagado, cotizacion };
  },

  crearCobro: async (data: any): Promise<CuentaCobrar> => {
    return await CuentaCobrar.create({
      ...data,
      ESTADO: "PENDIENTE",
      MONTO_PAGADO: 0,
    });
  },

  eliminarCobro: async (cobroId: number, colegioId: number): Promise<void> => {
    const deleted = await CuentaCobrar.destroy({
      where: { COBRO_ID: cobroId, COLEGIO_ID: colegioId },
    });
    if (!deleted) throw new ApiError(404, "El cobro no existe o no pertenece al colegio");
  },

  generarCobroMasivoPorCurso: async (data: {
    COLEGIO_ID: number;
    CURSO_ID: number;
    CONCEPTO_ID: number;
    DESCRIPCION: string;
    FECHA_VENCIMIENTO: Date;
    NUMERO_CUOTA: number;
    TOTAL_CUOTAS: number;
  }): Promise<{ mensaje: string; cobrosGenerados: number }> => {
    const t = await sequelize.transaction();

    try {
      const concepto = await conceptoRepository.findById(data.CONCEPTO_ID, data.COLEGIO_ID);
      if (!concepto) {
        throw new ApiError(404, `Concepto de cobro con ID ${data.CONCEPTO_ID} no encontrado`);
      }

      const alumnos = await cuentaCobrarRepository.obtenerDatosFinancierosAlumnosPorCurso(
        data.CURSO_ID,
        data.COLEGIO_ID,
      );

      if (alumnos.length === 0) {
        throw new ApiError(400, "No hay alumnos matriculados en este curso.");
      }

      const nuevosCobros = alumnos.map((alumno) => ({
        COLEGIO_ID: data.COLEGIO_ID,
        ALUMNO_ID: alumno.ALUMNO_ID,
        GRUPO_FAMILIAR_ID: alumno.GRUPO_FAMILIAR_ID,
        APODERADO_ID: alumno.APODERADO_ID,
        CONCEPTO_ID: data.CONCEPTO_ID,
        DESCRIPCION: data.DESCRIPCION,
        NUMERO_CUOTA: data.NUMERO_CUOTA,
        TOTAL_CUOTAS: data.TOTAL_CUOTAS,
        MONTO_ORIGINAL: concepto.getDataValue("MONTO_BASE"),
        FECHA_VENCIMIENTO: data.FECHA_VENCIMIENTO,
        ESTADO: "PENDIENTE",
        MONTO_PAGADO: 0,
      }));

      await cuentaCobrarRepository.bulkCreate(nuevosCobros, t);
      await t.commit();

      return {
        mensaje: "Cobros generados exitosamente",
        cobrosGenerados: nuevosCobros.length,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  resumenCobrosPorCurso: async (
    cursoId: number,
    colegioId: number,
  ): Promise<{ 
    totalPendiente: number; 
    totalPagado: number; 
    totalAlumnos: number; 
    detalleRecaudacion: Array<{ concepto: string; montoTotal: number; cantidadPagos: number }>;
    historialPagos: Array<{ alumno: string; concepto: string; monto: number; fecha: string }>;
  }> => {
    
    const alumnos = await cuentaCobrarRepository.obtenerDatosFinancierosAlumnosPorCurso(
      cursoId,
      colegioId,
    );

    if (!alumnos || alumnos.length === 0) {
      return { totalPendiente: 0, totalPagado: 0, totalAlumnos: 0, detalleRecaudacion: [], historialPagos: [] };
    }

    const alumnoIds = alumnos.map((a: any) => 
      a.ALUMNO_ID || a.alumno_id || (a.getDataValue && a.getDataValue('ALUMNO_ID'))
    ).filter(Boolean);

    const apoderadoIds = alumnos.map((a: any) => 
      a.APODERADO_ID || a.apoderado_id || (a.getDataValue && a.getDataValue('APODERADO_ID'))
    ).filter(Boolean);

    const grupoFamiliarIds = [...new Set(alumnos.map((a: any) => 
      a.GRUPO_FAMILIAR_ID || a.grupo_familiar_id || (a.getDataValue && a.getDataValue('GRUPO_FAMILIAR_ID'))
    ).filter(Boolean))];

    const mapaNombres = new Map<string | number, string>();
    alumnos.forEach((a: any) => {
      const idAlum = a.ALUMNO_ID || a.alumno_id || (a.getDataValue && a.getDataValue('ALUMNO_ID'));
      const nombres = a.NOMBRES || a.NOMBRE || a.nombre_completo || a.nombres || "";
      const apellidos = a.APELLIDOS || a.APELLIDO || a.apellidos || "";
      const nombreCompleto = `${nombres} ${apellidos}`.trim() || `Alumno #${idAlum}`;
      
      if (idAlum) mapaNombres.set(idAlum, nombreCompleto);
      
      const idFam = a.GRUPO_FAMILIAR_ID || a.grupo_familiar_id || (a.getDataValue && a.getDataValue('GRUPO_FAMILIAR_ID'));
      if (idFam) mapaNombres.set(`FAM_${idFam}`, `Familia de ${nombreCompleto}`);
      
      const idApo = a.APODERADO_ID || a.apoderado_id || (a.getDataValue && a.getDataValue('APODERADO_ID'));
      if (idApo) mapaNombres.set(`APO_${idApo}`, `Apoderado de ${nombreCompleto}`);
    });

    const cobros = await CuentaCobrar.findAll({
      where: {
        COLEGIO_ID: colegioId,
        FECHA_BAJA: null,
        [Op.or]: [
          { ALUMNO_ID: { [Op.in]: alumnoIds } },
          ...(apoderadoIds.length > 0 
            ? [{ APODERADO_ID: { [Op.in]: apoderadoIds }, ALUMNO_ID: { [Op.is]: null } as any }] 
            : []
          ),
          ...(grupoFamiliarIds.length > 0 
            ? [{ GRUPO_FAMILIAR_ID: { [Op.in]: grupoFamiliarIds }, ALUMNO_ID: { [Op.is]: null } as any }] 
            : []
          )
        ]
      },
      include: [
        {
          association: "concepto",
          where: { 
            TIPO_COBRO: { [Op.like]: "%EXTRAORDINARIO%" } 
          },
          required: true 
        }
      ],
      order: [["FECHA_VENCIMIENTO", "DESC"]]
    });

    const cobrosPendientes = cobros.filter((c: CuentaCobrar) => c.ESTADO === "PENDIENTE");
    const cobrosPagados = cobros.filter((c: CuentaCobrar) => c.ESTADO === "PAGADO");

    const totalPendiente = cobrosPendientes.reduce(
      (acc: number, curr: CuentaCobrar) => acc + (Number(curr.MONTO_ORIGINAL) - Number(curr.MONTO_PAGADO)),
      0,
    );

    const totalPagado = cobrosPagados.reduce(
      (acc: number, curr: CuentaCobrar) => acc + Number(curr.MONTO_PAGADO), 
      0
    );

    const agrupacionPorConcepto = cobrosPagados.reduce((acc: any, curr: any) => {
      const nombreConcepto = curr.concepto?.NOMBRE || "Otros / Sin Especificar";
      
      if (!acc[nombreConcepto]) {
        acc[nombreConcepto] = { concepto: nombreConcepto, montoTotal: 0, cantidadPagos: 0 };
      }
      
      acc[nombreConcepto].montoTotal += Number(curr.MONTO_PAGADO);
      acc[nombreConcepto].cantidadPagos += 1;
      
      return acc;
    }, {});

    const detalleRecaudacion = Object.values(agrupacionPorConcepto) as Array<{
      concepto: string; montoTotal: number; cantidadPagos: number;
    }>;

    const historialPagos = cobrosPagados.map((curr: any) => {
      const nombreConcepto = curr.concepto?.NOMBRE || "Otros / Sin Especificar";
      let nombreAsignado = "Estudiante Desconocido";

      if (curr.ALUMNO_ID) {
        nombreAsignado = mapaNombres.get(curr.ALUMNO_ID) || `Alumno #${curr.ALUMNO_ID}`;
      } else if (curr.GRUPO_FAMILIAR_ID) {
        nombreAsignado = mapaNombres.get(`FAM_${curr.GRUPO_FAMILIAR_ID}`) || `Familia #${curr.GRUPO_FAMILIAR_ID}`;
      } else if (curr.APODERADO_ID) {
        nombreAsignado = mapaNombres.get(`APO_${curr.APODERADO_ID}`) || `Apoderado #${curr.APODERADO_ID}`;
      }

      return {
        alumno: nombreAsignado,
        concepto: nombreConcepto,
        monto: Number(curr.MONTO_PAGADO),
        fecha: curr.FECHA_PAGO || curr.updatedAt || curr.UPDATED_AT || curr.FECHA_VENCIMIENTO || null
      };
    });

    return {
      totalPendiente,
      totalPagado,
      totalAlumnos: alumnos.length,
      detalleRecaudacion,
      historialPagos
    };
  },
};