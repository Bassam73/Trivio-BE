"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const index_router_1 = __importDefault(require("./modules/index.router"));
const cron_1 = __importDefault(require("./config/cron"));
// import cors from "cors";
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, dbConnection_1.default)();
app.use(express_1.default.json());
// app.use(cors({
//   origin: '*',
// }));
(0, index_router_1.default)(app);
(0, cron_1.default)();
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
        stack: err.stack,
    });
});
const PORT = parseInt(process.env.PORT, 10);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
