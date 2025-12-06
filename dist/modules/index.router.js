"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bootstrap;
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
function bootstrap(app) {
    app.get("/", (req, res) => {
        res.status(200).json({ message: "Hello World" });
    });
    app.use("/api/v1/auth", auth_routes_1.default);
}
