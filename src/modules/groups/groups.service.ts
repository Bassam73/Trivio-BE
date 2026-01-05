import AppError from "../../core/utils/AppError";
import { PaginationResult } from "../../types/global";
import {
  createGroupDTO,
  IGroup,
  updateGroupDTO,
} from "../../types/group.types";
import GroupRepository from "./groups.repo";
import fs from "fs";
export default class GroupService {
  private static instance: GroupService;
  private repo: GroupRepository;

  private constructor() {
    this.repo = GroupRepository.getInstance();
  }

  async createGroup(data: createGroupDTO): Promise<IGroup> {
    try {
      const group = await this.repo.createGroup(data);
      await this.repo.joinGroup(group._id as string, data.creatorId, "admin", "active");
      return group;
    } catch (err) {
      await fs.promises.unlink(`uploads/groups/${data.logo}`).catch(() => {});
      throw err;
    }
  }

  async deleteGroup(id: string, userID: string): Promise<void> {
    const group = await this.repo.getGroupById(id);
    if (!group) throw new AppError("group not found", 404);
    if (group.creatorId.toString() != userID) {
      throw new AppError("you are not authorized to delete this group", 403);
    }

    await this.repo.deleteGroupById(id);
    await this.repo.deleteMembersByGroupId(id);
    await this.repo.deleteJoinRequestsByGroupId(id);

    if (group.logo)
      await fs.promises.unlink(`uploads/groups/${group.logo}`).catch(() => {});
  }
  async getGroupById(id: string): Promise<IGroup> {
    const group = await this.repo.getGroupById(id);
    if (!group) throw new AppError("group not found", 404);
    return group;
  }
  async getGroups(searchQuery: any): Promise<PaginationResult<IGroup>> {
    const result = await this.repo.getGroups(searchQuery);
    if (result.data.length === 0) throw new AppError("no groups found", 404);
    return result;
  }
  async updateGroupById(data: updateGroupDTO): Promise<IGroup | null> {
    try {
      const group = await this.repo.getGroupById(data.postId);
      if (!group) throw new AppError("group not found", 404);
      if (group.creatorId.toString() != data.userID) {
        throw new AppError("you are not authorized to update this group", 403);
      }
      if (data.data.logo)
        fs.promises.unlink(`uploads/groups/${group.logo}`).catch(() => {});
      const updatedGroup = await this.repo.updateGroupById(data);
      return updatedGroup;
    } catch (err) {
      await fs.promises
        .unlink(`uploads/groups/${data.data.logo}`)
        .catch(() => {});
      throw err;
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<string> {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw new AppError("group not found", 404);

    const status = await this.repo.checkMemberStatus(groupId, userId);
    if (status === "banned") throw new AppError("You are banned from this group", 403);
    if (status === "active") throw new AppError("You are already a member", 400);

    // Check pending requests
    const existingRequest = await this.repo.getJoinRequest(groupId, userId);
    if (existingRequest) throw new AppError("Join request already pending", 400);

    if (group.privacy === "public") {
      await this.repo.joinGroup(groupId, userId, "member", "active");
      await this.repo.updateMemberCount(groupId, 1);
      return "Joined successfully";
    } else {
      await this.repo.createJoinRequest(groupId, userId);
      return "Join request sent";
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw new AppError("group not found", 404);

    const memberStatus = await this.repo.checkMemberStatus(groupId, userId);
    if (!memberStatus) throw new AppError("You are not a member of this group", 400);

    if (group.creatorId.toString() === userId) {
        throw new AppError("Creator cannot leave the group. Delete it or transfer ownership.", 403);
    }

    await this.repo.removeMember(groupId, userId);
    await this.repo.updateMemberCount(groupId, -1);
  }

  async getGroupRequests(groupId: string, userId: string, query: any): Promise<PaginationResult<any>> {
    await this.checkGroupAdmin(groupId, userId);
    return await this.repo.getGroupRequests(groupId, query);
  }

  async acceptJoinRequest(groupId: string, adminId: string, requestId: string): Promise<void> {
    await this.checkGroupAdmin(groupId, adminId);
    
    const request = await this.repo.getJoinRequestById(requestId);
    if (!request) throw new AppError("Request not found", 404);
    if (request.groupId.toString() !== groupId) throw new AppError("Request does not belong to this group", 400);

    // Add member
    await this.repo.joinGroup(groupId, request.userId.toString(), "member", "active");
    await this.repo.updateMemberCount(groupId, 1);

    // Delete request
    await this.repo.deleteJoinRequest(requestId);
  }

  async declineJoinRequest(groupId: string, adminId: string, requestId: string): Promise<void> {
    await this.checkGroupAdmin(groupId, adminId);

    const request = await this.repo.getJoinRequestById(requestId);
    if (!request) throw new AppError("Request not found", 404);
    if (request.groupId.toString() !== groupId) throw new AppError("Request does not belong to this group", 400);

    await this.repo.deleteJoinRequest(requestId);
  }
  
  async cancelJoinRequest(groupId: string, userId: string): Promise<void> {
     const request =  await this.repo.deleteJoinRequestByGroupAndUser(groupId, userId);
     if(!request) throw new AppError("Request not found", 404);
  }

  private async checkGroupAdmin(groupId: string, userId: string): Promise<void> {
    const role = await this.repo.checkMemberRole(groupId, userId);
    console.log(role); 
    if (!role || (role !== "admin" && role !== "moderator")) {
        throw new AppError("You are not authorized (Admin/Moderator only)", 403);
    }
  }
  static getInstance() {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }
}
