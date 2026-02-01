import userModel from "../../database/models/user.model";
import { IUser } from "../../types/user.types";

export default class UsersRepository {
  private static instance: UsersRepository;
  async getUserByID(id: string): Promise<IUser | null> {
    return await userModel.findById(id);
  }
  async incFollowing(userID: string, value: number): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(
      userID,
      {
        $inc: { following: value },
      },
      { new: true },
    );
  }
  async incFollowers(userID: string, value: number): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(
      userID,
      {
        $inc: { followers: value },
      },
      { new: true },
    );
  }

  static getInstance() {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }
}
