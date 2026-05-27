import { body, param, query } from "express-validator";

export const validateCrearMetodo = [
  body("NOMBRE_METODO")
    .trim()
    .notEmpty()
    .withMessage("El nombre del método es requerido")
    .isLength({ max: 50 })
    .withMessage("El nombre no puede superar 50 caracteres"),
  body("COMISION_PORCENTAJE")
    .notEmpty()
    .withMessage("La comisión porcentual es requerida")
    .isFloat({ min: 0, max: 100 })
    .withMessage("La comisión porcentual debe estar entre 0 y 100"),
  body("COMISION_FIJA")
    .notEmpty()
    .withMessage("La comisión fija es requerida")
    .isFloat({ min: 0 })
    .withMessage("La comisión fija no puede ser negativa"),
  body("IMPUESTO_PORCENTAJE")
    .notEmpty()
    .withMessage("El impuesto es requerido")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El impuesto debe estar entre 0 y 100"),
];

export const validateActualizarMetodo = [
  param("metodoId").isInt({ min: 1 }).withMessage("El ID del método debe ser un entero positivo"),
  body("NOMBRE_METODO")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 50 })
    .withMessage("El nombre no puede superar 50 caracteres"),
  body("COMISION_PORCENTAJE")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("La comisión porcentual debe estar entre 0 y 100"),
  body("COMISION_FIJA")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("La comisión fija no puede ser negativa"),
  body("IMPUESTO_PORCENTAJE")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("El impuesto debe estar entre 0 y 100"),
  body("ESTADO")
    .optional()
    .isIn(["ACTIVO", "INACTIVO"])
    .withMessage("El estado debe ser ACTIVO o INACTIVO"),
];

export const validateMetodoId = [
  param("metodoId").isInt({ min: 1 }).withMessage("El ID del método debe ser un entero positivo"),
];

export const validateCotizacion = [
  query("monto")
    .notEmpty()
    .withMessage("El monto es requerido")
    .isFloat({ min: 1 })
    .withMessage("El monto debe ser mayor a 0"),
  query("metodoId")
    .notEmpty()
    .withMessage("El ID del método es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del método debe ser un entero positivo"),
];
