import cron from "node-cron";
import AuthService from "./auth.service";
export function startAuthCron() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Checking for verfication codes older than 15 mins...");
    const cancelled = await AuthService.getInstance().checkVerficationCodes();
    console.log(`Delete ${cancelled} unverified users`);
  });

  cron.schedule("*/5 * * * *", async () => {
    console.log("Checking for verfication codes older than 5 mins...");
    const cancelled = await AuthService.getInstance().checkOTPRequests();
    console.log(`Cancelled ${cancelled} OTP's`);
  });
}
