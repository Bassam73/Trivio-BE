import express from "express";
import valid from "express-joi-validation";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
  joinGroup,
  leaveGroup,
  getGroupRequests,
  acceptJoinRequest,
  declineJoinRequest,
  cancelJoinRequest,
} from "./groups.controller"; 
import {
  createGroupVal,
  paramsIdVal,
  updateGroupVal,
  paramsRequestIdVal,
} from "./groups.validation";
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
    upload.single("logo"),
    validator.body(updateGroupVal),
    updateGroup
  );


groupRouter
  .route("/:id/join")
  .post(protectedRoutes, validator.params(paramsIdVal), joinGroup);

groupRouter
  .route("/:id/leave")
  .delete(protectedRoutes, validator.params(paramsIdVal), leaveGroup);

groupRouter
  .route("/:id/requests")
  .get(protectedRoutes, validator.params(paramsIdVal), getGroupRequests);

groupRouter
  .route("/:id/requests/cancel")
  .delete(protectedRoutes, validator.params(paramsIdVal), cancelJoinRequest);

groupRouter
  .route("/:id/requests/:requestId/accept")
  .post(
    protectedRoutes,
    validator.params(paramsRequestIdVal),
    acceptJoinRequest
  );

groupRouter
  .route("/:id/requests/:requestId/decline")
  .post(
    protectedRoutes,
    validator.params(paramsRequestIdVal),
    declineJoinRequest
  );

export default groupRouter;
