import mongoose from 'mongoose';

const ManufacturingProjectSchema = new mongoose.Schema({
  kitchenName: { type: String, required: true },
  clientName: { type: String, required: true },
  phone: { type: String },
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
  assignedPersonnel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  startDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ManufacturingProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.ManufacturingProject || mongoose.model('ManufacturingProject', ManufacturingProjectSchema);
