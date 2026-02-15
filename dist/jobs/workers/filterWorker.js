"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFilterWorker = void 0;
const axios_1 = __importDefault(require("axios"));
const bullmq_1 = require("bullmq");
const post_types_1 = require("../../types/post.types");
const posts_service_1 = __importDefault(require("../../modules/posts/posts.service"));
const filterProcessor = async (job) => {
    const { postID, caption } = job.data;
    console.log(`[Filter Worker] Starting toxicity check for post: ${postID}`);
    let result;
    try {
        const response = await axios_1.default.post(process.env.TOXICITY_MODEL_URL, {
            text: caption,
        });
        const modelResult = response.data.result;
        console.log(`[Filter Worker] Model returned: "${modelResult}" for post: ${postID}`);
        if (modelResult.includes("safe")) {
            result = post_types_1.ToxicityFlags.safe;
        }
        else if (modelResult.includes("BLOCKED")) {
            result = post_types_1.ToxicityFlags.blocked;
        }
        else {
            result = post_types_1.ToxicityFlags.flagged;
        }
        await posts_service_1.default.getInstace().checkToxicity(result, postID);
    }
    catch (error) {
        console.error(`[Filter Worker] Error calling toxicity model for post ${postID}:`, error);
        throw error;
    }
};
const setupFilterWorker = () => {
    const worker = new bullmq_1.Worker("filter-queue", filterProcessor, {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        concurrency: 10,
    });
    console.log(`✅ Worker for filter-queue started!`);
    worker.on("completed", (job, returnValue) => {
        console.log(`[Filter Worker] Job ${job.id} for post ${job.data.postID} completed.`);
    });
    worker.on("failed", (job, err) => {
        console.error(`❌ Filter job ${job?.id} failed for post ${job?.data.postID} with error: ${err.message}`);
    });
    return worker;
};
exports.setupFilterWorker = setupFilterWorker;
