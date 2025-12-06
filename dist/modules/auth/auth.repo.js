"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../../database/models/user.model"));
class AuthRepository {
    constructor() { }
    async findVerifiedUserByEmail(email) {
        return await user_model_1.default.findOne({ email, isVerified: true });
    }
    async findUserById(id) {
        return await user_model_1.default.findById(id);
    }
    async findAnyUserByEmail(email) {
        return await user_model_1.default.findOne({ email });
    }
    async findAnyUserByUsername(username) {
        return await user_model_1.default.findOne({ username });
    }
    async findVerifiedUserByUsername(username) {
        return await user_model_1.default.findOne({ username, isVerified: true });
    }
    async updateUser(user) {
        return await user_model_1.default.findByIdAndUpdate(user._id, user, { new: true });
    }
    async createUser(data) {
        return await user_model_1.default.create(data);
    }
    async verifyUser(id) {
        await user_model_1.default.findByIdAndUpdate(id, {
            isVerified: true,
            code: null,
            codeCreatedAt: null,
        });
    }
    async deleteAllUnVerifiedUsers() {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        return await user_model_1.default.deleteMany({
            $and: [
                { codeCreatedAt: { $lt: fifteenMinutesAgo } },
                { $or: [{ isVerified: false }, { isVerified: { $exists: false } }] },
            ],
        });
    }
    async deleteAllExpiredOTP() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return await user_model_1.default.updateMany({ OTPCreatedAt: { $lt: fiveMinutesAgo } }, {
            $set: { OTP: null, OTPCreatedAt: null },
        });
    }
    async deleteVerficationCode(id) {
        await user_model_1.default.findByIdAndUpdate(id, { code: null, codeCreatedAt: null });
    }
    async setOTP(id, otp) {
        await user_model_1.default.findByIdAndUpdate(id, {
            OTP: otp,
            OTPCreatedAt: Date.now(),
        });
    }
    async updatePassword(id, password) {
        return await user_model_1.default.findOneAndUpdate({
            _id: id,
            isVerified: true,
        }, {
            $set: {
                password,
                passwordChangedAt: Date.now(),
                OTP: null,
                OTPCreatedAt: null,
            },
        }, { new: true });
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
exports.default = AuthRepository;
