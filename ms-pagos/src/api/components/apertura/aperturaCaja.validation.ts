import { body, param, query } from "express-validator";

export const validateRegistrarApertura = [
  body("CURSO_ID")
    .notEmpty()
    .withMessage("El ID del curso es requerido")
    .isInt({ min: 1 })
    .withMessage("Debe ser un entero positivo"),
  body("PERIODO_ANIO")
    .notEmpty()
    .withMessage("El periodo/año es requerido")
    .isInt({ min: 2020, max: 2100 })
    .withMessage("Debe ser un año de 4 dígitos válido"),
  body("MONTO_APERTURA")
    .notEmpty()
    .withMessage("El monto de apertura es requerido")
    .isInt({ min: 0 })
    .withMessage("No puede ser negativo y debe ser un valor entero"),
];

export const validateObtenerApertura = [
  param("cursoId")
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un entero positivo"),
  query("periodoAnio")
    .notEmpty()
    .withMessage("El parámetro periodoAnio es requerido en la consulta (query)")
    .isInt({ min: 2020, max: 2100 })
    .withMessage("Debe ser un año de 4 dígitos válido"),
];