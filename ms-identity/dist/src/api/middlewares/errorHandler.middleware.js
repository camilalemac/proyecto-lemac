"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../../utils/ApiError");
const logger_1 = require("../../utils/logger");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError_1.ApiError) {
        logger_1.logger.error(err.message, { stack: err.stack });
        return res
            .status(err.statusCode)
            .json({ success: false, message: err.message });
    }
    logger_1.logger.error("Internal Server Error", { error: err });
    return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
};
exports.errorHandler = errorHandler;
