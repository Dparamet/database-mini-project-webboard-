import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  email:    { type: String, unique: true, required: true, trim: true },
  passHash: { type: String, required: true },
  displayName: { type: String, trim: true },
  bio: { type: String, default: "" },
  social: { type: String, default: "" },
  role: { type: String, enum: ["user","admin"], default: "user" },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("User", userSchema);