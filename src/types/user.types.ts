import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  code?: number;
  codeCreatedAt?: Date;
}

export interface signupDTO {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  code?: number;
  codeCreatedAt?: Date;
}
