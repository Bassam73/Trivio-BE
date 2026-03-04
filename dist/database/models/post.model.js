"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const schema = new mongoose_1.Schema({
    caption: {
        type: String,
        trim: true,
    },
    authorID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    type: {
        type: String,
        required: true,
        enum: ["public", "private"],
    },
    mentions: [
        {
            id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "user",
            },
            username: {
                type: String,
            },
        },
    ],
    media: {
        type: [String],
    },
    sharedFrom: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "post",
    },
    location: {
        type: String,
        enum: ["profile", "group"],
        default: "profile",
    },
    groupID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "group",
    },
    views: {
        type: Number,
        default: 0,
    },
    flagged: {
        type: Boolean,
        default: false,
    },
    tags: {
        type: [String],
        index: true,
        default: [],
    },
    reactionCounts: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        haha: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
    },
}, { timestamps: true });
const postModel = mongoose_1.default.model("post", schema);
exports.default = postModel;
