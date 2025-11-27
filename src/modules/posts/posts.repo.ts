import postModel from "../../database/models/post.model";
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
  static getInstace() {
    if (!PostRepository.instance) {
      PostRepository.instance = new PostRepository();
    }
    return PostRepository.instance;
  }
}
