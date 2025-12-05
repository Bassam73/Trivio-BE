// check likes count every 5 minutes
import nodeCron from "node-cron";
import likeModel from "../../database/models/like.model";
import userModel from "../../database/models/user.model";
// const cron = nodeCron.schedule("*/5 * * * *", async () => {
//     const users = await userModel.find({}).exec();
//     for (const user of users) {
//         const likes = await likeModel.find({ user: user._id }).exec();
//         user.likes = likes.length;
//         await user.save();
//     }
// })
