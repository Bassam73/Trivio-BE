import ApiFeatures from "../../core/utils/ApiFeatures";
import postModel from "../../database/models/post.model";
import { PaginationResult } from "../../types/global";
import { createPostDTO, IPost } from "../../types/post.types";

export default class PostRepository {
  private static instance: PostRepository;
  constructor() {}
  async createPost(data: createPostDTO): Promise<IPost> {
    return await postModel.create(data);
  }
  async getPublicPosts(): Promise<IPost[]> {
    return await postModel.find({ type: "public" });
  }
  async getPostById(id: string): Promise<IPost | null> {
    return await postModel.findById(id);
  }
  async deletePostById(id: string): Promise<IPost | null> {
    return await postModel.findByIdAndDelete(id);
  }
  async updatePostById(id: string, data: any): Promise<IPost | null> {
    return await postModel.findByIdAndUpdate(id, data, { new: true });
  }
  async getGroupPosts(groupId: string, searchQuery: any) {
    const apiFeatures = new ApiFeatures<IPost>(
      postModel.find({ location: "group", groupID: groupId }),
      searchQuery,
    )
      .filter()
      .search()
      .sort()
      .fields()
      .pagination(10);

    const reuslt: PaginationResult<IPost> = {
      data: await apiFeatures.getQuery(),
      page: apiFeatures.getPageNumber(),
    };
    return reuslt;
  }

  async findPostsByIds(postIds: string[]) {
    return await postModel.find({ 
      _id: { $in: postIds } 
    });
  }
  async findPostsByUserId(userId: string, page: number, limit: number): Promise<IPost[]> {
    return await postModel.find({ 
        authorID: userId,
        location: "profile" 
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "authorID",
        select: "username avatar" 
      })
      .populate({
        path: "sharedFrom",
        populate: { path: "authorID", select: "username avatar" }
      })
      .exec();
  }
  static getInstace() {
    if (!PostRepository.instance) {
      PostRepository.instance = new PostRepository();
    }
    return PostRepository.instance;
  }
}
