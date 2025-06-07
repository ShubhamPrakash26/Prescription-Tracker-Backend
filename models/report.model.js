import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: String, required: true },
  type: { type: String, required: true },
  fileUrl: { type: String, required: true },
  date: { type: Date, required: true },
  tags: [String]
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
