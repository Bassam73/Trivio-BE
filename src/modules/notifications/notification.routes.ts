import express from "express";
import protectedRoutes from "../../core/middlewares/protectedRoutes";
import { getNotifications } from "./notification.controller";

const notificationRouter = express.Router();

notificationRouter.get("/", protectedRoutes, getNotifications);

export default notificationRouter;
