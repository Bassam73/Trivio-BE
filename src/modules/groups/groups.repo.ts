import ApiFeatures from "../../core/utils/ApiFeatures";
import groupModel from "../../database/models/group.model";
import { PaginationResult } from "../../types/global";
import {
  createGroupDTO,
  IGroup,
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
  async deletGroupById(id: string): Promise<IGroup | null> {
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
      .sort()
      .pagination(10);
    const reuslt: PaginationResult<IGroup> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return reuslt;
  }
  static getInstance() {
    if (!GroupRepository.instance) {
      GroupRepository.instance = new GroupRepository();
    }
    return GroupRepository.instance;
  }
}
