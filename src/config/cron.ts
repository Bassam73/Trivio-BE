import { startAuthCron } from "../modules/auth/auth.cron";

export default function startAllCrons() {
  startAuthCron();
}
