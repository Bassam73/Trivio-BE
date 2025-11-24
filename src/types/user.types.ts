import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  role: string;
  password?: string;
  passwordChangedAt?: Date;
  code?: number;
  codeCreatedAt?: Date;
  isVerified: boolean;
  OTP?: number;
  OTPCreatedAt?: Date;
  isPremium: boolean;
}

export interface signupDTO {
  username: string;
  email: string;
  password: string | null;
  code?: number;
  codeCreatedAt?: Date;
  isVerified?: boolean;
}

export interface loginDTO {
  username?: string;
  email?: string;
  password: string;
}
export interface requsetOtpDTO {
  email: string;
}
export interface verifyAccountDTO {
  email: string;
  code: string;
}
export interface forgetPasswordDTO {
  email: string;
  otp: string;
  password: string;
}

export interface changePasswordDTO {
  id: string;
  currentPassword: string;
  savedPassword: string;
  newPassword: string;
}

export interface ChangeEmailInVerifyDTO {
  email: string;
  username: string;
  code?: number;
}