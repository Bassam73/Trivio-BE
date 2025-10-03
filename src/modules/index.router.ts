import { Application } from "express";
import authRouter from "./auth/auth.routes";

export default function bootstrap(app: Application) {
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
  });
  app.use("/api/v1/auth", authRouter);
}
