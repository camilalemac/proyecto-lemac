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
exports.agregarCuentaPago = exports.generarReportes = exports.validarCuentaAlumno = exports.exencionPagos = exports.promoverAlumnos = exports.getAlumnosCurso = exports.getGrupoFamiliar = exports.pagarCuotas = exports.pagarBonoCooperacion = exports.getGastosPorCategoria = exports.getCuotas = exports.me = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const identityService = __importStar(require("./identity.service"));
const register = async (req, res, next) => {
    try {
        const result = await identityService.register(req.body);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const result = await identityService.login(req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const result = await identityService.refresh(req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        await identityService.logout(req.user?.sub);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const me = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.me(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
const getCuotas = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.getCuotas(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getCuotas = getCuotas;
const getGastosPorCategoria = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.getGastosPorCategoria(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getGastosPorCategoria = getGastosPorCategoria;
const pagarBonoCooperacion = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.pagarBonoCooperacion(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.pagarBonoCooperacion = pagarBonoCooperacion;
const pagarCuotas = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.pagarCuotas(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.pagarCuotas = pagarCuotas;
const getGrupoFamiliar = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.getGrupoFamiliar(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getGrupoFamiliar = getGrupoFamiliar;
const getAlumnosCurso = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.getAlumnosCurso(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAlumnosCurso = getAlumnosCurso;
const promoverAlumnos = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.promoverAlumnos(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.promoverAlumnos = promoverAlumnos;
const exencionPagos = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.exencionPagos(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.exencionPagos = exencionPagos;
const validarCuentaAlumno = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.validarCuentaAlumno(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.validarCuentaAlumno = validarCuentaAlumno;
const generarReportes = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.generarReportes(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.generarReportes = generarReportes;
const agregarCuentaPago = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        const result = await identityService.agregarCuentaPago(userId, req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.agregarCuentaPago = agregarCuentaPago;
