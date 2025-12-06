"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLike = void 0;
const catchError_1 = __importDefault(require("../../core/middlewares/catchError"));
const like_service_1 = __importDefault(require("./like.service"));
const service = like_service_1.default.getInstance();
const toggleLike = (0, catchError_1.default)(async (req, res, next) => {
    const data = req.body;
    const user = await service.toggleLike(data);
    res.status(200).json({ status: "success", data: [user] });
});
exports.toggleLike = toggleLike;
