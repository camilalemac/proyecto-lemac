import { body, query } from "express-validator";

export const validateGenerarReporte = [
  body("titulo").trim().notEmpty().withMessage("El título del reporte es requerido"),
  body("colegio").trim().notEmpty().withMessage("El nombre del colegio es requerido"),
  body("periodo").trim().notEmpty().withMessage("El período es requerido"),
  body("tipoPeriodo")
    .isIn(["mensual", "trimestral", "anual"])
    .withMessage("El tipo de período debe ser mensual, trimestral o anual"),
  body("generadoPor").trim().notEmpty().withMessage("El nombre del generador es requerido"),
  body("ingresos").isArray().withMessage("Los ingresos deben ser un arreglo"),
  body("egresos").isArray().withMessage("Los egresos deben ser un arreglo"),
  body("cuotasPagadas").isArray().withMessage("Las cuotas pagadas deben ser un arreglo"),
  body("cuotasPendientes").isArray().withMessage("Las cuotas pendientes deben ser un arreglo"),
  body("saldoInicial")
    .isFloat({ min: 0 })
    .withMessage("El saldo inicial debe ser un número positivo"),
  body("saldoFinal").isFloat().withMessage("El saldo final debe ser un número"),
];

export const validateListarReportes = [
  query("cursoId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del curso debe ser un entero positivo"),
];
