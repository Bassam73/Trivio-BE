"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = startAllCrons;
const auth_cron_1 = require("../modules/auth/auth.cron");
function startAllCrons() {
    (0, auth_cron_1.startAuthCron)();
}
