import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  desc: {
    en: { type: String },
    ar: { type: String }
  },
  category: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
