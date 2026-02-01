export default class CommentsRepository {
  private static instance: CommentsRepository;

  static getInstance() {
    if (!CommentsRepository.instance) {
      CommentsRepository.instance = new CommentsRepository();
    }
    return CommentsRepository.instance;
  }
}
