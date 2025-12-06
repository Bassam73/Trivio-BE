"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const like_repo_1 = __importDefault(require("./like.repo"));
class LikeService {
    constructor() {
        this.repo = like_repo_1.default.getInstance();
    }
    static getInstance() {
        if (!LikeService.instance) {
            LikeService.instance = new LikeService();
        }
        return LikeService.instance;
    }
    async applyReactionChange(data, oldType, newType) {
        if (data.postId) {
            if (oldType)
                await this.repo.incPostReaction(data.postId, oldType, -1);
            if (newType)
                await this.repo.incPostReaction(data.postId, newType, 1);
        }
        if (data.commentId) {
            if (oldType)
                await this.repo.incCommentReaction(data.commentId, oldType, -1);
            if (newType)
                await this.repo.incCommentReaction(data.commentId, newType, 1);
        }
    }
    async toggleLike(data) {
        const existingLike = await this.repo.findLike({
            user: data.user,
            postId: data.postId,
            commentId: data.commentId,
        });
        if (!existingLike) {
            await this.applyReactionChange(data, null, data.react_type);
            await this.repo.createLike(data);
            return { message: "Reaction added" };
        }
        if (existingLike.react_type === data.react_type) {
            await this.applyReactionChange(data, existingLike.react_type, null);
            await this.repo.deleteLike(existingLike._id);
            return { message: "Reaction removed" };
        }
        await this.applyReactionChange(data, existingLike.react_type, data.react_type);
        await this.repo.updateLike(existingLike._id, {
            react_type: data.react_type,
        });
        return { message: "Reaction updated" };
    }
}
exports.default = LikeService;
