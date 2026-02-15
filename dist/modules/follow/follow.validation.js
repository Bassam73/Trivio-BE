"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followRequestVal = exports.paramsIdVal = void 0;
const joi_1 = __importDefault(require("joi"));
exports.paramsIdVal = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
exports.followRequestVal = joi_1.default.object({
    requestId: joi_1.default.string().hex().length(24).required(),
});
