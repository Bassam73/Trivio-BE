"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    followingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
});
const followModel = new mongoose_1.Model("follow", schema);
exports.default = followModel;
