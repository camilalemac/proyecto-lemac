import { body, param, query } from "express-validator";

export const validateCrearCurso = [
  body("PERIODO_ID")
    .notEmpty()
    .withMessage("El ID del período es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del período debe ser un número entero positivo"),

  body("NIVEL_ID")
    .notEmpty()
    .withMessage("El ID del nivel es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del nivel debe ser un número entero positivo"),

  body("LETRA")
    .trim()
    .notEmpty()
    .withMessage("La letra del curso es requerida")
    .isLength({ max: 5 })
    .withMessage("La letra no puede superar los 5 caracteres")
    .matches(/^[A-Z]$/)
    .withMessage("La letra debe ser una sola letra mayúscula (A-Z)"),

  body("PROFESOR_JEFE_ID")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("El ID del profesor jefe debe ser un número entero positivo"),
];

export const validateActualizarCurso = [
  param("cursoId")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un número entero positivo"),

  body("NIVEL_ID")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del nivel debe ser un número entero positivo"),

  body("LETRA")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La letra no puede estar vacía")
    .isLength({ max: 5 })
    .withMessage("La letra no puede superar los 5 caracteres")
    .matches(/^[A-Z]$/)
    .withMessage("La letra debe ser una sola letra mayúscula (A-Z)"),

  body("PROFESOR_JEFE_ID")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("El ID del profesor jefe debe ser un número entero positivo"),
];

export const validateAsignarProfesorJefe = [
  param("cursoId")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un número entero positivo"),

  body("PROFESOR_JEFE_ID")
    .notEmpty()
    .withMessage("El ID del profesor jefe es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del profesor jefe debe ser un número entero positivo"),
];

export const validateCursoId = [
  param("cursoId")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un número entero positivo"),
];

export const validateListarCursos = [
  query("periodoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del período debe ser un número entero positivo"),
];
