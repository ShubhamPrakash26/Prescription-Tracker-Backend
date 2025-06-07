import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberId: { type: String, default: null },
  title: { type: String, required: true },
  category: String,
  tags: [String],
  doctor: String,
  description: String,
  date: { type: Date, required: true },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
