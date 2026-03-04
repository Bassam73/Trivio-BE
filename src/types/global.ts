import { IUser } from "./user.types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface PaginationResult<T> {
  data: T[];
  page: number;
}

export interface FilterJobData {
  id: string;
  caption: string;
  filterType: FilterType;
}

export enum FilterType {
  post = "post",
  comment = "comment",
}
