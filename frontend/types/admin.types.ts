// ==========================================
// 1. TIPOS GENÉRICOS DE LA API
// ==========================================
export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ==========================================
// 2. TIPOS PARA EL DASHBOARD PRINCIPAL
// ==========================================
export interface IUserProfile {
  user_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;       // Rol base (string)
  roles?: any[];     // ✅ AÑADE ESTO (Opcional por si no vienen siempre)
  colegioId: number; 
  COLEGIO_ID?: number; // ✅ AÑADE ESTO (Para compatibilidad con Oracle)
}
// ... tus otras interfaces ...

// ✅ AÑADE ESTA INTERFAZ AL FINAL DEL ARCHIVO Y GUARDA
export interface IReporteDocumento {
  DOCUMENTO_ID: number;
  TITULO: string;
  TIPO_DOCUMENTO: string;
  DESCRIPCION?: string;
  URL_ARCHIVO: string;
  FECHA_DE_CREACION: string;
}

export interface ITransaccion {
  transaccion_id?: number;
  COBRO_ID?: number;
  cobroId?: number;
  MONTO_PAGO?: number | string;
  montoPago?: number | string;
  METODO_PAGO?: string;
  metodoPago?: string;
  fecha_pago?: string;
}

// ==========================================
// 3. TIPOS PARA GESTIÓN DE CURSOS
// ==========================================
export interface ICurso {
  cursoId?: number;
  CURSO_ID?: number;
  nivelId?: number;
  NIVEL_ID?: number;
  letra?: string;
  LETRA?: string;
  profesorJefeId?: number;
  PROFESOR_JEFE_ID?: number;
  
  // Datos adicionales de los JOINs
  periodoAnio?: number;
  PERIODO_ANIO?: number;
  nivelNombreLargo?: string;
  NIVEL_NOMBRE_LARGO?: string;
  profesorNombres?: string;
  PROFESOR_NOMBRES?: string;
  profesorApellidos?: string;
  PROFESOR_APELLIDOS?: string;
}

export interface ICursoPayload {
  PERIODO_ID?: number;
  NIVEL_ID: number;
  LETRA: string;
  PROFESOR_JEFE_ID: number | null;
}
// ==========================================
// 4. TIPOS PARA AUDITORÍA (MS_AUTH)
// ==========================================
export interface ILog {
  logId?: number;
  LOG_ID?: number;
  colegioId?: number;
  COLEGIO_ID?: number;
  authId?: number;
  AUTH_ID?: number;
  fechaHora?: string;
  FECHA_HORA?: string;
  ipOrigen?: string;
  IP_ORIGEN?: string;
  accion?: string;
  ACCION?: string;
  userAgent?: string;
  USER_AGENT?: string;
}
// ==========================================
// 5. TIPOS PARA MÉTODOS DE PAGO (MS_PAGOS)
// ==========================================
export interface IMetodoPago {
  metodoId?: number;
  METODO_ID?: number;
  colegioId?: number;
  COLEGIO_ID?: number;
  nombreMetodo?: string;
  NOMBRE_METODO?: string;
  comisionPorcentaje?: number;
  COMISION_PORCENTAJE?: number;
  comisionFija?: number;
  COMISION_FIJA?: number;
  impuestoPorcentaje?: number;
  IMPUESTO_PORCENTAJE?: number;
  estado?: string;
  ESTADO?: string;
}

export interface IMetodoPagoPayload {
  NOMBRE_METODO: string;
  COMISION_PORCENTAJE: number;
  COMISION_FIJA: number;
  IMPUESTO_PORCENTAJE: number;
  ESTADO: string;
}
// Tipos para Periodos Académicos (MS_ACADEMICO)
export interface IPeriodo {
  periodoId?: number;
  PERIODO_ID?: number;
  colegioId?: number;
  COLEGIO_ID?: number;
  anio?: number;
  ANIO?: number;
  nombre?: string;
  NOMBRE?: string;
  fechaInicio?: string;
  FECHA_INICIO?: string;
  fechaFin?: string;
  FECHA_FIN?: string;
  estado?: string;
  ESTADO?: string;
}

export interface IPeriodoPayload {
  ANIO: number;
  NOMBRE: string;
  FECHA_INICIO?: string | null;
  FECHA_FIN?: string | null;
}
// ==========================================
// 6. TIPOS PARA PORTAL ALUMNO (COBROS)
// ==========================================
export interface ICobroAlumno {
  COBRO_ID: number;
  DESCRIPCION: string;
  MONTO_ORIGINAL: number;
  FECHA_VENCIMIENTO: string;
  ESTADO: 'PENDIENTE' | 'PAGADO';
}

export interface IResumenCuotas {
  cobros: ICobroAlumno[];
  totalPendiente: number;
  totalPagado: number;
}

// Para la barra lateral de Cuotas Especiales
export interface IConceptoEspecial {
  CONCEPTO_ID: number;
  NOMBRE: string;
  MONTO_BASE: number;
  TIPO_COBRO: string;
}
export interface IHistorialPago {
  TRANSACCION_ID: number;
  COBRO_ID: number;
  DESCRIPCION?: string;
  FECHA_PAGO: string;
  MONTO_PAGO: number;
  METODO_PAGO: string;
}
export interface IPupilo {
  ALUMNO_ID: number;
  ALUMNO_NOMBRES: string;
  ALUMNO_APELLIDOS: string;
  ALUMNO_RUT: string;
  ALUMNO_RUT_DV: string;
  TIPO_RELACION: string;
  CURSO?: string;
}
export interface ICuotaFamiliar extends ICobroAlumno {
  NOMBRE_ALUMNO: string;
  MONTO?: number; // Para compatibilidad con variaciones de nombres en el backend
}
export interface IMovimientoCaja {
  MOVIMIENTO_ID: number;
  TIPO_MOVIMIENTO: 'INGRESO' | 'EGRESO';
  MONTO: number;
  GLOSA: string;
  CATEGORIA_NOMBRE?: string;
  CATEGORIA_ID?: number;
  FECHA_MOVIMIENTO: string;
}

export interface IGastoGrafico {
  name: string;
  value: number;
  porcentaje: number;
}
export interface ITransaccionFamiliar {
  TRANSACCION_ID: number;
  COBRO_ID: number;
  MONTO_PAGO: number;
  METODO_PAGO: string;
  FECHA_PAGO: string;
  DESCRIPCION_COBRO?: string; // Opcional, si haces JOIN con pag_cuentas_cobrar
}
