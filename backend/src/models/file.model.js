import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    originalName: String,
    fileName: String,
    carrier: String,
    product: String,
    processedAt: Date,
    pageCount: Number,
  },
  { timestamps: true }
);

export default File = mongoose.model("File", FileSchema);
