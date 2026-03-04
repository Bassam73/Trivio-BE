"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEmailWorker = void 0;
const bullmq_1 = require("bullmq");
const mailer_1 = __importDefault(require("../../core/utils/mailer"));
const emailProcessor = async (job) => {
    const { email, username, code, type } = job.data;
    console.log(`Sending ${type} email to: ${email}`);
    await (0, mailer_1.default)(email, username, code, type);
};
const setupEmailWorker = () => {
    const worker = new bullmq_1.Worker("email-queue", emailProcessor, {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        concurrency: 5,
    });
    console.log(`Worker for email-queue started!`);
    worker.on("completed", (job, returnValue) => {
        console.log(`Email job ${job.id} completed for ${job.data.email}.`);
    });
    worker.on("failed", (job, err) => {
        console.error(`Email job ${job?.id} failed for ${job?.data.email} with error: ${err.message}`);
    });
    return worker;
};
exports.setupEmailWorker = setupEmailWorker;
