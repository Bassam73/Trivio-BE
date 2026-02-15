"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comments_repo_1 = __importDefault(require("./comments.repo"));
class CommentsService {
    constructor(repo) {
        this.repo = repo;
    }
    static getInstance() {
        if (!CommentsService.instance) {
            CommentsService.instance = new CommentsService(comments_repo_1.default.getInstance());
        }
        return CommentsService.instance;
    }
}
exports.default = CommentsService;
