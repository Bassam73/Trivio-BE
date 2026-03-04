"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groups_service_1 = __importDefault(require("./groups.service"));
const groups_repo_1 = __importDefault(require("./groups.repo"));
const fs_1 = __importDefault(require("fs"));
const AppError_1 = __importDefault(require("../../core/utils/AppError"));
// Mock dependencies
jest.mock("./groups.repo");
jest.mock("fs", () => ({
    promises: {
        unlink: jest.fn().mockResolvedValue(undefined),
    },
}));
describe("GroupService", () => {
    let service;
    let repoMock;
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        // Setup Mock Repository
        repoMock = {
            createGroup: jest.fn(),
            getGroupById: jest.fn(),
            deleteGroupById: jest.fn(),
            updateGroupById: jest.fn(),
            getGroups: jest.fn(),
            joinGroup: jest.fn(),
            deleteMembersByGroupId: jest.fn(),
            deleteJoinRequestsByGroupId: jest.fn(),
            checkMemberStatus: jest.fn(),
            checkMemberRole: jest.fn(),
            updateMemberCount: jest.fn(),
            removeMember: jest.fn(),
            createJoinRequest: jest.fn(),
            getJoinRequest: jest.fn(),
            getJoinRequestById: jest.fn(),
            deleteJoinRequest: jest.fn(),
            deleteJoinRequestByGroupAndUser: jest.fn(),
            getGroupRequests: jest.fn(),
            getMember: jest.fn(),
            updateMemberRole: jest.fn(),
            updateMemberStatus: jest.fn(),
            incrementKickCount: jest.fn(),
            resetKickCount: jest.fn(),
            getMembers: jest.fn(),
        };
        // Hijack the singleton instance of repo used by service
        groups_repo_1.default.getInstance.mockReturnValue(repoMock);
        // Get service instance
        service = groups_service_1.default.getInstance();
        // Force repo override because singleton might have already been instantiated
        service.repo = repoMock;
    });
    describe("createGroup", () => {
        const mockData = {
            name: "Test Group",
            description: "Desc",
            privacy: "public",
            creatorId: "user123",
            logo: "http://localhost:3500/uploads/groups/logo.png",
        };
        const mockGroup = { _id: "group123", ...mockData };
        it("should create a group and add creator as admin", async () => {
            repoMock.createGroup.mockResolvedValue(mockGroup);
            repoMock.joinGroup.mockResolvedValue({});
            const result = await service.createGroup(mockData);
            expect(repoMock.createGroup).toHaveBeenCalledWith(mockData);
            expect(repoMock.joinGroup).toHaveBeenCalledWith("group123", "user123", "admin", "active");
            expect(result).toEqual(mockGroup);
        });
        it("should delete logo file if creation fails", async () => {
            repoMock.createGroup.mockRejectedValue(new Error("DB Error"));
            await expect(service.createGroup(mockData)).rejects.toThrow("DB Error");
            expect(fs_1.default.promises.unlink).toHaveBeenCalledWith("uploads/groups/logo.png");
        });
    });
    describe("deleteGroup", () => {
        const groupId = "group123";
        const userId = "user123";
        const mockGroup = { _id: groupId, creatorId: userId, logo: "http://localhost:3500/uploads/groups/logo.png" };
        it("should delete group and associated data if authorized", async () => {
            repoMock.getGroupById.mockResolvedValue(mockGroup);
            repoMock.deleteGroupById.mockResolvedValue(mockGroup);
            await service.deleteGroup(groupId, userId);
            expect(repoMock.getGroupById).toHaveBeenCalledWith(groupId);
            expect(repoMock.deleteGroupById).toHaveBeenCalledWith(groupId);
            expect(repoMock.deleteMembersByGroupId).toHaveBeenCalledWith(groupId);
            expect(repoMock.deleteJoinRequestsByGroupId).toHaveBeenCalledWith(groupId);
            expect(fs_1.default.promises.unlink).toHaveBeenCalledWith("uploads/groups/logo.png");
        });
        it("should throw error if group not found", async () => {
            repoMock.getGroupById.mockResolvedValue(null);
            await expect(service.deleteGroup(groupId, userId)).rejects.toThrow(AppError_1.default);
            await expect(service.deleteGroup(groupId, userId)).rejects.toThrow("group not found");
        });
        it("should throw error if user is not authorized", async () => {
            repoMock.getGroupById.mockResolvedValue({ ...mockGroup, creatorId: "otherUser" });
            await expect(service.deleteGroup(groupId, userId)).rejects.toThrow(AppError_1.default);
            await expect(service.deleteGroup(groupId, userId)).rejects.toThrow("authorized");
        });
    });
    describe("getGroupById", () => {
        it("should return group if found", async () => {
            const mockGroup = { _id: "123", name: "Test" };
            repoMock.getGroupById.mockResolvedValue(mockGroup);
            const result = await service.getGroupById("123");
            expect(result).toEqual(mockGroup);
        });
        it("should throw 404 if not found", async () => {
            repoMock.getGroupById.mockResolvedValue(null);
            await expect(service.getGroupById("123")).rejects.toThrow("group not found");
        });
    });
    describe("getGroups", () => {
        it("should return groups if found", async () => {
            const mockResult = { data: [{ name: "g1" }], page: 1 };
            repoMock.getGroups.mockResolvedValue(mockResult);
            const result = await service.getGroups({});
            expect(result).toEqual(mockResult);
        });
        it("should throw 404 if no groups found", async () => {
            // Assuming repo returns empty list or service handles empty list
            repoMock.getGroups.mockResolvedValue({ data: [], page: 1 });
            await expect(service.getGroups({})).rejects.toThrow("no groups found");
        });
    });
    describe("updateGroupById", () => {
        const updateData = {
            postId: "group123",
            userID: "user123",
            data: { name: "New Name", logo: "http://localhost:3500/uploads/groups/newlogo.png" }
        };
        const mockGroup = { _id: "group123", creatorId: "user123", logo: "http://localhost:3500/uploads/groups/oldlogo.png" };
        it("should update group if authorized", async () => {
            repoMock.getGroupById.mockResolvedValue(mockGroup);
            repoMock.updateGroupById.mockResolvedValue({ ...mockGroup, ...updateData.data });
            const result = await service.updateGroupById(updateData);
            expect(repoMock.getGroupById).toHaveBeenCalledWith(updateData.postId);
            expect(fs_1.default.promises.unlink).toHaveBeenCalledWith("uploads/groups/oldlogo.png");
            expect(repoMock.updateGroupById).toHaveBeenCalledWith(updateData);
            expect(result).toHaveProperty("name", "New Name");
        });
        it("should clean up new logo if update fails", async () => {
            repoMock.getGroupById.mockResolvedValue(mockGroup);
            repoMock.updateGroupById.mockRejectedValue(new Error("Update failed"));
            await expect(service.updateGroupById(updateData)).rejects.toThrow("Update failed");
            expect(fs_1.default.promises.unlink).toHaveBeenCalledWith("uploads/groups/newlogo.png");
        });
    });
    describe("joinGroup", () => {
        const groupId = "group123";
        const userId = "user123";
        it("should join public group successfully", async () => {
            repoMock.getGroupById.mockResolvedValue({ _id: groupId, privacy: "public" });
            repoMock.checkMemberStatus.mockResolvedValue(null);
            repoMock.getJoinRequest.mockResolvedValue(null);
            const result = await service.joinGroup(groupId, userId);
            expect(repoMock.joinGroup).toHaveBeenCalledWith(groupId, userId, "member", "active");
            expect(repoMock.updateMemberCount).toHaveBeenCalledWith(groupId, 1);
            expect(result).toBe("Joined successfully");
        });
        it("should create request for private group", async () => {
            repoMock.getGroupById.mockResolvedValue({ _id: groupId, privacy: "private" });
            repoMock.checkMemberStatus.mockResolvedValue(null);
            repoMock.getJoinRequest.mockResolvedValue(null);
            const result = await service.joinGroup(groupId, userId);
            expect(repoMock.createJoinRequest).toHaveBeenCalledWith(groupId, userId);
            expect(result).toBe("Join request sent");
        });
        it("should throw error if already a member", async () => {
            repoMock.getGroupById.mockResolvedValue({ _id: groupId });
            repoMock.checkMemberStatus.mockResolvedValue("active");
            await expect(service.joinGroup(groupId, userId)).rejects.toThrow("already a member");
        });
    });
    describe("leaveGroup", () => {
        const groupId = "group123";
        const userId = "user123";
        it("should leave group successfully", async () => {
            repoMock.getGroupById.mockResolvedValue({ _id: groupId, creatorId: "other" });
            repoMock.checkMemberStatus.mockResolvedValue("active");
            await service.leaveGroup(groupId, userId);
            expect(repoMock.removeMember).toHaveBeenCalledWith(groupId, userId);
            expect(repoMock.updateMemberCount).toHaveBeenCalledWith(groupId, -1);
        });
        it("should throw error if creator tries to leave", async () => {
            repoMock.getGroupById.mockResolvedValue({ _id: groupId, creatorId: userId });
            repoMock.checkMemberStatus.mockResolvedValue("active");
            await expect(service.leaveGroup(groupId, userId)).rejects.toThrow("Creator cannot leave");
        });
    });
    describe("Request Management", () => {
        const groupId = "group123";
        const adminId = "admin123";
        const requestId = "req123";
        beforeEach(() => {
            repoMock.checkMemberRole.mockResolvedValue("admin");
        });
        it("should accept join request", async () => {
            repoMock.getJoinRequestById.mockResolvedValue({ groupId: groupId, userId: "user2" });
            await service.acceptJoinRequest(groupId, adminId, requestId);
            expect(repoMock.joinGroup).toHaveBeenCalledWith(groupId, "user2", "member", "active");
            expect(repoMock.deleteJoinRequest).toHaveBeenCalledWith(requestId);
        });
        it("should decline join request", async () => {
            repoMock.getJoinRequestById.mockResolvedValue({ groupId: groupId, userId: "user2" });
            await service.declineJoinRequest(groupId, adminId, requestId);
            expect(repoMock.deleteJoinRequest).toHaveBeenCalledWith(requestId);
        });
        it("should throw error if not admin", async () => {
            repoMock.checkMemberRole.mockResolvedValue("member");
            await expect(service.acceptJoinRequest(groupId, adminId, requestId)).rejects.toThrow("authorized");
        });
    });
    describe("Group Administration", () => {
        const groupId = "group123";
        const creatorId = "creator123";
        const adminId = "admin123";
        const modId = "mod123";
        const memberId = "member123";
        const targetId = "target123";
        beforeEach(() => {
            repoMock.getGroupById.mockResolvedValue({
                _id: groupId,
                creatorId,
                updateOne: jest.fn()
            });
        });
        describe("promoteMember", () => {
            it("should allow creator to promote member to admin", async () => {
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                await service.promoteMember({ groupId, targetUserId: targetId, newRole: "admin" }, creatorId);
                expect(repoMock.updateMemberRole).toHaveBeenCalledWith(groupId, targetId, "admin");
            });
            it("should allow admin to promote member to moderator", async () => {
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                repoMock.checkMemberRole.mockResolvedValue("admin");
                await service.promoteMember({ groupId, targetUserId: targetId, newRole: "moderator" }, adminId);
                expect(repoMock.updateMemberRole).toHaveBeenCalledWith(groupId, targetId, "moderator");
                const groupMock = await repoMock.getGroupById(groupId);
                expect(groupMock.updateOne).toHaveBeenCalledWith({ $inc: { moderators: 1 } });
            });
            it("should prevent admin from promoting to admin", async () => {
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                repoMock.checkMemberRole.mockResolvedValue("admin");
                await expect(service.promoteMember({ groupId, targetUserId: targetId, newRole: "admin" }, adminId))
                    .rejects.toThrow("Admins can only promote to Moderator");
            });
            it("should prevent promotion to same role", async () => {
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                await expect(service.promoteMember({ groupId, targetUserId: targetId, newRole: "member" }, creatorId))
                    .rejects.toThrow("Promotion must be to a higher role");
            });
            it("should prevent promotion to lower role", async () => {
                repoMock.getMember.mockResolvedValue({ role: "moderator", status: "active" });
                await expect(service.promoteMember({ groupId, targetUserId: targetId, newRole: "member" }, creatorId))
                    .rejects.toThrow("Promotion must be to a higher role");
            });
        });
        describe("demoteMember", () => {
            it("should allow creator to demote anyone (except self)", async () => {
                repoMock.getMember.mockResolvedValue({ role: "admin", status: "active" });
                // Demote admin to moderator
                await service.demoteMember({ groupId, targetUserId: adminId, newRole: "moderator" }, creatorId);
                expect(repoMock.updateMemberRole).toHaveBeenCalledWith(groupId, adminId, "moderator");
                const groupMock = await repoMock.getGroupById(groupId);
                expect(groupMock.updateOne).toHaveBeenCalledWith({ $inc: { moderators: 1 } });
            });
            it("should prevent demotion to same role", async () => {
                repoMock.getMember.mockResolvedValue({ role: "moderator", status: "active" });
                await expect(service.demoteMember({ groupId, targetUserId: modId, newRole: "moderator" }, creatorId))
                    .rejects.toThrow("Demotion must be to a lower role");
            });
            it("should prevent demotion to higher role", async () => {
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                await expect(service.demoteMember({ groupId, targetUserId: modId, newRole: "moderator" }, creatorId))
                    .rejects.toThrow("Demotion must be to a lower role");
            });
            it("should allow admin to demote moderator", async () => {
                repoMock.getMember.mockResolvedValue({ role: "moderator", status: "active" });
                repoMock.checkMemberRole.mockResolvedValue("admin");
                await service.demoteMember({ groupId, targetUserId: modId, newRole: "member" }, adminId);
                expect(repoMock.updateMemberRole).toHaveBeenCalledWith(groupId, modId, "member");
                const groupMock = await repoMock.getGroupById(groupId);
                expect(groupMock.updateOne).toHaveBeenCalledWith({ $inc: { moderators: -1 } });
            });
            it("should prevent admin from demoting admin", async () => {
                repoMock.getMember.mockResolvedValue({ role: "admin", status: "active" });
                repoMock.checkMemberRole.mockResolvedValue("admin");
                await expect(service.demoteMember({ groupId, targetUserId: adminId, newRole: "member" }, "otherAdminId"))
                    .rejects.toThrow("Admins cannot demote other Admins");
            });
        });
        describe("unbanMember", () => {
            it("should allow admin to unban banned user", async () => {
                repoMock.checkMemberRole.mockResolvedValue("admin");
                repoMock.getMember.mockResolvedValue({ role: "member", status: "banned" });
                await service.unbanMember({ groupId, targetUserId: targetId }, adminId);
                expect(repoMock.updateMemberStatus).toHaveBeenCalledWith(groupId, targetId, "active");
                expect(repoMock.updateMemberCount).toHaveBeenCalledWith(groupId, 1);
                expect(repoMock.updateMemberRole).toHaveBeenCalledWith(groupId, targetId, "member");
            });
            it("should fail if user is not banned", async () => {
                repoMock.checkMemberRole.mockResolvedValue("admin");
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                await expect(service.unbanMember({ groupId, targetUserId: targetId }, adminId))
                    .rejects.toThrow("User is not banned");
            });
            it("should fail if requester is not admin/creator", async () => {
                repoMock.checkMemberRole.mockResolvedValue("member");
                repoMock.getMember.mockResolvedValue({ role: "member", status: "banned" });
                // creatorId check is in service, mock group to have different creator
                const groupMock = await repoMock.getGroupById(groupId);
                groupMock.creatorId = "otherCreator";
                await expect(service.unbanMember({ groupId, targetUserId: targetId }, memberId))
                    .rejects.toThrow("Only Admins and Creator can unban");
            });
        });
        describe("kickMember", () => {
            it("should allow moderator to kick member within rate limit", async () => {
                repoMock.getMember.mockImplementation((gid, uid) => {
                    if (uid === modId)
                        return Promise.resolve({ role: "moderator", kicksCount: 0, lastKickReset: new Date() });
                    if (uid === targetId)
                        return Promise.resolve({ role: "member" });
                    return Promise.resolve(null);
                });
                await service.kickMember({ groupId, targetUserId: targetId }, modId);
                expect(repoMock.removeMember).toHaveBeenCalledWith(groupId, targetId);
                expect(repoMock.incrementKickCount).toHaveBeenCalledWith(groupId, modId);
            });
            it("should prevent moderator from kicking admin", async () => {
                repoMock.getMember.mockImplementation((gid, uid) => {
                    if (uid === modId)
                        return Promise.resolve({ role: "moderator", kicksCount: 0 });
                    if (uid === targetId)
                        return Promise.resolve({ role: "admin" });
                    return Promise.resolve(null);
                });
                await expect(service.kickMember({ groupId, targetUserId: targetId }, modId))
                    .rejects.toThrow("Moderators can only kick members");
            });
            it("should enforce kick rate limit for moderator", async () => {
                repoMock.getMember.mockImplementation((gid, uid) => {
                    if (uid === modId)
                        return Promise.resolve({ role: "moderator", kicksCount: 5, lastKickReset: new Date() }); // Reset just now
                    if (uid === targetId)
                        return Promise.resolve({ role: "member" });
                    return Promise.resolve(null);
                });
                await expect(service.kickMember({ groupId, targetUserId: targetId }, modId))
                    .rejects.toThrow("Kick limit reached");
            });
            it("should reset kick count after one hour", async () => {
                const twoHoursAgo = new Date(Date.now() - 7200000);
                repoMock.getMember.mockImplementation((gid, uid) => {
                    if (uid === modId)
                        return Promise.resolve({ role: "moderator", kicksCount: 5, lastKickReset: twoHoursAgo });
                    if (uid === targetId)
                        return Promise.resolve({ role: "member" });
                    return Promise.resolve(null);
                });
                await service.kickMember({ groupId, targetUserId: targetId }, modId);
                expect(repoMock.resetKickCount).toHaveBeenCalledWith(groupId, modId);
                expect(repoMock.removeMember).toHaveBeenCalled();
            });
        });
        describe("banMember", () => {
            it("should allow admin to ban member", async () => {
                repoMock.checkMemberRole.mockResolvedValue("admin");
                repoMock.getMember.mockResolvedValue({ role: "member", status: "active" });
                await service.banMember({ groupId, targetUserId: targetId }, adminId);
                expect(repoMock.updateMemberStatus).toHaveBeenCalledWith(groupId, targetId, "banned");
                expect(repoMock.updateMemberCount).toHaveBeenCalledWith(groupId, -1);
            });
            it("should prevent admin from banning other admin", async () => {
                repoMock.checkMemberRole.mockResolvedValue("admin");
                repoMock.getMember.mockResolvedValue({ role: "admin", status: "active" });
                await expect(service.banMember({ groupId, targetUserId: targetId }, adminId))
                    .rejects.toThrow("Admins cannot ban other Admins");
            });
        });
    });
});
