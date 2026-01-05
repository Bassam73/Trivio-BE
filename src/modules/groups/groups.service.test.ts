import GroupService from "./groups.service";
import GroupRepository from "./groups.repo";
import fs from "fs";
import AppError from "../../core/utils/AppError";
import { createGroupDTO, updateGroupDTO } from "../../types/group.types";

// Mock dependencies
jest.mock("./groups.repo");
jest.mock("fs", () => ({
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("GroupService", () => {
  let service: GroupService;
  let repoMock: jest.Mocked<GroupRepository>;

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
    } as unknown as jest.Mocked<GroupRepository>;

    // Hijack the singleton instance of repo used by service
    (GroupRepository.getInstance as jest.Mock).mockReturnValue(repoMock);

    // Get service instance
    service = GroupService.getInstance();
    // Force repo override because singleton might have already been instantiated
    (service as any).repo = repoMock;
  });

  describe("createGroup", () => {
    const mockData: createGroupDTO = {
      name: "Test Group",
      description: "Desc",
      privacy: "public",
      creatorId: "user123",
      logo: "logo.png",
    } as any;

    const mockGroup = { _id: "group123", ...mockData };

    it("should create a group and add creator as admin", async () => {
      repoMock.createGroup.mockResolvedValue(mockGroup as any);
      repoMock.joinGroup.mockResolvedValue({} as any);

      const result = await service.createGroup(mockData);

      expect(repoMock.createGroup).toHaveBeenCalledWith(mockData);
      expect(repoMock.joinGroup).toHaveBeenCalledWith("group123", "user123", "admin", "active");
      expect(result).toEqual(mockGroup);
    });

    it("should delete logo file if creation fails", async () => {
      repoMock.createGroup.mockRejectedValue(new Error("DB Error"));

      await expect(service.createGroup(mockData)).rejects.toThrow("DB Error");
      expect(fs.promises.unlink).toHaveBeenCalledWith("uploads/groups/logo.png");
    });
  });

  describe("deleteGroup", () => {
    const groupId = "group123";
    const userId = "user123";
    const mockGroup = { _id: groupId, creatorId: userId, logo: "logo.png" };

    it("should delete group and associated data if authorized", async () => {
      repoMock.getGroupById.mockResolvedValue(mockGroup as any);
      repoMock.deleteGroupById.mockResolvedValue(mockGroup as any);

      await service.deleteGroup(groupId, userId);

      expect(repoMock.getGroupById).toHaveBeenCalledWith(groupId);
      expect(repoMock.deleteGroupById).toHaveBeenCalledWith(groupId);
      expect(repoMock.deleteMembersByGroupId).toHaveBeenCalledWith(groupId);
      expect(repoMock.deleteJoinRequestsByGroupId).toHaveBeenCalledWith(groupId);
      expect(fs.promises.unlink).toHaveBeenCalledWith("uploads/groups/logo.png");
    });

    it("should throw error if group not found", async () => {
      repoMock.getGroupById.mockResolvedValue(null);

      await expect(service.deleteGroup(groupId, userId)).rejects.toThrow(AppError);
      await expect(service.deleteGroup(groupId, userId)).rejects.toThrow("group not found");
    });

    it("should throw error if user is not authorized", async () => {
      repoMock.getGroupById.mockResolvedValue({ ...mockGroup, creatorId: "otherUser" } as any);

      await expect(service.deleteGroup(groupId, userId)).rejects.toThrow(AppError);
      await expect(service.deleteGroup(groupId, userId)).rejects.toThrow("authorized");
    });
  });

  describe("getGroupById", () => {
    it("should return group if found", async () => {
      const mockGroup = { _id: "123", name: "Test" };
      repoMock.getGroupById.mockResolvedValue(mockGroup as any);

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
      repoMock.getGroups.mockResolvedValue(mockResult as any);

      const result = await service.getGroups({});
      expect(result).toEqual(mockResult);
    });

    it("should throw 404 if no groups found", async () => {
       // Assuming repo returns empty list or service handles empty list
       repoMock.getGroups.mockResolvedValue({ data: [], page: 1 } as any);
       await expect(service.getGroups({})).rejects.toThrow("no groups found");
    });
  });

  describe("updateGroupById", () => {
    const updateData: updateGroupDTO = {
        postId: "group123",
        userID: "user123",
        data: { name: "New Name", logo: "newlogo.png" }
    };
    const mockGroup = { _id: "group123", creatorId: "user123", logo: "oldlogo.png" };

    it("should update group if authorized", async () => {
        repoMock.getGroupById.mockResolvedValue(mockGroup as any);
        repoMock.updateGroupById.mockResolvedValue({ ...mockGroup, ...updateData.data } as any);

        const result = await service.updateGroupById(updateData);

        expect(repoMock.getGroupById).toHaveBeenCalledWith(updateData.postId);
        expect(fs.promises.unlink).toHaveBeenCalledWith("uploads/groups/oldlogo.png");
        expect(repoMock.updateGroupById).toHaveBeenCalledWith(updateData);
        expect(result).toHaveProperty("name", "New Name");
    });

     it("should clean up new logo if update fails", async () => {
        repoMock.getGroupById.mockResolvedValue(mockGroup as any);
        repoMock.updateGroupById.mockRejectedValue(new Error("Update failed"));

        await expect(service.updateGroupById(updateData)).rejects.toThrow("Update failed");
        expect(fs.promises.unlink).toHaveBeenCalledWith("uploads/groups/newlogo.png");
    });
  });

  describe("joinGroup", () => {
    const groupId = "group123";
    const userId = "user123";

    it("should join public group successfully", async () => {
      repoMock.getGroupById.mockResolvedValue({ _id: groupId, privacy: "public" } as any);
      repoMock.checkMemberStatus.mockResolvedValue(null);
      repoMock.getJoinRequest.mockResolvedValue(null);

      const result = await service.joinGroup(groupId, userId);

      expect(repoMock.joinGroup).toHaveBeenCalledWith(groupId, userId, "member", "active");
      expect(repoMock.updateMemberCount).toHaveBeenCalledWith(groupId, 1);
      expect(result).toBe("Joined successfully");
    });

    it("should create request for private group", async () => {
      repoMock.getGroupById.mockResolvedValue({ _id: groupId, privacy: "private" } as any);
      repoMock.checkMemberStatus.mockResolvedValue(null);
      repoMock.getJoinRequest.mockResolvedValue(null);

      const result = await service.joinGroup(groupId, userId);

      expect(repoMock.createJoinRequest).toHaveBeenCalledWith(groupId, userId);
      expect(result).toBe("Join request sent");
    });

    it("should throw error if already a member", async () => {
      repoMock.getGroupById.mockResolvedValue({ _id: groupId } as any);
      repoMock.checkMemberStatus.mockResolvedValue("active");

      await expect(service.joinGroup(groupId, userId)).rejects.toThrow("already a member");
    });
  });

  describe("leaveGroup", () => {
    const groupId = "group123";
    const userId = "user123";

    it("should leave group successfully", async () => {
      repoMock.getGroupById.mockResolvedValue({ _id: groupId, creatorId: "other" } as any);
      repoMock.checkMemberStatus.mockResolvedValue("active");

      await service.leaveGroup(groupId, userId);

      expect(repoMock.removeMember).toHaveBeenCalledWith(groupId, userId);
      expect(repoMock.updateMemberCount).toHaveBeenCalledWith(groupId, -1);
    });

    it("should throw error if creator tries to leave", async () => {
      repoMock.getGroupById.mockResolvedValue({ _id: groupId, creatorId: userId } as any);
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
      repoMock.getJoinRequestById.mockResolvedValue({ groupId: groupId, userId: "user2" } as any);

      await service.acceptJoinRequest(groupId, adminId, requestId);

      expect(repoMock.joinGroup).toHaveBeenCalledWith(groupId, "user2", "member", "active");
      expect(repoMock.deleteJoinRequest).toHaveBeenCalledWith(requestId);
    });

    it("should decline join request", async () => {
      repoMock.getJoinRequestById.mockResolvedValue({ groupId: groupId, userId: "user2" } as any);

      await service.declineJoinRequest(groupId, adminId, requestId);

      expect(repoMock.deleteJoinRequest).toHaveBeenCalledWith(requestId);
    });

    it("should throw error if not admin", async () => {
        repoMock.checkMemberRole.mockResolvedValue("member");
        await expect(service.acceptJoinRequest(groupId, adminId, requestId)).rejects.toThrow("authorized");
    });
  });
});
