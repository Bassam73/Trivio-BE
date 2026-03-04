"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    groupId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "group",
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "member"],
    },
}, { timestamps: true });
const memberModel = new mongoose_1.Model("member", schema);
exports.default = memberModel;
