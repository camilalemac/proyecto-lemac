"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefresh = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email válido requerido"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 8 })
        .withMessage("Password mínimo 8 caracteres"),
];
exports.validateLogin = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email válido requerido"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password requerido"),
];
exports.validateRefresh = [
    (0, express_validator_1.body)("refreshToken").notEmpty().withMessage("Refresh token es requerido"),
];
