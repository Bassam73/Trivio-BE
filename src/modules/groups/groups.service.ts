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
      return await this.repo.createGroup(data);
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

    await this.repo.deletGroupById(id);
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
  static getInstance() {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }
}
