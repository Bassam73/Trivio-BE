import express, { NextFunction, Request, Response } from "express";
import env from "dotenv";
import dbConnection from "./config/dbConnection";
import AppError from "./core/utils/AppError";
import bootstrap from "./modules/index.router";
// import startAllCrons from "./config/cron";      <-- 1. DISABLE CRONS
import cors from "cors";
// import redisConnection from "./config/redis";   <-- 2. DISABLE REDIS IMPORT
// import { setupAllWorkers } from "./jobs";       <-- 3. DISABLE WORKERS
import path from 'path'
env.config();

const app = express();
dbConnection();

// redisConnection();  <-- 4. DISABLE REDIS CONNECTION

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

bootstrap(app);

// startAllCrons();    <-- 5. DISABLE CRON START
// setupAllWorkers();  <-- 6. DISABLE WORKER START

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
    stack: err.stack,
  });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});