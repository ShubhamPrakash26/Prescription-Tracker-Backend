import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  relationship: { type: String, required: true },
  memberId: { type: String, required: true, unique: true }
}, { timestamps: true });

const Member = mongoose.model("Member", memberSchema);
export default Member;
