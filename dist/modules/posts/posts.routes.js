"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_joi_validation_1 = __importDefault(require("express-joi-validation"));
const protectedRoutes_1 = __importDefault(require("../../core/middlewares/protectedRoutes"));
const posts_validation_1 = require("./posts.validation");
const upload_1 = require("../../core/utils/upload");
const posts_controller_1 = require("./posts.controller");
const validator = express_joi_validation_1.default.createValidator();
const postsRouter = express_1.default.Router();
postsRouter
    .route("")
    .get(posts_controller_1.getPublicPosts)
    .post(protectedRoutes_1.default, validator.body(posts_validation_1.createPostVal), upload_1.uploadMedia.fields([{ name: "media", maxCount: 10 }]), posts_controller_1.createPost);
postsRouter
    .route("/:id")
    .get(validator.params(posts_validation_1.paramsIdVal), posts_controller_1.getPublicPostsById)
    .patch(protectedRoutes_1.default, validator.params(posts_validation_1.paramsIdVal), validator.body(posts_validation_1.updatePostByIdVal), posts_controller_1.updatePostById)
    .delete(protectedRoutes_1.default, validator.params(posts_validation_1.paramsIdVal), posts_controller_1.deletePostById);
exports.default = postsRouter;
