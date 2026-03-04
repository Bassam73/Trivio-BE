"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bootstrap;
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const posts_routes_1 = __importDefault(require("./posts/posts.routes"));
const groups_routes_1 = __importDefault(require("./groups/groups.routes"));
const comments_routes_1 = __importDefault(require("./comments/comments.routes"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
const follow_routes_1 = __importDefault(require("./follow/follow.routes"));
function bootstrap(app) {
    app.get("/", (req, res) => {
        res.status(200).json({ message: "Hello World" });
    });
    app.use("/api/v1/auth", auth_routes_1.default);
    app.use("/api/v1/posts", posts_routes_1.default);
    app.use("/api/v1/groups", groups_routes_1.default);
    app.use("/api/v1/comments", comments_routes_1.default);
    app.use("/api/v1/users", users_routes_1.default);
    app.use("/api/v1/follow-requests", follow_routes_1.default);
}
