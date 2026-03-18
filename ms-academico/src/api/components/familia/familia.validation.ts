import { body, param } from "express-validator";

export const validateVincularApoderado = [
  body("ALUMNO_ID")
    .notEmpty()
    .withMessage("El ID del alumno es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del alumno debe ser un número entero positivo"),

  body("APODERADO_ID")
    .notEmpty()
    .withMessage("El ID del apoderado es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del apoderado debe ser un número entero positivo"),

  body("TIPO_RELACION")
    .trim()
    .notEmpty()
    .withMessage("El tipo de relación es requerido")
    .isIn(["PADRE", "MADRE", "TUTOR", "ABUELO", "ABUELA", "OTRO"])
    .withMessage("El tipo de relación debe ser: PADRE, MADRE, TUTOR, ABUELO, ABUELA u OTRO"),

  body("ES_APODERADO_ACAD")
    .notEmpty()
    .withMessage("Debe indicar si es apoderado académico")
    .isBoolean()
    .withMessage("ES_APODERADO_ACAD debe ser un valor booleano"),

  body("ES_TITULAR_FINAN")
    .notEmpty()
    .withMessage("Debe indicar si es titular financiero")
    .isBoolean()
    .withMessage("ES_TITULAR_FINAN debe ser un valor booleano"),

  body("AUTORIZADO_RETIRO")
    .notEmpty()
    .withMessage("Debe indicar si está autorizado para el retiro")
    .isBoolean()
    .withMessage("AUTORIZADO_RETIRO debe ser un valor booleano"),
];

export const validateActualizarRelacion = [
  param("relacionId")
    .isInt({ min: 1 })
    .withMessage("El ID de la relación debe ser un número entero positivo"),

  body("TIPO_RELACION")
    .optional()
    .trim()
    .isIn(["PADRE", "MADRE", "TUTOR", "ABUELO", "ABUELA", "OTRO"])
    .withMessage("El tipo de relación debe ser: PADRE, MADRE, TUTOR, ABUELO, ABUELA u OTRO"),

  body("ES_APODERADO_ACAD")
    .optional()
    .isBoolean()
    .withMessage("ES_APODERADO_ACAD debe ser un valor booleano"),

  body("ES_TITULAR_FINAN")
    .optional()
    .isBoolean()
    .withMessage("ES_TITULAR_FINAN debe ser un valor booleano"),

  body("AUTORIZADO_RETIRO")
    .optional()
    .isBoolean()
    .withMessage("AUTORIZADO_RETIRO debe ser un valor booleano"),
];

export const validateRelacionId = [
  param("relacionId")
    .isInt({ min: 1 })
    .withMessage("El ID de la relación debe ser un número entero positivo"),
];

export const validateAlumnoIdParam = [
  param("alumnoId")
    .isInt({ min: 1 })
    .withMessage("El ID del alumno debe ser un número entero positivo"),
];
