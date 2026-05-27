import { body, param, query } from "express-validator";

export const validateCrearMatricula = [
  body("CURSO_ID")
    .notEmpty()
    .withMessage("El ID del curso es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un número entero positivo"),

  body("ALUMNO_ID")
    .notEmpty()
    .withMessage("El ID del alumno es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del alumno debe ser un número entero positivo"),

  body("ANIO")
    .notEmpty()
    .withMessage("El año de la matrícula es requerido")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año debe ser un valor entre 2000 y 2100"),

  body("FECHA_ALTA")
    .notEmpty()
    .withMessage("La fecha de alta es requerida")
    .isISO8601()
    .withMessage("La fecha de alta debe tener formato ISO 8601 (YYYY-MM-DD)"),
];

export const validatePromoverAlumnos = [
  param("cursoId")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un número entero positivo"),

  body("alumnosPromovidosIds")
    .isArray()
    .withMessage("Se debe enviar un arreglo de IDs de alumnos promovidos")
    .custom((ids: unknown[]) => {
      if (!Array.isArray(ids)) return false;
      return ids.every((id) => Number.isInteger(id) && (id as number) > 0);
    })
    .withMessage("Todos los IDs de alumnos promovidos deben ser números enteros positivos"),
];

export const validateMatriculaId = [
  param("matriculaId")
    .isInt({ min: 1 })
    .withMessage("El ID de la matrícula debe ser un número entero positivo"),
];

export const validateAlumnoId = [
  param("alumnoId")
    .isInt({ min: 1 })
    .withMessage("El ID del alumno debe ser un número entero positivo"),
];

export const validateCursoIdParam = [
  param("cursoId")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un número entero positivo"),
];

export const validateListarPorAlumno = [
  query("alumnoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del alumno debe ser un número entero positivo"),
];
