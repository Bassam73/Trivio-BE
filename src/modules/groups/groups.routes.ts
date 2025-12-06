import express from "express";
import valid from "express-joi-validation";
import {
  createGroupVal,
  paramsIdVal,
  updateGroupVal,
} from "./groups.validation";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
} from "./groups.controller";
import upload from "../../core/utils/upload";
import protectedRoutes from "../../core/middlewares/protectedRoutes";

const validator = valid.createValidator();
const groupRouter = express.Router();

groupRouter
  .route("/")
  .post(
    protectedRoutes,
    validator.body(createGroupVal),
    upload.single("logo"),
    createGroup
  )
  .get(getGroups);

groupRouter
  .route("/:id")
  .delete(protectedRoutes, validator.params(paramsIdVal), deleteGroup)
  .get(validator.params(paramsIdVal), getGroupById)
  .patch(
    protectedRoutes,
    validator.params(paramsIdVal),
    validator.body(updateGroupVal),
    upload.single("logo"),
    updateGroup
  );

export default groupRouter;
