import AppError from "../../core/utils/AppError";
import {
  createNotificationDTO,
  EntityType,
} from "../../types/notification.types";
import CommentsService from "../comments/comments.service";
import FollowService from "../follow/follow.service";
import PostService from "../posts/posts.service";
import ReactsService from "../reacts/reacts.service";
import NotificationRepository from "./notification.repo";

export default class NotificationService {
  public static instance: NotificationService;
  public repo: NotificationRepository;
  constructor(repo: NotificationRepository) {
    this.repo = repo;
  }
  async createNotificaiton(data: createNotificationDTO) {
    let entity: any;
    switch (data.entityType) {
      case EntityType.POST:
        entity = PostService.getInstace().getPostbyId(data.entityID.toString());
        break;
      case EntityType.COMMENT:
        entity = CommentsService.getInstance().getCommentByID(
          data.entityID.toString(),
        );
        break;
      case EntityType.FOLLOW:
        entity = FollowService.getInstance().getFollowByID(
          data.entityID.toString(),
        );
        break;
      case EntityType.REACT:
        entity = ReactsService.getInstance().getReactionById(
          data.entityID.toString(),
        );
        break;
    }
    if (!entity)
      throw new AppError("Entity Not Found Please Check EntityID", 404);
    return await this.repo.createNotification(data);
  }

  async getUnreadNotifications(userId: string) {
    return await this.repo.getUnreadNotifications(userId);
  }

  public static getInstance() {
    if (!NotificationService.instance) {
      const repo = NotificationRepository.getInstnce();
      NotificationService.instance = new NotificationService(repo);
    }
    return NotificationService.instance;
  }
}

