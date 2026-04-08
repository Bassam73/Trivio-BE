import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {
  changePasswordVal,
  paramsIdVal,
  removeFavPlayerVal,
  removeFavTeamVal,
  updateProfileVal,
} from "./users.validation";
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
  changePassword,
  suggestUsers,
  getMyJoinedGroups,
  getMyGroups,
  getChatbotHistory,
  sendMessageChatbot,
  getUserInfo,
  getMyNotifications,
  getUserPostsByID,
  savePost,
  unsavePost,
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
// usersRouter.get("/me/suggestUsersToFollow", protectedRoutes, suggestUsers);

usersRouter.get("/me/likedPostsIds", protectedRoutes, getLikePostsID);
usersRouter.get("/me/likedPosts", protectedRoutes, getLikedPosts);
usersRouter.get("/me/saved-posts", protectedRoutes, getSavedPosts);
usersRouter.get("/me/posts", protectedRoutes, getUserPosts);

usersRouter.get("/me/favTeams", protectedRoutes, getFavTeams);
usersRouter.get("/me/favPlayers", protectedRoutes, getFavPlayers);

usersRouter.patch(
  "/me/removeFavPlayer",
  protectedRoutes,
  validator.body(removeFavPlayerVal),
  removeFavPlayer,
);
usersRouter.patch(
  "/me/removeFavTeam",
  protectedRoutes,
  validator.body(removeFavTeamVal),
  removeFavTeam,
);
usersRouter.patch(
  "/me/changePassword",
  protectedRoutes,
  validator.body(changePasswordVal),
  changePassword,
);

usersRouter.patch(
  "/me/updateProfile",
  protectedRoutes,
  uploadImage.fields([{ name: "avatar", maxCount: 1 }]),
  validator.body(updateProfileVal),
  updateProfile,
);
usersRouter.post("/me/save-posts", protectedRoutes, savePost);

usersRouter.delete("/me/unsave-posts", protectedRoutes, unsavePost);

usersRouter.get("/me/save-posts", protectedRoutes, getSavedPosts);
usersRouter.get("/:id", protectedRoutes, getUserInfo);

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
  "/:id/posts",
  protectedRoutes,
  validator.params(paramsIdVal),
  getUserPostsByID,
);
usersRouter.get(
  "/:id/relationship-status",
  protectedRoutes,
  validator.params(paramsIdVal),
  getRelationshipStatus,
);

usersRouter.get("/me/joined-groups", protectedRoutes, getMyJoinedGroups);
usersRouter.get("/me/my-groups", protectedRoutes, getMyGroups);

usersRouter.get("/chatbot/get-history", protectedRoutes, getChatbotHistory);
usersRouter.post("/chatbot/send-message", protectedRoutes, sendMessageChatbot);

usersRouter.get("/me/notifications", protectedRoutes, getMyNotifications);

export default usersRouter;
