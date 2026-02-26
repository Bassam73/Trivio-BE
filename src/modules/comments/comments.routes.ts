import express from "express";
import valid from "express-joi-validation";
import authorizePostAccess from "../../core/middlewares/authorizePostAccess";
import {
  deleteComment,
  getComment,
  updateComment,
  createReply,
  getReplies,
} from "./comments.controller";
import { createReplySchema, updateCommentSchema } from "./comments.validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
const validator = valid.createValidator();
const commentsRouter = express.Router();
commentsRouter.route("/:cid").put(
  protectedRoutes,
  validator.body(updateCommentSchema),
  authorizePostAccess,
  updateComment,
).get(protectedRoutes, authorizePostAccess, getComment).
delete(protectedRoutes, authorizePostAccess, deleteComment);

commentsRouter.route("/:cid/replies").post(
  protectedRoutes,
  validator.body(createReplySchema),
  authorizePostAccess,
  createReply,
).get(protectedRoutes, authorizePostAccess, getReplies);

export default commentsRouter;
