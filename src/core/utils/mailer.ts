import nodemailer from "nodemailer";
import getVerficatioFile from "../../templates/verfication";

export default async function sendMail(
  email: string,
  username: string,
  code: number
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_APP_ACCOUNT,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"Trivio Auth System" <${process.env.GMAIL_APP_ACCOUNT}>`,
    to: email,
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: getVerficatioFile(username, code), // HTML body
  });

  console.log("Message sent:", info.messageId);
}
