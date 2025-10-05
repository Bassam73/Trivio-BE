import { NextFunction, Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import AuthService from "./auth.service";
import { loginDTO, signupDTO, verifyAccountDTO } from "../../types/user.types";

const service = AuthService.getInstance();

const signUp = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: signupDTO = req.body;
    const user = await service.signup(data);
    res.status(201).json({ status: "sucess", data: [user] });
  }
);

const login = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: loginDTO = req.body;
    const token = await service.login(data);
    res.status(200).json({ status: "sucess", data: [token] });
  }
);

const verifyCode = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: verifyAccountDTO = req.body;
    await service.verfiyAccount(data);
    res.status(200).json({ status: "success" });
  }
);
export { signUp, login, verifyCode };
