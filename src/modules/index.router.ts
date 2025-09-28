import { Application } from "express";

export default function bootstrap(app: Application) {
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
  });
}
