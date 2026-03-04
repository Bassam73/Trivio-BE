"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const verfication_1 = __importDefault(require("../../templates/verfication"));
const otp_1 = __importDefault(require("../../templates/otp"));
async function sendMail(email, username, code, type) {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_APP_ACCOUNT,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
    let info;
    const from = `"Trivio Authentication" <${process.env.GMAIL_APP_ACCOUNT}>`;
    const subject = type === "code"
        ? "Email Verification - Trivio"
        : "One-Time Password (OTP) - Trivio";
    const html = type === "code"
        ? (0, verfication_1.default)(username, code)
        : (0, otp_1.default)(username, code);
    info = await transporter.sendMail({
        from,
        to: email,
        subject,
        text: `Hi ${username}, your ${type === "code" ? "verification code" : "OTP"} is ${code}.`,
        html,
    });
    console.log("Email sent successfully:", info.messageId);
}
