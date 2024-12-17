import mongoose from "mongoose";

const memoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "create_time",
      updatedAt: "update_time",
    },
  }
);

export const MemoModel = mongoose.model("Memo", memoSchema);
