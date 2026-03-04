"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const index_router_1 = __importDefault(require("./modules/index.router"));
// import startAllCrons from "./config/cron";      <-- 1. DISABLE CRONS
const cors_1 = __importDefault(require("cors"));
// import redisConnection from "./config/redis";   <-- 2. DISABLE REDIS IMPORT
// import { setupAllWorkers } from "./jobs";       <-- 3. DISABLE WORKERS
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, dbConnection_1.default)();
// redisConnection();  <-- 4. DISABLE REDIS CONNECTION
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
(0, index_router_1.default)(app);
// startAllCrons();    <-- 5. DISABLE CRON START
// setupAllWorkers();  <-- 6. DISABLE WORKER START
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
        stack: err.stack,
    });
});
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
