"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAllWorkers = void 0;
const emailWorker_1 = require("./workers/emailWorker");
const filterWorker_1 = require("./workers/filterWorker");
const setupAllWorkers = () => {
    console.log("Setting up all workers...");
    (0, emailWorker_1.setupEmailWorker)();
    (0, filterWorker_1.setupFilterWorker)();
    console.log("All workers have been set up.");
};
exports.setupAllWorkers = setupAllWorkers;
