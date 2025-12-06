"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../core/utils/AppError"));
const mailer_1 = __importDefault(require("../../core/utils/mailer"));
const auth_repo_1 = __importDefault(require("./auth.repo"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class AuthService {
    constructor() {
        this.repo = auth_repo_1.default.getInstance();
    }
    async signup(data) {
        if (!data.password)
            throw new AppError_1.default("Password is required", 400);
        const existingEmail = await this.repo.findAnyUserByEmail(data.email);
        if (existingEmail) {
            if (existingEmail.isVerified) {
                throw new AppError_1.default("This email is already used", 409);
            }
            const newCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            const hashedPassword = await bcrypt_1.default.hash(data.password, parseInt(process.env.SALT_ROUNDS));
            existingEmail.password = hashedPassword;
            existingEmail.username = data.username;
            existingEmail.code = newCode;
            existingEmail.codeCreatedAt = new Date();
            const updatedUser = await this.repo.updateUser(existingEmail);
            if (!updatedUser)
                throw new AppError_1.default("Error while updating user", 500);
            await (0, mailer_1.default)(updatedUser.email, updatedUser.username, newCode, "code");
            return updatedUser;
        }
        const existingUsername = await this.repo.findAnyUserByUsername(data.username);
        console.log("outside");
        if (existingUsername) {
            console.log("inside");
            throw new AppError_1.default("This username is taken", 409);
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
        const hashedPassword = await bcrypt_1.default.hash(data.password, parseInt(process.env.SALT_ROUNDS));
        data.password = hashedPassword;
        data.code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        data.codeCreatedAt = new Date();
        const user = await this.repo.createUser(data);
        if (!user)
            throw new AppError_1.default("Error while creating the user", 500);
        await (0, mailer_1.default)(user.email, user.username, data.code, "code");
        return user;
    }
    async changeEmailInVerify(data) {
        const { username, email: newEmail } = data;
        if (!username || !newEmail)
            throw new AppError_1.default("Username and email are required", 400);
        // console.log(username, newEmail);
        const existingVerified = await this.repo.findVerifiedUserByEmail(newEmail);
        if (existingVerified)
            throw new AppError_1.default("This email is already taken", 409);
        const existingUnverified = await this.repo.findAnyUserByEmail(newEmail);
        if (existingUnverified && existingUnverified.username !== username)
            throw new AppError_1.default("This email is already pending verification by another user", 409);
        const user = await this.repo.findAnyUserByUsername(username);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        if (user.isVerified)
            throw new AppError_1.default("Cannot change email after verification", 400);
        const code = Math.floor(100000 + Math.random() * 900000);
        user.code = code;
        user.codeCreatedAt = new Date();
        user.email = newEmail;
        const updatedUser = await this.repo.updateUser(user);
        if (!updatedUser)
            throw new AppError_1.default("Error while updating user", 500);
        await (0, mailer_1.default)(updatedUser.email, updatedUser.username, code, "code");
        return updatedUser;
    }
    async login(data) {
        if (!data.username && !data.email) {
            throw new AppError_1.default("Username or email is required", 400);
        }
        if (data.username && data.email) {
            throw new AppError_1.default("Provide either username or email, not both", 400);
        }
        let user;
        if (data.username) {
            user = await this.repo.findVerifiedUserByUsername(data.username);
        }
        else if (data.email) {
            user = await this.repo.findVerifiedUserByEmail(data.email);
        }
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        if (!user.password) {
            throw new AppError_1.default("User password not set", 500);
        }
        if (!user.isVerified) {
            throw new AppError_1.default("Account is not verified", 403);
        }
        const validPassword = await bcrypt_1.default.compare(data.password, user.password);
        if (!validPassword) {
            throw new AppError_1.default("Invalid password", 401);
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return token;
    }
    async requestOTP(data) {
        const user = await this.repo.findVerifiedUserByEmail(data.email);
        if (!user) {
            throw new AppError_1.default("Account not found", 404);
        }
        const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        await this.repo.setOTP(user.id, otp);
        await (0, mailer_1.default)(user.email, user.username, otp, "otp");
        return;
    }
    async verfiyAccount(data) {
        const user = await this.repo.findAnyUserByEmail(data.email);
        if (!user)
            throw new AppError_1.default("Account Not Found", 404);
        if (user.isVerified)
            throw new AppError_1.default("User Is Already Verified", 409);
        if (!user.code)
            throw new AppError_1.default("Verfication Code is expired", 409);
        const isCorrect = user.code == data.code;
        if (!isCorrect)
            throw new AppError_1.default("Verfication code is wrong", 400);
        this.repo.verifyUser(user.id);
    }
    async checkOTPRequests() {
        let counter;
        counter = (await this.repo.deleteAllExpiredOTP()).modifiedCount;
        return counter;
    }
    async checkVerficationCodes() {
        let counter;
        counter = (await this.repo.deleteAllUnVerifiedUsers()).deletedCount;
        return counter;
    }
    async forgetPassword(data) {
        const user = await this.repo.findVerifiedUserByEmail(data.email);
        if (!user)
            throw new AppError_1.default("Account Not Found", 404);
        if (!user.OTP)
            throw new AppError_1.default("OTP is expired", 409);
        const isOTPCorrect = user.OTP == data.otp;
        if (!isOTPCorrect)
            throw new AppError_1.default("Invalid OTP", 400);
        const password = await bcrypt_1.default.hash(data.password, parseInt(process.env.SALT_ROUNDS));
        const updatedUser = await this.repo.updatePassword(user.id, password);
        if (!updatedUser)
            throw new AppError_1.default("Error while updating user", 500);
        return updatedUser;
    }
    async changePassword(data) {
        const isPasswordCorrect = await bcrypt_1.default.compare(data.currentPassword, data.savedPassword);
        if (!isPasswordCorrect)
            throw new AppError_1.default("Incorrect Password", 400);
        data.newPassword = await bcrypt_1.default.hash(data.newPassword, 12);
        const updatedUser = await this.repo.updatePassword(data.id, data.newPassword);
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
    async googleLogin(idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new AppError_1.default("Invalid Google token", 401);
        const { email } = payload;
        if (!email)
            throw new AppError_1.default("Google account must have an email", 400);
        let user = await this.repo.findAnyUserByEmail(email);
        if (!user) {
            const newData = {
                email: email,
                username: email.split("@")[0],
                password: null,
                isVerified: true,
            };
            user = await this.repo.createUser(newData);
        }
        if (!user)
            throw new AppError_1.default("Error While creating user", 500);
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return token;
    }
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
}
exports.default = AuthService;
