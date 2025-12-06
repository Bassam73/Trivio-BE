"use strict";
// import nodeCron from "node-cron";
// import likeModel from "../../database/models/like.model";
// import postModel from "../../database/models/post.model";
// import commentModel from "../../database/models/comment.model";
Object.defineProperty(exports, "__esModule", { value: true });
// nodeCron.schedule("*/5 * * * *", async () => {
//     console.log("Recalculating like counts...");
//     const postReactions = await likeModel.aggregate([
//         { $match: { postId: { $exists: true } } },
//         {
//             $group: {
//                 _id: { postId: "$postId", type: "$react_type" },
//                 count: { $sum: 1 }
//             }
//         }
//     ]);
//     const commentReactions = await likeModel.aggregate([
//         { $match: { commentId: { $exists: true } } },
//         {
//             $group: {
//                 _id: { commentId: "$commentId", type: "$react_type" },
//                 count: { $sum: 1 }
//             }
//         }
//     ]);
//     await postModel.updateMany({}, { $set: { reactionCounts: {} } });
//     await commentModel.updateMany({}, { $set: { reactionCounts: {} } });
//     for (const item of postReactions) {
//         await postModel.updateOne(
//             { _id: item._id.postId },
//             { $inc: { [`reactionCounts.${item._id.type}`]: item.count } }
//         );
//     }
//     for (const item of commentReactions) {
//         await commentModel.updateOne(
//             { _id: item._id.commentId },
//             { $inc: { [`reactionCounts.${item._id.type}`]: item.count } }
//         );
//     }
//     console.log("Reaction counts updated.");
// });
