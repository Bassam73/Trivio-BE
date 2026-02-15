import { Request, Response } from "express";
import catchError from "../../core/middlewares/catchError";
import UsersService from "./users.service";
import PostService from "../posts/posts.service";
import { updateProfileDTO } from "../../types/user.types";

const service = UsersService.getInstance();
export const followUser = catchError(async (req: Request, res: Response) => {
  let userID: string = req.params.id;
  let followerID: string = req.user?._id as string;
  const follow = await service.followUser(userID, followerID);
  res.status(201).json({ status: "success", data: { follow } });
});

export const unFollowUser = catchError(async (req: Request, res: Response) => {
  let userID: string = req.params.id;
  let followerID: string = req.user?._id as string;
  await service.unFollowUser(userID, followerID);
  res.status(204).send();
});

export const getFollowers = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const followers = await service.getFollowers(id, page, limit);
  res.status(200).json({ status: "success", data: { followers } });
});

export const getFollowing = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const following = await service.getFollowing(id, page, limit);
  res.status(200).json({ status: "success", data: { following } });
});

export const getRelationshipStatus = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?._id as string;
  const status = await service.getRelationshipStatus(id, currentUserId);
  res.status(200).json({ status: "success", data: { status } });
});

export const getMyFollowers = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const followers = await service.getFollowers(id, page, limit);
  res.status(200).json({ status: "success", data: { followers } });
});

export const getMyFollowing = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const following = await service.getFollowing(id, page, limit);
  res.status(200).json({ status: "success", data: { following } });
});

export const getMe = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  const user = await service.getMe(id);
  res.status(200).json({ status: "success", data: { user } });
});


export const getLikePostsID = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const likedPosts = await service.getLikedPosts(id, page, limit);
  res.status(200).json({ status: "success", data: { likedPosts } });
});

export const getLikedPosts = catchError(async (req: Request, res: Response) => {
  const { postIds } = req.body;
  const posts = await service.getBulkLikedPosts(postIds);
  res.status(200).json({ status: "success", data: { posts } });
});


export const getUserPosts = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  await service.getMe(id);
  const posts = await service.getUserPosts(id, page, limit);
  res.status(200).json({ status: "success", data: { posts } });

});

export const updateProfile = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  console.log(id);
  console.log(req.body);
  const data: updateProfileDTO = req.body || {};
  console.log(data);
  const files = req.files as { avatar?: Express.Multer.File[] };
  if (files?.avatar && files.avatar.length == 1) {
    data.avatar = `${process.env.BASE_URL || "http://localhost:3500"}/uploads/avatars/${files.avatar[0].filename}`;
  }
  const updatedUser = await service.updateProfile(id, data);
  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

export const togglePrivacy = catchError(async (req: Request, res: Response) => {
  const id = req.user?._id as string;
  await service.togglePrivacy(id);
  res.status(200).json({ status: "success" });
  

});
export const getSavedPosts = catchError(async (req: Request, res: Response) => {
  // to be implemented in the future
});
export const getFavTeams = catchError(async (req: Request, res: Response) => {
  // to be implemented in the future
});
export const getFavPlayers = catchError(async (req: Request, res: Response) => {
  // to be implemented in the future
});

export const updateFavTeams = catchError(async (req: Request, res: Response) => {
  // to be implemented in the future
});
export const updateFavPlayers = catchError(async (req: Request, res: Response) => {
  // to be implemented in the future
});



//2- update email in another route to handle the email verification process


//4- toggle privacy in another route to handle the privacy validation
// and the follow requests when changing from public to private


//5-  get liked posts --> wait for the reaction module to be implemented to return the post ids

//6-  get saved posts??
//15- block user??
//16- unblock user??
//17- get blocked users??


//18- get feed --> recommender system


//19- suggest users to follow 
