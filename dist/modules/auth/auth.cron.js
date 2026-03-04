"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuthCron = startAuthCron;
const node_cron_1 = __importDefault(require("node-cron"));
const auth_service_1 = __importDefault(require("./auth.service"));
function startAuthCron() {
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        console.log("Checking for verfication codes older than 15 mins...");
        const cancelled = await auth_service_1.default.getInstance().checkVerficationCodes();
        console.log(`Delete ${cancelled} unverified users`);
    });
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        console.log("Checking for verfication codes older than 5 mins...");
        const cancelled = await auth_service_1.default.getInstance().checkOTPRequests();
        console.log(`Cancelled ${cancelled} OTP's`);
    });
}
