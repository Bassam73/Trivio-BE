"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_joi_validation_1 = __importDefault(require("express-joi-validation"));
const like_controller_1 = require("./like.controller");
const like_validation_1 = require("./like.validation");
const likeRouter = express_1.default.Router();
const validator = express_joi_validation_1.default.createValidator();
likeRouter.patch("/toggle-like", validator.body(like_validation_1.toggleLikeVal), like_controller_1.toggleLike);
