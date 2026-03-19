import { body, param } from "express-validator";

export const validateVincularApoderado = [
  body("ALUMNO_ID")
    .notEmpty()
    .withMessage("El ID del alumno es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("APODERADO_ID")
    .notEmpty()
    .withMessage("El ID del apoderado es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("TIPO_RELACION")
    .trim()
    .notEmpty()
    .withMessage("El tipo de relación es requerido")
    .isIn(["PADRE", "MADRE", "ABUELO", "TIO", "HERMANO", "TUTOR"])
    .withMessage("Tipo de relación inválido"),
  body("ES_APODERADO_ACAD")
    .notEmpty()
    .withMessage("Debe indicar si es apoderado académico")
    .isIn(["S", "N"])
    .withMessage("Debe ser S o N"),
  body("ES_TITULAR_FINAN")
    .notEmpty()
    .withMessage("Debe indicar si es titular financiero")
    .isIn(["S", "N"])
    .withMessage("Debe ser S o N"),
  body("AUTORIZADO_RETIRO")
    .notEmpty()
    .withMessage("Debe indicar si está autorizado para el retiro")
    .isIn(["S", "N"])
    .withMessage("Debe ser S o N"),
];

export const validateActualizarRelacion = [
  param("relacionId")
    .isInt({ min: 1 })
    .withMessage("El ID de la relación debe ser un entero positivo"),
  body("TIPO_RELACION")
    .optional()
    .trim()
    .isIn(["PADRE", "MADRE", "ABUELO", "TIO", "HERMANO", "TUTOR"])
    .withMessage("Tipo de relación inválido"),
  body("ES_APODERADO_ACAD").optional().isIn(["S", "N"]).withMessage("Debe ser S o N"),
  body("ES_TITULAR_FINAN").optional().isIn(["S", "N"]).withMessage("Debe ser S o N"),
  body("AUTORIZADO_RETIRO").optional().isIn(["S", "N"]).withMessage("Debe ser S o N"),
];

export const validateRelacionId = [
  param("relacionId")
    .isInt({ min: 1 })
    .withMessage("El ID de la relación debe ser un entero positivo"),
];

export const validateAlumnoIdParam = [
  param("alumnoId").isInt({ min: 1 }).withMessage("El ID del alumno debe ser un entero positivo"),
];
