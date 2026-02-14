import ApiFeatures from "../../core/utils/ApiFeatures";
import groupModel from "../../database/models/group.model";
import groupMemberModel from "../../database/models/groupMember.model";
import joinRequestModel from "../../database/models/joinRequest.model";
import { PaginationResult } from "../../types/global";
import {
  createGroupDTO,
  IGroup,
  IGroupMember,
  IJoinRequest,
  updateGroupDTO,
} from "../../types/group.types";

export default class GroupRepository {
  private static instance: GroupRepository;

  private constructor() {}

  async createGroup(data: createGroupDTO): Promise<IGroup> {
    return await groupModel.create(data);
  }
  async getGroupById(id: string): Promise<IGroup | null> {
    return await groupModel.findById(id);
  }
  async deleteGroupById(id: string): Promise<IGroup | null> {
    return await groupModel.findByIdAndDelete(id);
  }

  async updateGroupById(data: updateGroupDTO): Promise<IGroup | null> {
    return await groupModel.findByIdAndUpdate(data.postId, data.data, {
      new: true,
    });
  }
  async getGroups(searchQuery: any): Promise<PaginationResult<IGroup>> {
    const apiFeatures = new ApiFeatures<IGroup>(groupModel.find(), searchQuery)
      .fields()
      .filter()
      .search("name") // Fixed: Search by name
      .sort()
      .pagination(10);
    const reuslt: PaginationResult<IGroup> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return reuslt;
  }
  async joinGroup(
    groupId: string,
    userId: string,
    role: string = "member",
    status: string = "active",
  ): Promise<IGroupMember> {
    // Check if member already exists to avoid duplicates
    const existingMember = await groupMemberModel.findOne({ groupId, userId });
    if (existingMember) return existingMember;

    return await groupMemberModel.create({
      groupId,
      userId,
      role,
      status,
    });
  }

  async deleteMembersByGroupId(groupId: string): Promise<void> {
    await groupMemberModel.deleteMany({ groupId });
  }

  async deleteJoinRequestsByGroupId(groupId: string): Promise<void> {
    await joinRequestModel.deleteMany({ groupId });
  }

  async checkMemberStatus(
    groupId: string,
    userId: string,
  ): Promise<string | null> {
    const member = await groupMemberModel.findOne({ groupId, userId });
    return member ? member.status : null; // returns 'active' or 'banned' or null
  }

  async checkMemberRole(
    groupId: string,
    userId: string,
  ): Promise<string | null> {
    console.log(userId);
    console.log(groupId);
    const member = await groupMemberModel.findOne({ groupId, userId });
    console.log(member);
    return member ? member.role : null;
  }

  async updateMemberCount(groupId: string, increment: number): Promise<void> {
    await groupModel.findByIdAndUpdate(groupId, {
      $inc: { members: increment },
    });
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await groupMemberModel.findOneAndDelete({ groupId, userId });
  }

  async createJoinRequest(
    groupId: string,
    userId: string,
  ): Promise<IJoinRequest> {
    return await joinRequestModel.create({
      groupId,
      userId,
      status: "pending",
    });
  }

  async getJoinRequest(
    groupId: string,
    userId: string,
  ): Promise<IJoinRequest | null> {
    return await joinRequestModel.findOne({ groupId, userId });
  }

  async getJoinRequestById(requestId: string): Promise<IJoinRequest | null> {
    return await joinRequestModel.findById(requestId);
  }

  async deleteJoinRequest(requestId: string): Promise<IJoinRequest | null> {
    return await joinRequestModel.findByIdAndDelete(requestId);
  }

  async deleteJoinRequestByGroupAndUser(
    groupId: string,
    userId: string,
  ): Promise<IJoinRequest | null> {
    return await joinRequestModel.findOneAndDelete({ groupId, userId });
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: string,
  ): Promise<IGroupMember | null> {
    return await groupMemberModel.findOneAndUpdate(
      { groupId, userId },
      { role },
      { new: true },
    );
  }

  async updateMemberStatus(
    groupId: string,
    userId: string,
    status: string,
  ): Promise<IGroupMember | null> {
    return await groupMemberModel.findOneAndUpdate(
      { groupId, userId },
      { status },
      { new: true },
    );
  }

  async incrementKickCount(
    groupId: string,
    userId: string,
  ): Promise<IGroupMember | null> {
    return await groupMemberModel.findOneAndUpdate(
      { groupId, userId },
      { $inc: { kicksCount: 1 } },
      { new: true },
    );
  }

  async resetKickCount(
    groupId: string,
    userId: string,
  ): Promise<IGroupMember | null> {
    return await groupMemberModel.findOneAndUpdate(
      { groupId, userId },
      { kicksCount: 0, lastKickReset: Date.now() },
      { new: true },
    );
  }

  async getMember(
    groupId: string,
    userId: string,
  ): Promise<IGroupMember | null> {
    return await groupMemberModel.findOne({ groupId, userId });
  }

  async getMembers(
    groupId: string,
    searchQuery: any,
    role?: string,
    status?: string,
  ): Promise<PaginationResult<IGroupMember>> {
    const filter: any = { groupId };
    if (role) filter.role = role;
    if (status) filter.status = status;

    const apiFeatures = new ApiFeatures<IGroupMember>(
      groupMemberModel.find(filter).populate("userId", "name email"),
      searchQuery,
    ).pagination(10); // Default limit

    const result: PaginationResult<IGroupMember> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return result;
  }

  async getGroupRequests(
    groupId: string,
    searchQuery: any,
  ): Promise<PaginationResult<IJoinRequest>> {
    const apiFeatures = new ApiFeatures<IJoinRequest>(
      joinRequestModel
        .find({ groupId, status: "pending" })
        .populate("userId", "name email"),
      searchQuery,
    ).pagination(10);

    const result: PaginationResult<IJoinRequest> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return result;
  }
  async getJoinsForUser(userID: string) {
    return await groupMemberModel.find({ userId: userID });
  }

  async getMyGroups(userID: string) {
    return await groupModel.find({ creatorId: userID });
  }
  static getInstance() {
    if (!GroupRepository.instance) {
      GroupRepository.instance = new GroupRepository();
    }
    return GroupRepository.instance;
  }
  async getUsersJoinedGroups(userID: string) {
    return groupMemberModel.find({ userId: userID }).populate("groupId");
  }
}
