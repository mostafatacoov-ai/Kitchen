import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CRMLeadSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Meeting Scheduled', 'Qualified', 'Lost'], 
    default: 'New' 
  },
  source: { type: String, default: 'Website' },
  expectedValue: { type: Number, default: 0 },
  notes: { type: String },
  contractSigned: { type: Boolean, default: false },
  downPaymentConfirmed: { type: Boolean, default: false },
  comments: [CommentSchema], // Added comments array for Sales tracking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.CRMLead || mongoose.model('CRMLead', CRMLeadSchema);
