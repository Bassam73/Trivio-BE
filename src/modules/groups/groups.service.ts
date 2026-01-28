import AppError from "../../core/utils/AppError";
import { PaginationResult } from "../../types/global";
import {
  changeMemberRoleDTO,
  createGroupDTO,
  IGroup,
  IGroupMember,
  memberActionDTO,
  updateGroupDTO,
} from "../../types/group.types";
import GroupRepository from "./groups.repo";
import fs, { appendFile } from "fs";
import mongo from "mongoose";
import PostService from "../posts/posts.service";
import { createPostDTO, IPost, updatePostDTO } from "../../types/post.types";
import { post } from "axios";
export default class GroupService {
  private static instance: GroupService;
  private repo: GroupRepository;
  private postService: PostService;
  private constructor() {
    this.repo = GroupRepository.getInstance();
    this.postService = PostService.getInstace();
  }

  async createGroup(data: createGroupDTO): Promise<IGroup> {
    try {
      const group = await this.repo.createGroup(data);
      await this.repo.joinGroup(
        group._id as string,
        data.creatorId,
        "admin",
        "active",
      );
      return group;
    } catch (err) {
      if (data.logo) {
        const filename = data.logo.split("/").pop();
        await fs.promises.unlink(`uploads/groups/${filename}`).catch(() => {});
      }
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

    if (group.logo) {
      const filename = group.logo.split("/").pop();
      await fs.promises.unlink(`uploads/groups/${filename}`).catch(() => {});
    }
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
      if (data.data.logo) {
        if (group.logo) {
          const filename = group.logo.split("/").pop();
          fs.promises.unlink(`uploads/groups/${filename}`).catch(() => {});
        }
      }
      const updatedGroup = await this.repo.updateGroupById(data);
      return updatedGroup;
    } catch (err) {
      if (data.data.logo) {
        const filename = data.data.logo.split("/").pop();
        await fs.promises.unlink(`uploads/groups/${filename}`).catch(() => {});
      }
      throw err;
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<string> {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw new AppError("group not found", 404);

    const status = await this.repo.checkMemberStatus(groupId, userId);
    if (status === "banned")
      throw new AppError("You are banned from this group", 403);
    if (status === "active")
      throw new AppError("You are already a member", 400);

    // Check pending requests
    const existingRequest = await this.repo.getJoinRequest(groupId, userId);
    if (existingRequest)
      throw new AppError("Join request already pending", 400);

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
    if (!memberStatus)
      throw new AppError("You are not a member of this group", 400);

    if (group.creatorId.toString() === userId) {
      throw new AppError(
        "Creator cannot leave the group. Delete it or transfer ownership.",
        403,
      );
    }

    await this.repo.removeMember(groupId, userId);
    await this.repo.updateMemberCount(groupId, -1);
  }

  async getGroupRequests(
    groupId: string,
    userId: string,
    query: any,
  ): Promise<PaginationResult<any>> {
    await this.checkGroupAdmin(groupId, userId);
    return await this.repo.getGroupRequests(groupId, query);
  }

  async acceptJoinRequest(
    groupId: string,
    adminId: string,
    requestId: string,
  ): Promise<void> {
    await this.checkGroupAdmin(groupId, adminId);

    const request = await this.repo.getJoinRequestById(requestId);
    if (!request) throw new AppError("Request not found", 404);
    if (request.groupId.toString() !== groupId)
      throw new AppError("Request does not belong to this group", 400);

    // Add member
    await this.repo.joinGroup(
      groupId,
      request.userId.toString(),
      "member",
      "active",
    );
    await this.repo.updateMemberCount(groupId, 1);

    // Delete request
    await this.repo.deleteJoinRequest(requestId);
  }

  async declineJoinRequest(
    groupId: string,
    adminId: string,
    requestId: string,
  ): Promise<void> {
    await this.checkGroupAdmin(groupId, adminId);

    const request = await this.repo.getJoinRequestById(requestId);
    if (!request) throw new AppError("Request not found", 404);
    if (request.groupId.toString() !== groupId)
      throw new AppError("Request does not belong to this group", 400);

    await this.repo.deleteJoinRequest(requestId);
  }

  async cancelJoinRequest(groupId: string, userId: string): Promise<void> {
    const request = await this.repo.deleteJoinRequestByGroupAndUser(
      groupId,
      userId,
    );
    if (!request) throw new AppError("Request not found", 404);
  }

  async promoteMember(
    dto: changeMemberRoleDTO,
    requesterId: string,
  ): Promise<void> {
    const group = await this.repo.getGroupById(dto.groupId);
    if (!group) throw new AppError("Group not found", 404);

    const targetMember = await this.repo.getMember(
      dto.groupId,
      dto.targetUserId,
    );
    if (!targetMember || targetMember.status !== "active")
      throw new AppError("Target user is not an active member", 400);

    const roleValue: { [key: string]: number } = {
      member: 0,
      moderator: 1,
      admin: 2,
    };
    if (roleValue[dto.newRole] <= roleValue[targetMember.role]) {
      throw new AppError("Promotion must be to a higher role", 400);
    }
    if (group.creatorId.toString() != requesterId) {
      const requesterRole = await this.repo.checkMemberRole(
        dto.groupId,
        requesterId,
      );
      if (requesterRole !== "admin") throw new AppError("Not authorized", 403);
      if (dto.newRole !== "moderator")
        throw new AppError("Admins can only promote to Moderator", 403);
    }

    await this.repo.updateMemberRole(
      dto.groupId,
      dto.targetUserId,
      dto.newRole,
    );

    if (dto.newRole === "admin" && targetMember.role !== "admin") {
      await group.updateOne({ $inc: { admins: 1 } });
      if (targetMember.role === "moderator") {
        await group.updateOne({ $inc: { moderators: -1 } });
      }
    } else if (
      dto.newRole === "moderator" &&
      targetMember.role !== "moderator"
    ) {
      await group.updateOne({ $inc: { moderators: 1 } });
      if (targetMember.role === "admin") {
        await group.updateOne({ $inc: { admins: -1 } });
      }
    }
  }

  async demoteMember(
    dto: changeMemberRoleDTO,
    requesterId: string,
  ): Promise<void> {
    const group = await this.repo.getGroupById(dto.groupId);
    if (!group) throw new AppError("Group not found", 404);

    const targetMember = await this.repo.getMember(
      dto.groupId,
      dto.targetUserId,
    );
    if (!targetMember) throw new AppError("Member not found", 404);

    const roleValue: { [key: string]: number } = {
      member: 0,
      moderator: 1,
      admin: 2,
    };
    if (roleValue[dto.newRole] >= roleValue[targetMember.role]) {
      throw new AppError("Demotion must be to a lower role", 400);
    }

    if (group.creatorId.toString() == requesterId) {
      // Creator can demote anyone
      if (dto.targetUserId == requesterId)
        throw new AppError("Creator cannot demote themselves", 400);
    } else {
      // Admin trying to demote
      const requesterRole = await this.repo.checkMemberRole(
        dto.groupId,
        requesterId,
      );
      if (requesterRole !== "admin") throw new AppError("Not authorized", 403);
      if (targetMember.role === "admin")
        throw new AppError("Admins cannot demote other Admins", 403);
      if (targetMember.role === "member")
        throw new AppError("Target is already a member", 400);
    }

    await this.repo.updateMemberRole(
      dto.groupId,
      dto.targetUserId,
      dto.newRole,
    );

    if (targetMember.role === "admin") {
      await group.updateOne({ $inc: { admins: -1 } });
      if (dto.newRole === "moderator") {
        await group.updateOne({ $inc: { moderators: 1 } });
      }
    } else if (targetMember.role === "moderator") {
      await group.updateOne({ $inc: { moderators: -1 } });
    }
  }

  async kickMember(dto: memberActionDTO, requesterId: string): Promise<void> {
    const group = await this.repo.getGroupById(dto.groupId);
    if (!group) throw new AppError("Group not found", 404);

    const targetMember = await this.repo.getMember(
      dto.groupId,
      dto.targetUserId,
    );
    if (!targetMember) throw new AppError("Target user not found", 404);

    if (group.creatorId.toString() != requesterId) {
      const requesterMember = await this.repo.getMember(
        dto.groupId,
        requesterId,
      );
      if (
        !requesterMember ||
        (requesterMember.role !== "admin" &&
          requesterMember.role !== "moderator")
      ) {
        throw new AppError("Not authorized", 403);
      }

      if (requesterMember.role === "moderator") {
        if (targetMember.role !== "member")
          throw new AppError("Moderators can only kick members", 403);

        // Rate limit check
        const now = Date.now();
        const oneHour = 3600 * 1000;
        const lastReset = new Date(requesterMember.lastKickReset).getTime(); // Ensure Date object

        if (now - lastReset > oneHour) {
          await this.repo.resetKickCount(dto.groupId, requesterId);
          requesterMember.kicksCount = 0;
        } else if (requesterMember.kicksCount >= 5) {
          throw new AppError("Kick limit reached (5 per hour)", 429);
        }
        await this.repo.incrementKickCount(dto.groupId, requesterId);
      }

      if (requesterMember.role === "admin") {
        if (targetMember.role === "admin")
          throw new AppError("Admins cannot kick other Admins", 403);
      }
    } else {
      // Creator cannot kick self
      if (dto.targetUserId === requesterId)
        throw new AppError("Creator cannot kick themselves", 400);
    }

    await this.repo.removeMember(dto.groupId, dto.targetUserId);
    await this.repo.updateMemberCount(dto.groupId, -1);
    await this.repo.updateMemberCount(dto.groupId, -1);
    if (targetMember.role === "admin") {
      await group.updateOne({ $inc: { admins: -1 } });
    } else if (targetMember.role === "moderator") {
      await group.updateOne({ $inc: { moderators: -1 } });
    }
  }

  async banMember(dto: memberActionDTO, requesterId: string): Promise<void> {
    const group = await this.repo.getGroupById(dto.groupId);
    if (!group) throw new AppError("Group not found", 404);

    const targetMember = await this.repo.getMember(
      dto.groupId,
      dto.targetUserId,
    );
    if (!targetMember) throw new AppError("Member not found", 404);
    if (targetMember.status === "banned")
      throw new AppError("User is already banned", 400);

    if (group.creatorId.toString() != requesterId) {
      const requesterRole = await this.repo.checkMemberRole(
        dto.groupId,
        requesterId,
      );
      if (requesterRole !== "admin")
        throw new AppError("Only Admins and Creator can ban", 403);
      if (targetMember.role === "admin")
        throw new AppError("Admins cannot ban other Admins", 403);
    }

    await this.repo.updateMemberStatus(dto.groupId, dto.targetUserId, "banned");
    // Decrement member count as they are effectively removed from active members
    await this.repo.updateMemberCount(dto.groupId, -1);
    if (targetMember.role === "admin") {
      await group.updateOne({ $inc: { admins: -1 } });
    } else if (targetMember.role === "moderator") {
      await group.updateOne({ $inc: { moderators: -1 } });
    }
  }

  async unbanMember(dto: memberActionDTO, requesterId: string): Promise<void> {
    const group = await this.repo.getGroupById(dto.groupId);
    if (!group) throw new AppError("Group not found", 404);

    const targetMember = await this.repo.getMember(
      dto.groupId,
      dto.targetUserId,
    );
    if (!targetMember) throw new AppError("Member entry not found", 404);
    if (targetMember.status !== "banned")
      throw new AppError("User is not banned", 400);

    const requesterRole = await this.repo.checkMemberRole(
      dto.groupId,
      requesterId,
    );
    if (
      requesterRole !== "admin" &&
      group.creatorId.toString() != requesterId
    ) {
      throw new AppError("Only Admins and Creator can unban", 403);
    }

    await this.repo.updateMemberStatus(dto.groupId, dto.targetUserId, "active");
    await this.repo.updateMemberCount(dto.groupId, 1);
    await this.repo.updateMemberRole(dto.groupId, dto.targetUserId, "member");
  }

  async getBannedUsers(
    groupId: string,
    requesterId: string,
    query: any,
  ): Promise<PaginationResult<IGroupMember>> {
    await this.checkGroupAdmin(groupId, requesterId);
    const role = await this.repo.checkMemberRole(groupId, requesterId);
    const group = await this.repo.getGroupById(groupId);
    if (group?.creatorId.toString() != requesterId && role !== "admin") {
      throw new AppError("Only Admins and Creator can view banned users", 403);
    }

    return await this.repo.getMembers(groupId, query, undefined, "banned");
  }

  async getGroupMembers(
    groupId: string,
    query: any,
  ): Promise<PaginationResult<IGroupMember>> {
    return await this.repo.getMembers(groupId, query, "member", "active");
  }

  async getGroupAdmins(
    groupId: string,
    query: any,
  ): Promise<PaginationResult<IGroupMember>> {
    return await this.repo.getMembers(groupId, query, "admin", "active");
  }

  async getGroupModerators(
    groupId: string,
    query: any,
  ): Promise<PaginationResult<IGroupMember>> {
    return await this.repo.getMembers(groupId, query, "moderator", "active");
  }

  private async checkGroupAdmin(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const role = await this.repo.checkMemberRole(groupId, userId);
    if (!role || (role !== "admin" && role !== "moderator")) {
      throw new AppError("You are not authorized (Admin/Moderator only)", 403);
    }
  }

  async createGroupPost(data: createPostDTO): Promise<IPost> {
    try {
      console.log(data);
      const post = await this.postService.createPost(data);
      return post;
    } catch (err) {
      if (data.media) {
        for (const media of data.media) {
          const filename = media.split("/").pop();
          await fs.promises
            .unlink(`uploads/groups/posts/${filename}`)
            .catch(() => {});
        }
      }
      throw err;
    }
  }
  async deleteGroupPost(
    groupId: string,
    postId: string,
    userId: string,
  ): Promise<void> {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw new AppError("Group not found", 404);
    const post = await this.postService.getPublicPostsById(postId);
    if (!post) throw new AppError("Post not found", 404);
    let deletedPost: IPost;
    if (post.authorID.toString() != userId) {
      await this.checkGroupAdmin(groupId, userId);
      deletedPost = await this.postService.deleteGroupPost(postId);
    } else {
      deletedPost = await this.postService.deleteGroupPost(postId);
    }
  }

  async updateGroupPost(data: updatePostDTO): Promise<IPost | null> {
    const post = await this.postService.updatePostById(data);
    return post;
  }
  async getGroupPosts(
    groupId: string,
    userId: string,
    query: any,
  ): Promise<PaginationResult<IPost>> {
    const group = await this.repo.getGroupById(groupId);
    if (!group) throw new AppError("Group not found", 404);
    let posts: PaginationResult<IPost>;
    if (group.privacy == "public") {
      posts = await this.postService.getGroupPosts(groupId, query);
    } else {
      const status = await this.repo.checkMemberStatus(groupId, userId);
      if (!status)
        throw new AppError(
          "This group is private you need to join the group to see posts",
          403,
        );
      if (status == "banned")
        throw new AppError("You are banned from this group", 403);
      posts = await this.postService.getGroupPosts(groupId, query);
    }
    return posts;
  }
  async getGroupPostById(
    groupID: string,
    userID: string,
    postID: string,
  ): Promise<IPost> {
    const group = await this.repo.getGroupById(groupID);
    if (!group) throw new AppError("Group not found", 404);
    let post: IPost;
    if (group.privacy == "public") {
      post = await this.postService.getPublicPostsById(postID);
    } else {
      const status = await this.repo.checkMemberStatus(groupID, userID);
      if (!status)
        throw new AppError(
          "This group is private you need to join the group to see posts",
          403,
        );
      if (status == "banned")
        throw new AppError("You are banned from this group", 403);
      post = await this.postService.getPublicPostsById(postID);
    }
    return post;
  }
  private async getPostsOfJoins(joins: IGroupMember[]): Promise<IPost[]> {
    let posts: IPost[] = [];
    await Promise.all(
      joins.map(async (join) => {
        let paginationResult: PaginationResult<IPost> =
          await this.postService.getGroupPosts(
            join.groupId as unknown as string,
            "",
          );
        paginationResult.data.map((post: IPost) => {
          posts.push(post);
        });
      }),
    );
    return posts;
  }
  private shufflePosts(posts: IPost[]): IPost[] {
    for (let i = posts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posts[i], posts[j]] = [posts[j], posts[i]];
    }
    return posts;
  }
  async getGroupFeed(userId: string): Promise<IPost[] | null> {
    const joins = await this.repo.getJoinsForUser(userId);
    if (!joins) console.log("Your Not member of any group", 404);
    const posts: IPost[] = await this.getPostsOfJoins(joins);
    if (!posts) throw new AppError("Posts not Found", 404);
    const shuffledPosts = this.shufflePosts(posts);
    return shuffledPosts;
  }
  static getInstance() {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }
}
