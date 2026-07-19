import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  area: { type: String, required: true },
  style: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
