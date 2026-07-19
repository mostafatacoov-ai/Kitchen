import mongoose from 'mongoose';

const FinancialRecordSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Income', 'Expense'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Project Revenue', 'Material Cost', 'Labor Cost', 'Overhead', 'Other'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProject', required: false },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.FinancialRecord || mongoose.model('FinancialRecord', FinancialRecordSchema);
