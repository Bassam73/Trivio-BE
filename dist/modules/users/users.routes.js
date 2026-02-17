"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_joi_validation_1 = __importDefault(require("express-joi-validation"));
const protectedRoutes_1 = __importDefault(require("../../core/middlewares/protectedRoutes"));
const users_validation_1 = require("./users.validation");
const upload_1 = require("../../core/utils/upload");
const users_controller_1 = require("./users.controller");
const validator = express_joi_validation_1.default.createValidator();
const usersRouter = express_1.default.Router();
usersRouter
    .route("/:id/follow")
    .post(protectedRoutes_1.default, validator.params(users_validation_1.paramsIdVal), users_controller_1.followUser)
    .delete(protectedRoutes_1.default, validator.params(users_validation_1.paramsIdVal), users_controller_1.unFollowUser);
usersRouter.get("/me/followers", protectedRoutes_1.default, users_controller_1.getMyFollowers);
usersRouter.get("/me/following", protectedRoutes_1.default, users_controller_1.getMyFollowing);
usersRouter.get("/me", protectedRoutes_1.default, users_controller_1.getMe);
usersRouter.get("/me/suggestUsersToFollow", protectedRoutes_1.default, users_controller_1.suggestUsers);
usersRouter.get("/me/likedPostsIds", protectedRoutes_1.default, users_controller_1.getLikePostsID);
usersRouter.get("/me/likedPosts", protectedRoutes_1.default, users_controller_1.getLikedPosts);
usersRouter.get("/me/saved-posts", protectedRoutes_1.default, users_controller_1.getSavedPosts);
usersRouter.get("/me/posts", protectedRoutes_1.default, users_controller_1.getUserPosts);
usersRouter.get("/me/favTeams", protectedRoutes_1.default, users_controller_1.getFavTeams);
usersRouter.get("/me/favPlayers", protectedRoutes_1.default, users_controller_1.getFavPlayers);
usersRouter.patch("/me/removeFavPlayer", protectedRoutes_1.default, users_controller_1.removeFavPlayer);
usersRouter.patch("/me/removeFavTeam", protectedRoutes_1.default, users_controller_1.removeFavTeam);
usersRouter.patch("/me/changePassword", protectedRoutes_1.default, users_controller_1.changePassword);
usersRouter.patch("/me/updateProfile", protectedRoutes_1.default, upload_1.uploadImage.fields([{ name: "avatar", maxCount: 1 }]), users_controller_1.updateProfile);
usersRouter.get("/:id/followers", protectedRoutes_1.default, validator.params(users_validation_1.paramsIdVal), users_controller_1.getFollowers);
usersRouter.get("/:id/following", protectedRoutes_1.default, validator.params(users_validation_1.paramsIdVal), users_controller_1.getFollowing);
usersRouter.get("/:id/relationship-status", protectedRoutes_1.default, validator.params(users_validation_1.paramsIdVal), users_controller_1.getRelationshipStatus);
exports.default = usersRouter;
