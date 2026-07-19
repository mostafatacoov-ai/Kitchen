import mongoose from 'mongoose';

const StageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  deadline: { type: Date },
  completedAt: { type: Date },
  notes: { type: String }, // For missing items, comments, etc.
  costIncurred: { type: Number, default: 0 }
});

const ManufacturingProjectSchema = new mongoose.Schema({
  kitchenName: { type: String, required: true },
  clientName: { type: String, required: true },
  phone: { type: String },
  linkedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Link to public Project or CRM
  woodenType: { type: String }, // e.g., MDF, Solid Wood
  accessories: { type: String }, // e.g., Hinges, handles
  totalCost: { type: Number, default: 0 },
  stage: { 
    type: String, 
    enum: [
      'Measurement', // رفع مقاسات
      'Design',      // تصميم
      'Contract',    // تعاقد
      'Cutting',     // تقطيع
      'Assembling',  // تجميع
      'Finishing',   // تشطيب/دهان
      'Delivery',    // توصيل
      'Installation' // تركيب
    ], 
    default: 'Measurement' 
  },
  stagesData: [StageSchema], // Detailed tracking for each stage
  assignedPersonnel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.ManufacturingProject || mongoose.model('ManufacturingProject', ManufacturingProjectSchema);
