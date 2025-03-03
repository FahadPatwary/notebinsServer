"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const logger_1 = require("./config/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const routes_1 = __importDefault(require("./routes"));
const cleanupService_1 = require("./services/cleanupService");
const socketService_1 = require("./services/socketService");
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
// Setup Socket.io handlers
(0, socketService_1.setupSocketHandlers)(io);
// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/notebins";
        await mongoose_1.default.connect(mongoURI);
        logger_1.logger.info("MongoDB connected successfully");
        // Initialize cleanup service after DB connection
        (0, cleanupService_1.setupCleanupService)();
    }
    catch (error) {
        logger_1.logger.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
connectDB();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Routes
app.use("/api", routes_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// Error handling
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger_1.logger.error("Unhandled Promise Rejection:", err);
    // Don't crash the server in production
    if (process.env.NODE_ENV === "development") {
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map