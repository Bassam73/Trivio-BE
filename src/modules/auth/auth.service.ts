import AppError from "../../core/utils/AppError";
import sendMail from "../../core/utils/mailer";
import {
  IUser,
  loginDTO,
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
    if (data.password !== data.confirm_password)
      throw new AppError("Password and confirm_password are not matching", 400);
    const checkEmail = await this.repo.findUserByEmail(data.email);
    if (checkEmail) throw new AppError("This email is used before", 409);
    const checkUsername = await this.repo.findUserByUsername(data.username);
    if (checkUsername) throw new AppError("This is username is taken", 409);
    data.password = await bcrypt.hash(data.password, 12);
    data.code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    data.codeCreatedAt = new Date(Date.now());
    await sendMail(data.email, data.username, data.code);
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

  async verfiyAccount(data: verifyAccountDTO) {
    const user = await this.repo.findUserByEmail(data.email);
    if (!user) throw new AppError("Account Not Found", 404);
    if (user.isVerfied) throw new AppError("User Is Already Verified", 409);
    if (!user.code) throw new AppError("Verfication Code is expired", 409);
    const isCorrect = user.code == (data.code as unknown as number);
    if (!isCorrect) throw new AppError("Verfication code is wrong", 400);
    this.repo.verifyUser(user.id);
  }

  async checkVerficationCodes(): Promise<number> {
    let counter: number;
    counter = (await this.repo.updateAllUnVerifiedUsers()).modifiedCount;
    return counter;
  }
  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
}
