import { env } from "process";
import AppError from "../../core/utils/AppError";
import sendMail from "../../core/utils/mailer";
import {
  forgetPasswordDTO,
  IUser,
  loginDTO,
  requsetOtpDTO,
  signupDTO,
  verifyAccountDTO,
} from "../../types/user.types";
import AuthRepository from "./auth.repo";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export default class AuthService {
  private static instance: AuthService;
  private repo: AuthRepository;
  constructor() {
    this.repo = AuthRepository.getInstance();
  }

  async signup(data: signupDTO): Promise<IUser> {
    if (!data.password) throw new AppError("Password is required", 400);
    const checkEmail = await this.repo.findUserByEmailSignup(data.email);
    if (checkEmail) throw new AppError("This email is used before", 409);
    const checkUsername = await this.repo.findUserByUsernameSignup(data.username);    console.log(checkUsername);
    if (checkUsername) throw new AppError("This is username is taken", 409);
    data.password = await bcrypt.hash(data.password, parseInt(process.env.SALT_ROUNDS!));
    data.code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    data.codeCreatedAt = new Date(Date.now());
    await sendMail(data.email, data.username, data.code, "code");
    const user = await this.repo.createUser(data);
    if (!user) throw new AppError("Error While creating the user", 500);
    return user;
  }

  async login(data: loginDTO): Promise<String | null> {
    if (!data.username && !data.email) {
      throw new AppError("Username or email is required", 400);
    }
    if (data.username && data.email) {
      throw new AppError("Provide either username or email, not both", 400);
    }

    let user;
    if (data.username) {
      user = await this.repo.findUserByUsername(data.username);
    } else if (data.email) {
      user = await this.repo.findUserByEmail(data.email);
    }
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.password) {
      throw new AppError("User password not set", 500);
    }
    if (!user.isVerified) {
      throw new AppError("Account is not verified", 403);
    }
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      throw new AppError("Invalid password", 401);
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );
    return token;
  }

  async requestOTP(data: requsetOtpDTO) {
    const user = await this.repo.findUserByEmail(data.email);
    if (!user) {
      throw new AppError("Account not found", 404);
    }
    const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    await this.repo.setOTP(user.id, otp);
    await sendMail(user.email, user.username, otp, "otp");
    return;
  }
  async verfiyAccount(data: verifyAccountDTO) {
    const user = await this.repo.findUserByEmailVerify(data.email);
    if (!user) throw new AppError("Account Not Found", 404);
    if (user.isVerified) throw new AppError("User Is Already Verified", 409);
    if (!user.code) throw new AppError("Verfication Code is expired", 409);
    const isCorrect = user.code == (data.code as unknown as number);
    if (!isCorrect) throw new AppError("Verfication code is wrong", 400);
    this.repo.verifyUser(user.id);
  }

  async checkOTPRequests(): Promise<number> {
    let counter: number;
    counter = (await this.repo.deleteAllExpiredOTP()).modifiedCount;
    return counter;
  }
  async checkVerficationCodes(): Promise<number> {
    let counter: number;
    counter = (await this.repo.updateAllUnVerifiedUsers()).modifiedCount;
    return counter;
  }
  async forgetPassword(data: forgetPasswordDTO) : Promise<IUser> {
    const user = await this.repo.findUserByEmail(data.email);
    if (!user) throw new AppError("Account Not Found", 404);
    if (!user.OTP) throw new AppError("OTP is expired", 409);
    const isOTPCorrect = user.OTP == (data.otp as unknown as number);
    if (!isOTPCorrect) throw new AppError("Invalid OTP", 400);
    const password = await bcrypt.hash(data.password, parseInt(process.env.SALT_ROUNDS!));
    const updatedUser = await this.repo.updatePassword(user.id, password);
    if(!updatedUser) throw new AppError("Error while updating user" ,500)
    return updatedUser;
  }
  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
}
