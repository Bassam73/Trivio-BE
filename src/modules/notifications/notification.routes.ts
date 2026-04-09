import express from "express";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import {
  getNotifications,
  markNotificationAsRead,
} from "./notification.controller";
import valid from "express-joi-validation";
import { paramsIdVal } from "../follow/follow.validation";
const validator = valid.createValidator();
const notificationRouter = express.Router();

notificationRouter.get("/", protectedRoutes, getNotifications);

notificationRouter.put(
  "/:id",
  protectedRoutes,
  validator.params(paramsIdVal),
  markNotificationAsRead,
);
export default notificationRouter;
