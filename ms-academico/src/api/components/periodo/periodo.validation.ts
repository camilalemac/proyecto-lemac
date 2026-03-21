import { body, param } from "express-validator";

export const validateCrearPeriodo = [
  body("ANIO")
    .notEmpty()
    .withMessage("El año del período es requerido")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año debe ser un valor entre 2000 y 2100"),

  body("NOMBRE")
    .trim()
    .notEmpty()
    .withMessage("El nombre del período es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),

  body("FECHA_INICIO")
    .notEmpty()
    .withMessage("La fecha de inicio es requerida")
    .isISO8601()
    .withMessage("La fecha de inicio debe tener formato ISO 8601 (YYYY-MM-DD)"),

  body("FECHA_FIN")
    .notEmpty()
    .withMessage("La fecha de fin es requerida")
    .isISO8601()
    .withMessage("La fecha de fin debe tener formato ISO 8601 (YYYY-MM-DD)")
    .custom((fechaFin: string, { req }) => {
      const fechaInicio = req.body.FECHA_INICIO as string;
      if (fechaInicio && new Date(fechaFin) <= new Date(fechaInicio)) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }
      return true;
    }),
];

export const validateActualizarPeriodo = [
  param("periodoId")
    .isInt({ min: 1 })
    .withMessage("El ID del período debe ser un número entero positivo"),

  body("NOMBRE")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar los 100 caracteres"),

  body("FECHA_INICIO")
    .optional()
    .isISO8601()
    .withMessage("La fecha de inicio debe tener formato ISO 8601 (YYYY-MM-DD)"),

  body("FECHA_FIN")
    .optional()
    .isISO8601()
    .withMessage("La fecha de fin debe tener formato ISO 8601 (YYYY-MM-DD)"),

  body("ESTADO")
    .optional()
    .isIn(["ACTIVO", "CERRADO"])
    .withMessage("El estado debe ser ACTIVO o CERRADO"),
];

export const validatePeriodoId = [
  param("periodoId")
    .isInt({ min: 1 })
    .withMessage("El ID del período debe ser un número entero positivo"),
];
