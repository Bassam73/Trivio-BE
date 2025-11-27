import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {
  createPostVal,
  paramsIdVal,
  updatePostByIdVal,
} from "./posts.validation";
import upload from "../../core/utils/upload";
import {
  createPost,
  deletePostById,
  getPublicPosts,
  getPublicPostsById,
  updatePostById,
} from "./posts.controller";

const validator = valid.createValidator();

const postsRouter = express.Router();

postsRouter
  .route("")
  .get(getPublicPosts)
  .post(
    protectedRoutes,
    validator.body(createPostVal),
    upload.fields([{ name: "media", maxCount: 10 }]),
    createPost
  );
postsRouter
  .route("/:id")
  .get(validator.params(paramsIdVal), getPublicPostsById)
  .patch(
    protectedRoutes,
    validator.params(paramsIdVal),
    validator.body(updatePostByIdVal),
    updatePostById
  )
  .delete(protectedRoutes, validator.params(paramsIdVal), deletePostById);

export default postsRouter;
