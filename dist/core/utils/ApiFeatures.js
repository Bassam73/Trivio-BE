"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiFeatures {
    constructor(mongooseQuery, searchQuery) {
        this.mongooseQuery = mongooseQuery;
        this.searchQuery = searchQuery;
        this.pageNumber = 1;
    }
    pagination(limit = 2) {
        const PAGE_LIMIT = limit;
        const page = Math.max(Number(this.searchQuery.page) || 1, 1);
        const skipNo = (page - 1) * PAGE_LIMIT;
        this.mongooseQuery = this.mongooseQuery.limit(PAGE_LIMIT).skip(skipNo);
        this.pageNumber = page;
        return this;
    }
    filter() {
        let findObj = { ...this.searchQuery };
        const excludedFields = ["page", "sort", "keyword", "fields"];
        excludedFields.forEach((field) => delete findObj[field]);
        let queryStr = JSON.stringify(findObj);
        queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);
        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.searchQuery.sort) {
            const sortBy = this.searchQuery.sort.split(",").join(" ");
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        }
        return this;
    }
    fields() {
        if (this.searchQuery.fields) {
            const fieldsBy = this.searchQuery.fields.split(",").join(" ");
            this.mongooseQuery = this.mongooseQuery.select(fieldsBy);
        }
        return this;
    }
    search(field = "title") {
        if (this.searchQuery.keyword) {
            this.mongooseQuery = this.mongooseQuery.find({
                [field]: { $regex: this.searchQuery.keyword, $options: "i" },
            });
        }
        return this;
    }
    getQuery() {
        return this.mongooseQuery;
    }
    getPageNumber() {
        return this.pageNumber;
    }
}
exports.default = ApiFeatures;
