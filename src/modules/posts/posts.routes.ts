import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {
  createPostVal,
  paramsIdVal,
  updatePostByIdVal,
} from "./posts.validation";
import { uploadMedia } from "../../core/utils/upload";
import {
  createComment,
  createPost,
  deletePostById,
  getPublicPosts,
  getPublicPostsById,
  updatePostById,
  getPostComments,
  createPostReaction,
  getPostReactions,
} from "./posts.controller";
import authorizePostAccess from "../../core/middlewares/authorizePostAccess";

const validator = valid.createValidator();
import { createReactionSchema } from "../reacts/reacts.validation";

const postsRouter = express.Router();

postsRouter
  .route("")
  .get(getPublicPosts)
  .post(
    protectedRoutes,
    validator.body(createPostVal),
    uploadMedia.fields([{ name: "media", maxCount: 10 }]),
    createPost,
  );
postsRouter
  .route("/:id/comments")
  .post(
    protectedRoutes,
    authorizePostAccess,
    validator.params(paramsIdVal),
    createComment,
  )
  .get(
    protectedRoutes,
    authorizePostAccess,
    validator.params(paramsIdVal),
    getPostComments
  );
postsRouter
  .route("/:id")
  .get(validator.params(paramsIdVal), getPublicPostsById)
  .patch(
    protectedRoutes,
    validator.params(paramsIdVal),
    validator.body(updatePostByIdVal),
    updatePostById,
  )
  .delete(protectedRoutes, validator.params(paramsIdVal), deletePostById);

postsRouter
  .route("/:id/reacts")
  .post(
    protectedRoutes,
    authorizePostAccess,
    validator.params(paramsIdVal),
    validator.body(createReactionSchema),
    createPostReaction
  )
  .get(
    protectedRoutes,
    authorizePostAccess,
    validator.params(paramsIdVal),
    getPostReactions
  );


export default postsRouter;
