import { Document, Query } from "mongoose";

interface SearchQuery {
  page?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any;
}

export default class ApiFeatures<T> {
  private mongooseQuery: Query<T[], T>;
  private searchQuery: SearchQuery;
  public pageNumber: number;

  constructor(mongooseQuery: Query<T[], T>, searchQuery: SearchQuery) {
    this.mongooseQuery = mongooseQuery;
    this.searchQuery = searchQuery;
    this.pageNumber = 1;
  }

  pagination(limit = 2): this {
    const PAGE_LIMIT = limit;
    const page = Math.max(Number(this.searchQuery.page) || 1, 1);
    const skipNo = (page - 1) * PAGE_LIMIT;

    this.mongooseQuery = this.mongooseQuery.limit(PAGE_LIMIT).skip(skipNo);
    this.pageNumber = page;

    return this;
  }

  filter(): this {
    let findObj = { ...this.searchQuery };
    const excludedFields = ["page", "sort", "keyword", "fields"];
    excludedFields.forEach((field) => delete findObj[field]);

    let queryStr = JSON.stringify(findObj);
    queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort(): this {
    if (this.searchQuery.sort) {
      const sortBy = this.searchQuery.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    }
    return this;
  }

  fields(): this {
    if (this.searchQuery.fields) {
      const fieldsBy = this.searchQuery.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fieldsBy);
    }
    return this;
  }

  search(field: string = "title"): this {
    if (this.searchQuery.keyword) {
      this.mongooseQuery = this.mongooseQuery.find({
        [field]: { $regex: this.searchQuery.keyword, $options: "i" },
      });
    }
    return this;
  }

  getQuery(): Query<T[], T> {
    return this.mongooseQuery;
  }

  getPageNumber(): number {
    return this.pageNumber;
  }
}
