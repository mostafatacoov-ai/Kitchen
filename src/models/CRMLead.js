import mongoose from 'mongoose';

const CRMLeadSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Meeting Scheduled', 'Qualified', 'Lost'], 
    default: 'New' 
  },
  source: { type: String, default: 'Website' },
  notes: { type: String },
  expectedValue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CRMLeadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.CRMLead || mongoose.model('CRMLead', CRMLeadSchema);
