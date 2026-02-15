"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getMentionedUsers;
const auth_repo_1 = __importDefault(require("../../modules/auth/auth.repo"));
async function getMentionedUsers(caption, userRepo = auth_repo_1.default.getInstance()) {
    const matchedUsernames = caption.match(/@[a-zA-Z0-9_]+(?=\s|$)/g);
    if (!matchedUsernames)
        return null;
    const usernames = matchedUsernames.map((u) => u.substring(1));
    const mentions = await userRepo.getMentionedUsers(usernames);
    return mentions;
}
