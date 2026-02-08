import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import { paramsIdVal } from "./users.validation";
import {
  followUser,
  getFollowers,
  getFollowing,
  unFollowUser,
  getRelationshipStatus,
  getMyFollowers,
  getMyFollowing,
  getMe,
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
