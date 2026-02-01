import CommentsRepository from "./comments.repo";

export default class CommentsService {
  private static instance: CommentsService;
  private repo: CommentsRepository;
  constructor(repo: CommentsRepository) {
    this.repo = repo;
  }
  static getInstance() {
    if (!CommentsService.instance) {
      CommentsService.instance = new CommentsService(
        CommentsRepository.getInstance()
      );
    }
    return CommentsService.instance;
  }
}
