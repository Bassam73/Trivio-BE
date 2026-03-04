import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import authorizePostAccess from "../../core/middlewares/authorizePostAccess";
import { deleteReaction, updateReaction } from "./reacts.controller";
import { updateReactionBodySchema, reactsParamsSchema } from "./reacts.validation";

const validator = valid.createValidator();
const reactsRouter = express.Router();

reactsRouter
  .route("/:id")
  .patch(
    protectedRoutes,
    validator.params(reactsParamsSchema),
    validator.body(updateReactionBodySchema),
    authorizePostAccess,
    updateReaction
  )
  .delete(
    protectedRoutes, 
    validator.params(reactsParamsSchema),
    authorizePostAccess, 
    deleteReaction
  );

export default reactsRouter;
