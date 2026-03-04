import CommentsService from "./comments.service";
import CommentsRepository from "./comments.repo";
import PostService from "../posts/posts.service";
import GroupService from "../groups/groups.service";
import { IComment } from "../../types/comment.types";
import { IPost } from "../../types/post.types";
import { FilterType } from "../../types/global";
import filterQueue from "../../jobs/queues/filterQueue";
import AppError from "../../core/utils/AppError";
import mongoose from "mongoose";

// Mock dependencies
jest.mock("./comments.repo");
jest.mock("../posts/posts.service");
jest.mock("../groups/groups.service");
jest.mock("../../jobs/queues/filterQueue", () => ({
  add: jest.fn(),
}));

describe("CommentsService", () => {
  let commentsService: CommentsService;
  let commentsRepo: jest.Mocked<CommentsRepository>;
  let postService: jest.Mocked<PostService>;
  let groupService: jest.Mocked<GroupService>;

  beforeEach(() => {
    commentsRepo = new CommentsRepository() as any;
    postService = new PostService(
      {} as any,
      {} as any
    ) as any;
    groupService = {
      checkGroupAdmin: jest.fn(),
    } as any;

    // Manually inject dependencies or use constructor if possible per implementation
    // Assuming constructor injection or setter for testability
    // Based on implementation, recreating instance with mocks:
    commentsService = new CommentsService(
        commentsRepo,
        postService,
        groupService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReply", () => {
    const mockParentComment: IComment = {
      _id: "66144e138a7c2957b8979373",
      userId: new mongoose.Types.ObjectId("66144e138a7c2957b8979374"),
      postId: new mongoose.Types.ObjectId("66144e138a7c2957b8979375"),
      text: "Parent Text",
      isEdited: false,
      flagged: false,
    } as any;

    it("should create a reply and increment relevant counts", async () => {
      commentsRepo.getCommentById.mockResolvedValue(mockParentComment);
      const mockReply = { ...mockParentComment, _id: "replyId", text: "Reply Text" };
      commentsRepo.createReply.mockResolvedValue(mockReply as any);

      postService.incrementCommentsCount = jest.fn().mockResolvedValue(true);
      commentsRepo.incrementRepliesCount = jest.fn().mockResolvedValue(true);

      const result = await commentsService.createReply({
        userId: "user1",
        postId: "", 
        parent: "66144e138a7c2957b8979373",
        text: "Reply Text"
      });

      expect(commentsRepo.createReply).toHaveBeenCalledWith({
        userId: "user1",
        postId: "66144e138a7c2957b8979375",
        parent: "66144e138a7c2957b8979373",
        text: "Reply Text"
      });
      expect(commentsRepo.incrementRepliesCount).toHaveBeenCalledWith("66144e138a7c2957b8979373");
      // Since postService.incrementCommentsCount is called on this.postService which is mocked
      expect(postService.incrementCommentsCount).toHaveBeenCalledWith("66144e138a7c2957b8979375");
      expect(filterQueue.add).toHaveBeenCalled();
      expect(result).toEqual(mockReply);
    });

    it("should throw error if parent comment not found", async () => {
      commentsRepo.getCommentById.mockResolvedValue(null);
      await expect(
        commentsService.createReply({
          userId: "userid", postId: "postid", parent: "invalid", text: "text"
        })
      ).rejects.toThrow(AppError);
    });

    it("should throw error if parent comment is already a nested reply", async () => {
      commentsRepo.getCommentById.mockResolvedValue({
        ...mockParentComment,
        parent: new mongoose.Types.ObjectId("66144e138a7c2957b8979376")
      } as any);
      
      await expect(
        commentsService.createReply({
          userId: "userid", postId: "", parent: "nestedparent", text: "text"
        })
      ).rejects.toThrow("Nested replies are not allowed");
    });
  });

  describe("getReplies", () => {
    it("should retrieve replies using the repo successfully", async () => {
      commentsRepo.getCommentById.mockResolvedValue({ _id: "parentCid"} as any);
      
      const mockPaginatedResult = {
        data: [{ text: "reply1" }],
        page: 1
      };
      commentsRepo.getRepliesByCommentId = jest.fn().mockResolvedValue(mockPaginatedResult);

      const result = await commentsService.getReplies("parentCid", { page: 1 });
      
      expect(commentsRepo.getRepliesByCommentId).toHaveBeenCalledWith("parentCid", { page: 1 });
      expect(result).toEqual(mockPaginatedResult);
    });

    it("should throw error if parent comment not found", async () => {
      commentsRepo.getCommentById.mockResolvedValue(null);
      await expect(commentsService.getReplies("invalid", {})).rejects.toThrow(AppError);
    });
  });

  describe("getPostComments", () => {
    it("should retrieve comments for a post successfully", async () => {
      postService.getPostbyId = jest.fn().mockResolvedValue({ _id: "postId" });

      const mockPaginatedResult = {
        data: [{ text: "comment1" }],
        page: 1
      };
      commentsRepo.getCommentsByPostId = jest.fn().mockResolvedValue(mockPaginatedResult);

      const result = await commentsService.getPostComments("postId", { page: 1, sort: "-reactionsCount" });

      expect(postService.getPostbyId).toHaveBeenCalledWith("postId");
      expect(commentsRepo.getCommentsByPostId).toHaveBeenCalledWith("postId", { page: 1, sort: "-reactionsCount" });
      expect(result).toEqual(mockPaginatedResult);
    });

    it("should throw error if post not found", async () => {
      postService.getPostbyId = jest.fn().mockResolvedValue(null);
      await expect(commentsService.getPostComments("invalidPost", {})).rejects.toThrow(AppError);
    });
  });

  describe("updateComment", () => {
    const mockComment: IComment = {
      _id: "66144e138a7c2957b8979373",
      userId: new mongoose.Types.ObjectId("66144e138a7c2957b8979374"),
      postId: new mongoose.Types.ObjectId("66144e138a7c2957b8979375"),
      text: "Original Text",
      isEdited: false,
      flagged: false,
    } as any;

    it("should update comment and set isEdited to true", async () => {
      commentsRepo.getCommentById.mockResolvedValue(mockComment);
      commentsRepo.updateCommentById.mockResolvedValue({
        ...mockComment,
        text: "New Text",
        isEdited: true,
      });

      const result = await commentsService.updateComment({
        cid: "66144e138a7c2957b8979373",
        userId: "66144e138a7c2957b8979374",
        text: "New Text",
      });

      expect(commentsRepo.updateCommentById).toHaveBeenCalledWith(
        "66144e138a7c2957b8979373",
        expect.objectContaining({
          text: "New Text",
          isEdited: true,
          flagged: false,
        }),
      );
      expect(result.isEdited).toBe(true);
      expect(filterQueue.add).toHaveBeenCalledWith(
        "check-filter",
        expect.objectContaining({
          caption: "New Text",
          filterType: FilterType.comment,
        }),
      );
    });

    it("should throw error if user is not authorized", async () => {
      commentsRepo.getCommentById.mockResolvedValue(mockComment);

      await expect(
        commentsService.updateComment({
          cid: "66144e138a7c2957b8979373",
          userId: "66144e138a7c2957b8979379",
          text: "New Text",
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe("deleteComment", () => {
    const mockComment: IComment = {
      _id: "66144e138a7c2957b8979373",
      userId: new mongoose.Types.ObjectId("66144e138a7c2957b8979374"),
      postId: new mongoose.Types.ObjectId("66144e138a7c2957b8979375"),
    } as any;

    const mockPost: IPost = {
      _id: "66144e138a7c2957b8979375",
      authorID: new mongoose.Types.ObjectId("66144e138a7c2957b8979376"),
    } as any;

    it("should delete comment if user is author", async () => {
      commentsRepo.getCommentById.mockResolvedValue(mockComment);
      postService.getPostbyId.mockResolvedValue(mockPost);

      await commentsService.deleteComment(
        "66144e138a7c2957b8979373",
        "66144e138a7c2957b8979374",
      );

      expect(commentsRepo.deleteRepliesByParentId).toHaveBeenCalledWith(
        "66144e138a7c2957b8979373",
      );
      expect(commentsRepo.deleteCommentById).toHaveBeenCalledWith(
        "66144e138a7c2957b8979373",
      );
    });

    it("should delete comment if user is group admin", async () => {
      commentsRepo.getCommentById.mockResolvedValue(mockComment);
      const groupPost: IPost = {
        ...mockPost,
        groupID: new mongoose.Types.ObjectId("66144e138a7c2957b8979377"),
      } as any;
      postService.getPostbyId.mockResolvedValue(groupPost);
      groupService.checkGroupAdmin.mockResolvedValue(); // Success

      await commentsService.deleteComment(
        "66144e138a7c2957b8979373",
        "66144e138a7c2957b8979378",
      );

      expect(groupService.checkGroupAdmin).toHaveBeenCalledWith(
        "66144e138a7c2957b8979377",
        "66144e138a7c2957b8979378",
      );
      expect(commentsRepo.deleteCommentById).toHaveBeenCalledWith(
        "66144e138a7c2957b8979373",
      );
    });

    it("should throw error if user is not authorized (neither author nor admin)", async () => {
      commentsRepo.getCommentById.mockResolvedValue(mockComment);
      const groupPost: IPost = {
        ...mockPost,
        groupID: new mongoose.Types.ObjectId("66144e138a7c2957b8979377"),
      } as any;
      postService.getPostbyId.mockResolvedValue(groupPost);
      groupService.checkGroupAdmin.mockRejectedValue(new Error("Not admin"));

      await expect(
        commentsService.deleteComment(
          "66144e138a7c2957b8979373",
          "66144e138a7c2957b8979379",
        ),
      ).rejects.toThrow(AppError);
    });
  });
});
