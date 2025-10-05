import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  code?: number;
  codeCreatedAt?: Date;
  isVerfied: boolean;
  OTP?: number;
  OTPCreatedAt?: Date;
}

export interface signupDTO {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  code?: number;
  codeCreatedAt?: Date;
  isVerfied?: boolean;
}

export interface loginDTO {
  username?: string;
  email?: string;
  password: string;
}

export interface verifyAccountDTO {
  email: string;
  code: string;
}
