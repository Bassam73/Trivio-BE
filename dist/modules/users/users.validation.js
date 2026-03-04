"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileVal = exports.removeFavPlayerVal = exports.removeFavTeamVal = exports.changePasswordVal = exports.paramsIdVal = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonStringArray = (value, helpers) => {
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
            return value;
        }
        return helpers.error("any.invalid");
    }
    catch (error) {
        return helpers.error("any.invalid");
    }
};
exports.paramsIdVal = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
exports.changePasswordVal = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
    newPassword: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .required(),
});
exports.removeFavTeamVal = joi_1.default.object({
    teams: joi_1.default.array().items(joi_1.default.string()).max(50).required(),
});
exports.removeFavPlayerVal = joi_1.default.object({
    players: joi_1.default.array().items(joi_1.default.string()).max(50).required(),
});
exports.updateProfileVal = joi_1.default.object({
    username: joi_1.default.string().
        // alphanum().
        min(3).max(20),
    email: joi_1.default.string().email(),
    bio: joi_1.default.string().max(160),
    avatar: joi_1.default.string(),
    favTeams: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string().custom(jsonStringArray)),
    favPlayers: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string().custom(jsonStringArray)),
});
