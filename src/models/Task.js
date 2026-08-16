import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  relatedEntity: { type: String }, // Optional, e.g., 'CRMLead', 'Manufacturing'
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
