import { connect } from "mongoose";

export default async function connectToDatabase(DB_URI: string) {
  if (!DB_URI) throw new Error("NO DB URI FOUND");

  try {
    await connect(DB_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
}
