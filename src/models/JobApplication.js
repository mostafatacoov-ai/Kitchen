import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  portfolioLink: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
