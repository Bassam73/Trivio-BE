import userModel from "../../database/models/user.model";
import { IUser, signupDTO } from "../../types/user.types";

class AuthRepository {
  private static instance: AuthRepository;

  private constructor() {}

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await userModel.findOne({ email });
  }
  async findUserByUsername(username: string): Promise<IUser | null> {
    return await userModel.findOne({ username });
  }
  async createUser(data: signupDTO): Promise<IUser> {
    return await userModel.create(data);
  }
  static getInstance() {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }
}

export default AuthRepository;
