import { UpdateResult } from "mongoose";
import userModel from "../../database/models/user.model";
import { forgetPasswordDTO, IUser, signupDTO } from "../../types/user.types";

class AuthRepository {
  private static instance: AuthRepository;

  private constructor() {}

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await userModel.findOne({ email , isVerfied : true});
  }
  async findUserByUsername(username: string): Promise<IUser | null> {
    return await userModel.findOne({ username, isVerfied : true});
  }
  async createUser(data: signupDTO): Promise<IUser> {
    return await userModel.create(data);
  }
  async verifyUser(id: string) {
    await userModel.findByIdAndUpdate(id, {
      isVerfied: true,
      code: null,
      codeCreatedAt: null,
    });
  }
  async updateAllUnVerifiedUsers(): Promise<UpdateResult> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return await userModel.updateMany(
      {
        $and: [
          { codeCreatedAt: { $lt: fifteenMinutesAgo } },
          { $or: [{ isVerfied: false }, { isVerfied: { $exists: false } }] },
        ],
      },
      { $set: { code: null, codeCreatedAt: null, isVerfied: false } }
    );
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
      isVerfied: true,
    },
    {
      $set: {
        password,
        OTP: null,
        OTPCreatedAt: null,
      },
    },
    { new: true }
  );
}

  static getInstance() {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }
}

export default AuthRepository;
