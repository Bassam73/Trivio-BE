"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbConnection;
const mongoose_1 = __importDefault(require("mongoose"));
async function dbConnection() {
    const dbUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trivio";
    console.log(dbUri);
    try {
        await mongoose_1.default.connect(dbUri).then(() => {
            console.log("Database Connected Successfully");
        });
    }
    catch (err) {
        if (err instanceof Error) {
            console.log("Database Error : ", err.message);
        }
        else {
            console.log("Database Error : ", err);
        }
    }
}
