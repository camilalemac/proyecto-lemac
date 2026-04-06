import { body, param } from "express-validator";

export const validateCrearCategoria = [
  body("NOMBRE")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar 100 caracteres"),
  body("DESCRIPCION")
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage("La descripción no puede superar 255 caracteres"),
];

export const validateActualizarCategoria = [
  param("categoriaId")
    .isInt({ min: 1 })
    .withMessage("El ID de categoría debe ser un entero positivo"),
  body("NOMBRE")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar 100 caracteres"),
  body("DESCRIPCION")
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage("La descripción no puede superar 255 caracteres"),
];

export const validateCategoriaId = [
  param("categoriaId")
    .isInt({ min: 1 })
    .withMessage("El ID de categoría debe ser un entero positivo"),
];
