export interface ICurso {
  cursoId?: number;
  CURSO_ID?: number;
  nivelId?: number;
  NIVEL_ID?: number;
  letra?: string;
  LETRA?: string;
  profesorJefeId?: number;
  PROFESOR_JEFE_ID?: number;
  
  // Datos adicionales que parece devolver tu API (JOINs)
  periodoAnio?: number;
  PERIODO_ANIO?: number;
  nivelNombreLargo?: string;
  NIVEL_NOMBRE_LARGO?: string;
  profesorNombres?: string;
  PROFESOR_NOMBRES?: string;
  profesorApellidos?: string;
  PROFESOR_APELLIDOS?: string;
}

// Interfaz para los payloads de creación/edición
export interface ICursoPayload {
  PERIODO_ID?: number;
  NIVEL_ID: number;
  LETRA: string;
  PROFESOR_JEFE_ID: number | null;
}