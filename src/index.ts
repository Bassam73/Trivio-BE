import express, { NextFunction, Request, Response } from "express";
import env from "dotenv";
import dbConnection from "./config/dbConnection";
import AppError from "./core/utils/AppError";
import bootstrap from "./modules/index.router";
import startAllCrons from "./config/cron";
import cors from "cors";
import redisConnection from "./config/redis";
env.config();

const app = express();
dbConnection();
redisConnection();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

bootstrap(app);
startAllCrons();
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
    stack: err.stack,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
