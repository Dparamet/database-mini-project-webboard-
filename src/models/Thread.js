import mongoose from "mongoose";
const threadSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:    { type: String, required: true, trim: true, maxLength: 200 },
  body:     { type: String, required: true },
  views:    { type: Number, default: 0 },
  tags:     [{ type: String, trim: true }],
  createdAt:{ type: Date, default: Date.now },
  updatedAt:{ type: Date }
});
export default mongoose.model("Thread", threadSchema);