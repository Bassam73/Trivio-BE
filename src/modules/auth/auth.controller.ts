import { NextFunction, Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import AuthService from "./auth.service";
import { signupDTO } from "../../types/user.types";

const service = AuthService.getInstance();

const signUp = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: signupDTO = req.body;
    const user = await service.signup(data);
    res.status(201).json({ status: "sucess", data: [user] });
  }
);

export { signUp };
