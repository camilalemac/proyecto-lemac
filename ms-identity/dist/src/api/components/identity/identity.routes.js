"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identityController = __importStar(require("./identity.controller"));
const identity_validation_1 = require("./identity.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const checkJwt_middleware_1 = require("../../middlewares/checkJwt.middleware");
const checkPermissions_middleware_1 = require("../../middlewares/checkPermissions.middleware");
const router = (0, express_1.Router)();
router.post("/register", identity_validation_1.validateRegister, validation_middleware_1.runValidation, identityController.register);
router.post("/login", identity_validation_1.validateLogin, validation_middleware_1.runValidation, identityController.login);
router.post("/refresh", identity_validation_1.validateRefresh, validation_middleware_1.runValidation, identityController.refresh);
router.post("/logout", checkJwt_middleware_1.checkJwt, identityController.logout);
router.get("/me", checkJwt_middleware_1.checkJwt, identityController.me);
// Funcionalidades de cuotas y gastos
router.get("/cuotas", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)([
    "alumno",
    "apoderado",
    "profesor",
    "tesorero",
    "presidente",
    "directora",
    "administrador",
]), identityController.getCuotas);
router.get("/gastos", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)([
    "alumno",
    "apoderado",
    "profesor",
    "tesorero",
    "presidente",
    "directora",
    "administrador",
]), identityController.getGastosPorCategoria);
// Funcionalidades de pago y grupo familiar
router.post("/pagos/bono-cooperacion", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["apoderado", "tesorero", "presidente", "administrador"]), identityController.pagarBonoCooperacion);
router.post("/pagos/cuotas", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["apoderado", "tesorero", "presidente", "administrador"]), identityController.pagarCuotas);
router.get("/grupo-familiar", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["apoderado", "administrador"]), identityController.getGrupoFamiliar);
// Funcionalidades profesor
router.get("/curso/alumnos", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["profesor", "tesorero", "presidente", "administrador"]), identityController.getAlumnosCurso);
router.post("/curso/promocion", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["profesor", "administrador"]), identityController.promoverAlumnos);
router.post("/curso/exencion", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["profesor", "tesorero", "administrador"]), identityController.exencionPagos);
router.post("/curso/validar-cuenta-alumno", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["profesor", "administrador"]), identityController.validarCuentaAlumno);
// Funcionalidades centro/apoderados
router.post("/reportes", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["tesorero", "presidente", "administrador"]), identityController.generarReportes);
router.post("/cuentas", checkJwt_middleware_1.checkJwt, (0, checkPermissions_middleware_1.checkPermissions)(["tesorero", "administrador"]), identityController.agregarCuentaPago);
exports.default = router;
