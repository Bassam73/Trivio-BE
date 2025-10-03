import AppError from "../../core/utils/AppError";
import sendMail from "../../core/utils/mailer";
import userModel from "../../database/models/user.model";
import { IUser, signupDTO } from "../../types/user.types";
import AuthRepository from "./auth.repo";
import bcrypt from "bcrypt";
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
  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
}
