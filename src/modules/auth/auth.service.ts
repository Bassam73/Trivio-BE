import { env, throwDeprecation } from "process";
import AppError from "../../core/utils/AppError";
import sendMail from "../../core/utils/mailer";
import {
  ChangeEmailInVerifyDTO,
  changePasswordDTO,
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
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default class AuthService {
  private static instance: AuthService;
  private repo: AuthRepository;
  constructor() {
    this.repo = AuthRepository.getInstance();
  }

async signup(data: signupDTO): Promise<IUser> {
  if (!data.password) throw new AppError("Password is required", 400);

  const existingEmail = await this.repo.findAnyUserByEmail(data.email);

  if (existingEmail) {
    if (existingEmail.isVerified) {
      throw new AppError("This email is already used", 409);
    }

    const newCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.SALT_ROUNDS!)
    );

    existingEmail.password = hashedPassword;
    existingEmail.username = data.username;
    existingEmail.code = newCode;
    existingEmail.codeCreatedAt = new Date();

    const updatedUser = await this.repo.updateUser(existingEmail);
    if (!updatedUser) throw new AppError("Error while updating user", 500);

    await sendMail(updatedUser.email, updatedUser.username, newCode, "code");
    return updatedUser;
  }

  const existingUsername = await this.repo.findAnyUserByUsername(data.username);
  console.log("outside");
  if (existingUsername) {
    console.log("inside");
    throw new AppError("This username is taken", 409);
  }
  // if (existingUsername) {
  //   if (existingUsername.isVerified) {
  //     throw new AppError("This username is taken", 409);
  //   }

  //   const newCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  //   const hashedPassword = await bcrypt.hash(
  //     data.password,
  //     parseInt(process.env.SALT_ROUNDS!)
  //   );

  //   existingUsername.email = data.email;
  //   existingUsername.password = hashedPassword;
  //   existingUsername.code = newCode;
  //   existingUsername.codeCreatedAt = new Date();

  //   const updatedUser = await this.repo.updateUser(existingUsername);
  //   if (!updatedUser) throw new AppError("Error while updating user", 500);

  //   await sendMail(updatedUser.email, updatedUser.username, newCode, "code");
  //   return updatedUser;
  // }

  const hashedPassword = await bcrypt.hash(
    data.password,
    parseInt(process.env.SALT_ROUNDS!)
  );

  data.password = hashedPassword;
  data.code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  data.codeCreatedAt = new Date();

  const user = await this.repo.createUser(data);
  if (!user) throw new AppError("Error while creating the user", 500);

  await sendMail(user.email, user.username, data.code, "code");
  return user;
}


async changeEmailInVerify(data: ChangeEmailInVerifyDTO): Promise<IUser> {
  const { username, email: newEmail } = data;
  if(!username || !newEmail) throw new AppError("Username and email are required", 400);
  // console.log(username, newEmail);
  const existingVerified = await this.repo.findVerifiedUserByEmail(newEmail);
  if (existingVerified) throw new AppError("This email is already taken", 409);

  const existingUnverified = await this.repo.findAnyUserByEmail(newEmail);
  if (existingUnverified && existingUnverified.username !== username)
    throw new AppError("This email is already pending verification by another user", 409);

  const user = await this.repo.findAnyUserByUsername(username);
  if (!user) throw new AppError("User not found", 404);
  if (user.isVerified)
    throw new AppError("Cannot change email after verification", 400);

  const code = Math.floor(100000 + Math.random() * 900000);
  user.code = code;
  user.codeCreatedAt = new Date();
  user.email = newEmail;

  const updatedUser = await this.repo.updateUser(user);
  if (!updatedUser) throw new AppError("Error while updating user", 500);

  await sendMail(updatedUser.email, updatedUser.username, code, "code");
  return updatedUser;
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
      user = await this.repo.findVerifiedUserByUsername(data.username);
    } else if (data.email) {
      user = await this.repo.findVerifiedUserByEmail(data.email);
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
    const user = await this.repo.findVerifiedUserByEmail(data.email);
    if (!user) {
      throw new AppError("Account not found", 404);
    }
    const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    await this.repo.setOTP(user.id, otp);
    await sendMail(user.email, user.username, otp, "otp");
    return;
  }
  async verfiyAccount(data: verifyAccountDTO) {
    const user = await this.repo.findAnyUserByEmail(data.email);
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
    counter = (await this.repo.deleteAllUnVerifiedUsers()).deletedCount;
    return counter;
  }
  async forgetPassword(data: forgetPasswordDTO): Promise<IUser> {
    const user = await this.repo.findVerifiedUserByEmail(data.email);
    if (!user) throw new AppError("Account Not Found", 404);
    if (!user.OTP) throw new AppError("OTP is expired", 409);
    const isOTPCorrect = user.OTP == (data.otp as unknown as number);
    if (!isOTPCorrect) throw new AppError("Invalid OTP", 400);
    const password = await bcrypt.hash(
      data.password,
      parseInt(process.env.SALT_ROUNDS!)
    );
    const updatedUser = await this.repo.updatePassword(user.id, password);
    if (!updatedUser) throw new AppError("Error while updating user", 500);
    return updatedUser;
  }

  async changePassword(data: changePasswordDTO) {
    const isPasswordCorrect = await bcrypt.compare(
      data.currentPassword,
      data.savedPassword
    );
    if (!isPasswordCorrect) throw new AppError("Incorrect Password", 400);
    data.newPassword = await bcrypt.hash(data.newPassword, 12);
    const updatedUser = await this.repo.updatePassword(
      data.id,
      data.newPassword
    );
    return updatedUser;
  }

  // async resendVerificationCode(data: resetVerficationCodeDTO) {
  //   const user = await this.repo.findAnyUserByEmail(data.email);
  //   if (!user) throw new AppError("User Not Found", 404);
  //   if (user.isVerified) throw new AppError("User is already verified", 409);
  //   data.code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  //   const updatedUser = await this.repo.resetVerificationCode(data);
  //   if (!updatedUser) throw new AppError("Error While Updating User Data", 500);
  //   await sendMail(updatedUser.email, updatedUser.username, data.code, "code");
  // }

  async googleLogin(idToken: string): Promise<string> {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new AppError("Invalid Google token", 401);
    const { email } = payload;
    if (!email) throw new AppError("Google account must have an email", 400);
    let user = await this.repo.findAnyUserByEmail(email);
    if (!user) {
      const newData: signupDTO = {
        email: email,
        username: email.split("@")[0],
        password: null,
        isVerified: true,
      };
      user = await this.repo.createUser(newData);
    }

    if (!user) throw new AppError("Error While creating user", 500);
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );
    return token;
  }

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
}
