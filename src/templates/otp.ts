export default function getOTPFile(username: string, otp: number) {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Trivio OTP Code</title>
  <style>
    body { margin:0; padding:0; font-family: Arial, sans-serif; background:#f5f7fa; color:#222; }
    .container { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; }
    .header { background:#062a46; padding:20px; color:#fff; text-align:center; }
    .header h1 { margin:0; font-size:22px; }
    .content { padding:24px; }
    .content p { font-size:15px; line-height:1.5; }
    .code-box { text-align:center; margin:24px 0; padding:18px; background:#eef6ff; border:1px dashed #bfe0ff; border-radius:6px; }
    .code { font-family: monospace; font-size:26px; letter-spacing:6px; font-weight:bold; color:#062a46; }
    .footer { padding:16px; text-align:center; font-size:12px; color:#666; background:#fafbfc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Trivio — OTP Security</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">One-Time Password for your login</p>
    </div>
    <div class="content">
      <p>Hello ${username},</p>
      <p>Your <strong>One-Time Password (OTP)</strong> for Trivio login is:</p>
      <div class="code-box">
        <div class="code">${otp}</div>
      </div>
      <p>This OTP is valid for <strong>5 minutes</strong>. Please use it immediately to complete your login. 
      If you didn’t request this OTP, please ignore this email.</p>
    </div>
    <div class="footer">
      © 2025 Trivio. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
}
