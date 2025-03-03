"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
// Custom error class
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Error handler middleware
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    // Default error status and message
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = null;
    // Log the error
    logger_1.logger.error(`${req.method} ${req.path} - ${err.message}`);
    logger_1.logger.error(err.stack || "No stack trace available");
    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle Zod validation errors
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errors = err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
    }
    // Handle Mongoose validation errors
    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
    }
    // Handle Mongoose cast errors (e.g., invalid ObjectId)
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    // Handle JWT errors
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    // Handle token expired error
    else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }
    // Send response
    res.status(statusCode).json({
        success: false,
        message,
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map