import mongoose from "mongoose";
const replySchema = new mongoose.Schema({
  thread:  { type: mongoose.Schema.Types.ObjectId, ref: "Thread", required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  body:    { type: String, required: true },
  createdAt:{ type: Date, default: Date.now },
  updatedAt:{ type: Date }
});
export default mongoose.model("Reply", replySchema);