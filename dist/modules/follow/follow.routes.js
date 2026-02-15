"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_joi_validation_1 = __importDefault(require("express-joi-validation"));
const protectedRoutes_1 = __importDefault(require("../../core/middlewares/protectedRoutes"));
const follow_controller_1 = require("./follow.controller");
const follow_validation_1 = require("./follow.validation");
const validator = express_joi_validation_1.default.createValidator();
const followRouter = express_1.default.Router();
followRouter.get("/me", protectedRoutes_1.default, follow_controller_1.getFollowRequests);
followRouter.patch("/:requestId/accept", protectedRoutes_1.default, validator.params(follow_validation_1.followRequestVal), follow_controller_1.acceptFollowRequest);
followRouter.patch("/follow-requests/:requestId/decline", protectedRoutes_1.default, validator.params(follow_validation_1.followRequestVal), follow_controller_1.declineFollowRequest);
exports.default = followRouter;
