import mongoose from "mongoose";

export default async function dbConnection() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/trivio").then(() => {
      console.log("Database Connected Successfully");
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log("Database Error : ", err.message);
    } else {
      console.log("Database Error : ", err);
    }
  }
}
