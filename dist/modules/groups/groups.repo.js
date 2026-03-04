"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiFeatures_1 = __importDefault(require("../../core/utils/ApiFeatures"));
const group_model_1 = __importDefault(require("../../database/models/group.model"));
const groupMember_model_1 = __importDefault(require("../../database/models/groupMember.model"));
const joinRequest_model_1 = __importDefault(require("../../database/models/joinRequest.model"));
class GroupRepository {
    constructor() { }
    async createGroup(data) {
        return await group_model_1.default.create(data);
    }
    async getGroupById(id) {
        return await group_model_1.default.findById(id);
    }
    async deleteGroupById(id) {
        return await group_model_1.default.findByIdAndDelete(id);
    }
    async updateGroupById(data) {
        return await group_model_1.default.findByIdAndUpdate(data.postId, data.data, {
            new: true,
        });
    }
    async getGroups(searchQuery) {
        const apiFeatures = new ApiFeatures_1.default(group_model_1.default.find(), searchQuery)
            .fields()
            .filter()
            .search("name") // Fixed: Search by name
            .sort()
            .pagination(10);
        const reuslt = {
            data: await apiFeatures.getQuery(),
            page: apiFeatures.getPageNumber(),
        };
        return reuslt;
    }
    async joinGroup(groupId, userId, role = "member", status = "active") {
        // Check if member already exists to avoid duplicates
        const existingMember = await groupMember_model_1.default.findOne({ groupId, userId });
        if (existingMember)
            return existingMember;
        return await groupMember_model_1.default.create({
            groupId,
            userId,
            role,
            status,
        });
    }
    async deleteMembersByGroupId(groupId) {
        await groupMember_model_1.default.deleteMany({ groupId });
    }
    async deleteJoinRequestsByGroupId(groupId) {
        await joinRequest_model_1.default.deleteMany({ groupId });
    }
    async checkMemberStatus(groupId, userId) {
        const member = await groupMember_model_1.default.findOne({ groupId, userId });
        return member ? member.status : null; // returns 'active' or 'banned' or null
    }
    async checkMemberRole(groupId, userId) {
        console.log(userId);
        console.log(groupId);
        const member = await groupMember_model_1.default.findOne({ groupId, userId });
        console.log(member);
        return member ? member.role : null;
    }
    async updateMemberCount(groupId, increment) {
        await group_model_1.default.findByIdAndUpdate(groupId, {
            $inc: { members: increment },
        });
    }
    async removeMember(groupId, userId) {
        await groupMember_model_1.default.findOneAndDelete({ groupId, userId });
    }
    async createJoinRequest(groupId, userId) {
        return await joinRequest_model_1.default.create({
            groupId,
            userId,
            status: "pending",
        });
    }
    async getJoinRequest(groupId, userId) {
        return await joinRequest_model_1.default.findOne({ groupId, userId });
    }
    async getJoinRequestById(requestId) {
        return await joinRequest_model_1.default.findById(requestId);
    }
    async deleteJoinRequest(requestId) {
        return await joinRequest_model_1.default.findByIdAndDelete(requestId);
    }
    async deleteJoinRequestByGroupAndUser(groupId, userId) {
        return await joinRequest_model_1.default.findOneAndDelete({ groupId, userId });
    }
    async updateMemberRole(groupId, userId, role) {
        return await groupMember_model_1.default.findOneAndUpdate({ groupId, userId }, { role }, { new: true });
    }
    async updateMemberStatus(groupId, userId, status) {
        return await groupMember_model_1.default.findOneAndUpdate({ groupId, userId }, { status }, { new: true });
    }
    async incrementKickCount(groupId, userId) {
        return await groupMember_model_1.default.findOneAndUpdate({ groupId, userId }, { $inc: { kicksCount: 1 } }, { new: true });
    }
    async resetKickCount(groupId, userId) {
        return await groupMember_model_1.default.findOneAndUpdate({ groupId, userId }, { kicksCount: 0, lastKickReset: Date.now() }, { new: true });
    }
    async getMember(groupId, userId) {
        return await groupMember_model_1.default.findOne({ groupId, userId });
    }
    async getMembers(groupId, searchQuery, role, status) {
        const filter = { groupId };
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        const apiFeatures = new ApiFeatures_1.default(groupMember_model_1.default.find(filter).populate("userId", "name email"), searchQuery).pagination(10); // Default limit
        const result = {
            data: await apiFeatures.getQuery(),
            page: apiFeatures.getPageNumber(),
        };
        return result;
    }
    async getGroupRequests(groupId, searchQuery) {
        const apiFeatures = new ApiFeatures_1.default(joinRequest_model_1.default
            .find({ groupId, status: "pending" })
            .populate("userId", "name email"), searchQuery).pagination(10);
        const result = {
            data: await apiFeatures.getQuery(),
            page: apiFeatures.getPageNumber(),
        };
        return result;
    }
    async getJoinsForUser(userID) {
        return await groupMember_model_1.default.find({ userId: userID });
    }
    static getInstance() {
        if (!GroupRepository.instance) {
            GroupRepository.instance = new GroupRepository();
        }
        return GroupRepository.instance;
    }
}
exports.default = GroupRepository;
