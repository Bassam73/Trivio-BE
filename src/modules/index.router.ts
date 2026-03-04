import { Application } from "express";
import authRouter from "./auth/auth.routes";
import postsRouter from "./posts/posts.routes";
import groupRouter from "./groups/groups.routes";
import commentsRouter from "./comments/comments.routes";
import usersRouter from "./users/users.routes";
import followRouter from "./follow/follow.routes";

import reactsRouter from "./reacts/reacts.routes";

export default function bootstrap(app: Application) {
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
  });
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/posts", postsRouter);
  app.use("/api/v1/groups", groupRouter);
  app.use("/api/v1/comments", commentsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/follow-requests", followRouter);
  app.use("/api/v1/reacts", reactsRouter);
}
