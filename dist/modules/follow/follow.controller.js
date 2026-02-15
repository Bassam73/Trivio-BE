"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineFollowRequest = exports.acceptFollowRequest = exports.getFollowRequests = void 0;
const catchError_1 = __importDefault(require("../../core/middlewares/catchError"));
const follow_service_1 = __importDefault(require("./follow.service"));
const service = follow_service_1.default.getInstance();
exports.getFollowRequests = (0, catchError_1.default)(async (req, res) => {
    const requests = await service.getFollowRequests(req.user?._id, req.user?.privacy);
    res.status(200).json({ status: "success", data: { requests } });
});
exports.acceptFollowRequest = (0, catchError_1.default)(async (req, res) => {
    const { requestId } = req.params;
    const currentUserId = req.user?._id;
    const follow = await service.acceptFollowRequest(requestId, currentUserId);
    res.status(200).json({ status: "success", data: { follow } });
});
exports.declineFollowRequest = (0, catchError_1.default)(async (req, res) => {
    const { requestId } = req.params;
    const currentUserId = req.user?._id;
    await service.declineFollowRequest(requestId, currentUserId);
    res.status(204).send();
});
