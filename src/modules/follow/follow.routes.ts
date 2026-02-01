import express from "express";
import valid from "express-joi-validation";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {
  acceptFollowRequest,
  declineFollowRequest,
  getFollowRequests,
} from "./follow.controller";
import { followRequestVal } from "./follow.validation";
const validator = valid.createValidator();
const followRouter = express.Router();

followRouter.get("/me", protectedRoutes, getFollowRequests);
followRouter.patch(
  "/follow-requests/:requestId/accept",
  protectedRoutes,
  validator.params(followRequestVal),
  acceptFollowRequest,
);
followRouter.patch(
  "/follow-requests/:requestId/decline",
  protectedRoutes,
  validator.params(followRequestVal),
  declineFollowRequest,
);
export default followRouter;
