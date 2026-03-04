"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommentsRepository {
    static getInstance() {
        if (!CommentsRepository.instance) {
            CommentsRepository.instance = new CommentsRepository();
        }
        return CommentsRepository.instance;
    }
}
exports.default = CommentsRepository;
