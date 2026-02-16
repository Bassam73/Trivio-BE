import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import { paramsIdVal } from "./users.validation";
import { uploadImage } from "../../core/utils/upload";

import {
  followUser,
  getFollowers,
  getFollowing,
  unFollowUser,
  getRelationshipStatus,
  getMyFollowers,
  getMyFollowing,
  getLikePostsID,
  getLikedPosts,
  getUserPosts,
  getSavedPosts,
  updateProfile,
  getMe,
  getFavTeams,
  getFavPlayers,
  removeFavPlayer,
  removeFavTeam,
  changePassword
} from "./users.controller";
const validator = valid.createValidator();
const usersRouter = express.Router();
usersRouter
  .route("/:id/follow")
  .post(protectedRoutes, validator.params(paramsIdVal), followUser)
  .delete(protectedRoutes, validator.params(paramsIdVal), unFollowUser);

usersRouter.get("/me/followers", protectedRoutes, getMyFollowers);
usersRouter.get("/me/following", protectedRoutes, getMyFollowing);

usersRouter.get("/me", protectedRoutes, getMe);

usersRouter.get("/me/likedPostsIds", protectedRoutes, getLikePostsID);
usersRouter.get("/me/likedPosts", protectedRoutes, getLikedPosts);
usersRouter.get("/me/saved-posts", protectedRoutes, getSavedPosts);
usersRouter.get("/me/posts", protectedRoutes, getUserPosts);


usersRouter.get("/me/favTeams", protectedRoutes, getFavTeams);
usersRouter.get("/me/favPlayers", protectedRoutes, getFavPlayers);
usersRouter.patch("/me/removeFavPlayer", protectedRoutes, removeFavPlayer);
usersRouter.patch("/me/removeFavTeam", protectedRoutes, removeFavTeam);
usersRouter.patch("/me/changePassword", protectedRoutes, changePassword);



usersRouter.patch("/me/updateProfile", protectedRoutes, uploadImage.fields([{ name: "avatar", maxCount: 1 }]), updateProfile);

usersRouter.get(
  "/:id/followers",
  protectedRoutes,
  validator.params(paramsIdVal),
  getFollowers,
);

usersRouter.get(
  "/:id/following",
  protectedRoutes,
  validator.params(paramsIdVal),
  getFollowing,
);

usersRouter.get(
  "/:id/relationship-status",
  protectedRoutes,
  validator.params(paramsIdVal),
  getRelationshipStatus,
);

export default usersRouter;
