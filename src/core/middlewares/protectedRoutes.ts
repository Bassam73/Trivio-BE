import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import jwt from "jsonwebtoken";
import catchError from "./catchError";
import userModel from "../../database/models/user.model";

const protectedRoutes = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      return next(
        new AppError(
          "Server configuration error: JWT secret is not defined.",
          500
        )
      );
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      iat: number;
    };

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        (user.passwordChangedAt.getTime() / 1000).toString(),
        10
      );

      if (changedTimestamp > decoded.iat) {
        return next(
          new AppError(
            "User recently changed password! Please log in again.",
            401
          )
        );
      }
    }
    req.user = user;

    next();
  }
);

export default protectedRoutes;
