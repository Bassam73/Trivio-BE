import nodemailer from "nodemailer";
import getVerificationFile from "../../templates/verfication";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import getOTPFile from "../../templates/otp";

export default async function sendMail(
  email: string,
  username: string,
  code: number,
  type: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_APP_ACCOUNT,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  let info: SMTPTransport.SentMessageInfo;

  const from = `"Trivio Authentication" <${process.env.GMAIL_APP_ACCOUNT}>`;
  const subject =
    type === "code"
      ? "Email Verification - Trivio"
      : "One-Time Password (OTP) - Trivio";

  const html =
    type === "code"
      ? getVerificationFile(username, code)
      : getOTPFile(username, code);

  info = await transporter.sendMail({
    from,
    to: email,
    subject,
    text: `Hi ${username}, your ${type === "code" ? "verification code" : "OTP"} is ${code}.`,
    html,
  });

  console.log("Email sent successfully:", info.messageId);
}