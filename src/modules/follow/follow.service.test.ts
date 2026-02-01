import FollowService from "./follow.service";
import FollowRepository from "./follow.repo";
import UsersRepository from "../users/users.repo";
import AppError from "../../core/utils/AppError";
import { FollowStauts } from "../../types/follow.types";

// Mock dependencies
jest.mock("./follow.repo");
jest.mock("../users/users.repo");

describe("FollowService", () => {
  let service: FollowService;
  let repoMock: jest.Mocked<FollowRepository>;
  let userRepoMock: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    repoMock = {
      createFollow: jest.fn(),
      getAFollow: jest.fn(),
      deleteFollowByID: jest.fn(),
      getFollowRequests: jest.fn(),
      getFollowRequestById: jest.fn(),
      updateFollowStatus: jest.fn(),
      deleteFollowRequest: jest.fn(),
      getFollowers: jest.fn(),
      getFollowing: jest.fn(),
    } as unknown as jest.Mocked<FollowRepository>;

    userRepoMock = {
      incFollowers: jest.fn(),
      incFollowing: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    (FollowRepository.getInstance as jest.Mock).mockReturnValue(repoMock);
    (UsersRepository.getInstance as jest.Mock).mockReturnValue(userRepoMock);

    service = FollowService.getInstance();
    (service as any).repo = repoMock;
    (service as any).userRepo = userRepoMock;
  });

  describe("acceptFollowRequest", () => {
    const requestId = "req123";
    const userId = "user123";
    const followerId = "follower123";

    it("should accept request and update counters successfully", async () => {
      repoMock.getFollowRequestById.mockResolvedValue({
        _id: requestId,
        userId: userId,
        follwerId: followerId,
        status: FollowStauts.pending,
      } as any);

      repoMock.updateFollowStatus.mockResolvedValue({
        _id: requestId,
        status: FollowStauts.following,
      } as any);

      const result = await service.acceptFollowRequest(requestId, userId);

      expect(repoMock.getFollowRequestById).toHaveBeenCalledWith(requestId);
      expect(repoMock.updateFollowStatus).toHaveBeenCalledWith(requestId, FollowStauts.following);
      expect(userRepoMock.incFollowers).toHaveBeenCalledWith(userId, 1);
      expect(userRepoMock.incFollowing).toHaveBeenCalledWith(followerId, 1);
      expect(result.status).toBe(FollowStauts.following);
    });

    it("should throw error if request not found", async () => {
      repoMock.getFollowRequestById.mockResolvedValue(null);
      await expect(service.acceptFollowRequest(requestId, userId)).rejects.toThrow("Follow request not found");
    });

    it("should throw error if user is not authorized", async () => {
      repoMock.getFollowRequestById.mockResolvedValue({
        _id: requestId,
        userId: "otherUser",
        status: FollowStauts.pending,
      } as any);
      await expect(service.acceptFollowRequest(requestId, userId)).rejects.toThrow("You are not authorized");
    });

    it("should throw error if already accepted", async () => {
      repoMock.getFollowRequestById.mockResolvedValue({
        _id: requestId,
        userId: userId,
        status: FollowStauts.following,
      } as any);
      await expect(service.acceptFollowRequest(requestId, userId)).rejects.toThrow("Request already accepted");
    });
  });

  describe("declineFollowRequest", () => {
    const requestId = "req123";
    const userId = "user123";

    it("should decline request successfully", async () => {
        repoMock.getFollowRequestById.mockResolvedValue({
            _id: requestId,
            userId: userId,
            status: FollowStauts.pending,
          } as any);

        await service.declineFollowRequest(requestId, userId);
        expect(repoMock.deleteFollowRequest).toHaveBeenCalledWith(requestId);
    });

    it("should throw error if request not found", async () => {
        repoMock.getFollowRequestById.mockResolvedValue(null);
        await expect(service.declineFollowRequest(requestId, userId)).rejects.toThrow("Follow request not found");
      });
  
      it("should throw error if user is not authorized", async () => {
        repoMock.getFollowRequestById.mockResolvedValue({
          _id: requestId,
          userId: "otherUser",
          status: FollowStauts.pending,
        } as any);
        await expect(service.declineFollowRequest(requestId, userId)).rejects.toThrow("You are not authorized");
      });
  });

  describe("getFollowers", () => {
      it("should call repo.getFollowers", async () => {
          const userId = "user1";
          const mockFollowers = [{ _id: "f1" }];
          repoMock.getFollowers.mockResolvedValue(mockFollowers as any);

          const result = await service.getFollowers(userId, 1, 10);
          expect(repoMock.getFollowers).toHaveBeenCalledWith(userId, 1, 10);
          expect(result).toEqual(mockFollowers);
      });
  });

  describe("getFollowing", () => {
    it("should call repo.getFollowing", async () => {
        const userId = "user1";
        const mockFollowing = [{ _id: "f1" }];
        repoMock.getFollowing.mockResolvedValue(mockFollowing as any);

        const result = await service.getFollowing(userId, 1, 10);
        expect(repoMock.getFollowing).toHaveBeenCalledWith(userId, 1, 10);
        expect(result).toEqual(mockFollowing);
    });
  });

  describe("getRelationshipStatus", () => {
    it("should return 'self' when checking self", async () => {
        const userId = "me";
        const result = await service.getRelationshipStatus(userId, userId);
        expect(result).toBe("self");
    });

    it("should return 'following' when follow exists and status is following", async () => {
        const me = "me";
        const target = "target";
        repoMock.getAFollow.mockResolvedValue({ status: FollowStauts.following } as any);
        
        const result = await service.getRelationshipStatus(me, target);
        expect(repoMock.getAFollow).toHaveBeenCalledWith(target, me);
        expect(result).toBe("following");
    });

    it("should return 'pending' when follow exists and status is pending", async () => {
        const me = "me";
        const target = "target";
        repoMock.getAFollow.mockResolvedValue({ status: FollowStauts.pending } as any);
        
        const result = await service.getRelationshipStatus(me, target);
        expect(result).toBe(FollowStauts.pending);
    });

    it("should return 'none' when no follow exists", async () => {
        const me = "me";
        const target = "target";
        repoMock.getAFollow.mockResolvedValue(null);
        
        const result = await service.getRelationshipStatus(me, target);
        expect(result).toBe("none");
    });
  });

});
