import { DeleteResult, UpdateResult } from "mongoose";
import userModel from "../../database/models/user.model";
import { forgetPasswordDTO, IUser, signupDTO } from "../../types/user.types";

class AuthRepository {
  private static instance: AuthRepository;

  private constructor() {}

  async findVerifiedUserByEmail(email: string): Promise<IUser | null> {
    return await userModel.findOne({ email, isVerified: true });
  }
  async findUserById(id: string): Promise<IUser | null> {
    return await userModel.findById(id);
  }

  async findAnyUserByEmail(email: string): Promise<IUser | null> {
    return await userModel.findOne({ email });
  }
  async findAnyUserByUsername(username: string): Promise<IUser | null> {
    return await userModel.findOne({ username });
  }
  async findVerifiedUserByUsername(username: string): Promise<IUser | null> {
    return await userModel.findOne({ username, isVerified: true });
  }
  async updateUser(user: IUser): Promise<IUser | null> {
    return await userModel.findByIdAndUpdate(user._id, user, { new: true });
  }
  async createUser(data: signupDTO): Promise<IUser> {
    return await userModel.create(data);
  }
  async verifyUser(id: string) {
    await userModel.findByIdAndUpdate(id, {
      isVerified: true,
      code: null,
      codeCreatedAt: null,
    });
  }
  async deleteAllUnVerifiedUsers(): Promise<DeleteResult> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return await userModel.deleteMany({
      $and: [
        { codeCreatedAt: { $lt: fifteenMinutesAgo } },
        { $or: [{ isVerified: false }, { isVerified: { $exists: false } }] },
      ],
    });
  }

  async deleteAllExpiredOTP() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return await userModel.updateMany(
      { OTPCreatedAt: { $lt: fiveMinutesAgo } },
      {
        $set: { OTP: null, OTPCreatedAt: null },
      }
    );
  }
  async deleteVerficationCode(id: string) {
    await userModel.findByIdAndUpdate(id, { code: null, codeCreatedAt: null });
  }
  async setOTP(id: string, otp: number) {
    await userModel.findByIdAndUpdate(id, {
      OTP: otp,
      OTPCreatedAt: Date.now(),
    });
  }

  async updatePassword(id: string, password: string): Promise<IUser | null> {
    return await userModel.findOneAndUpdate(
      {
        _id: id,
        isVerified: true,
      },
      {
        $set: {
          password,
          passwordChangedAt: Date.now(),
          OTP: null,
          OTPCreatedAt: null,
        },
      },
      { new: true }
    );
  }

  async getMentionedUsers(usernames: string[]): Promise<IUser[]> {
    return await userModel
      .find({
        username: {
          $in: usernames,
        },
      })
      .select("_id username");
  }

  // async resetVerificationCode(
  //   data: resetVerficationCodeDTO
  // ): Promise<IUser | null> {
  //   return await userModel.findOneAndUpdate(
  //     { email: data.email },
  //     { code: data.code, codeCreatedAt: Date.now() },
  //     {
  //       new: true,
  //     }
  //   );
  // }
  static getInstance() {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }
}

export default AuthRepository;
