import AuthRepository from "../../modules/auth/auth.repo";
import { IUser } from "../../types/user.types";

export default async function getMentionedUsers(
  caption: string,
  userRepo: AuthRepository = AuthRepository.getInstance()
): Promise<IUser[] | null> {
  const matchedUsernames: string[] | null = caption.match(
    /@[a-zA-Z0-9_]+(?=\s|$)/g
  );
  if (!matchedUsernames) return null;

  const usernames = matchedUsernames.map((u) => u.substring(1));
  const mentions = await userRepo.getMentionedUsers(usernames);
  return mentions;
}
