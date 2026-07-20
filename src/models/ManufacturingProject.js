import mongoose from 'mongoose';

const StageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Pending Approval', 'Completed'], default: 'Pending' },
  deadline: { type: Date },
  completedAt: { type: Date },
  notes: { type: String }, // For missing items, comments, etc.
  costIncurred: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['None', 'Pending Approval', 'Approved', 'Rejected'], default: 'None' },
  approvedBy: { type: String },
  approvalRoleRequired: { type: String, enum: ['Admin', 'Accounting', 'Purchasing', 'AccountManager', 'None'], default: 'None' }
});

const ManufacturingProjectSchema = new mongoose.Schema({
  kitchenName: { type: String, required: true },
  clientName: { type: String, required: true },
  phone: { type: String },
  linkedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Link to public Project or CRM
  woodenBulks: [{
    bulkType: { type: String }, // e.g., MDF, etc.
    numberOfBoards: { type: Number },
    color: { type: String, enum: ['white', 'wooden', 'laminated'] },
    purpose: { type: String, enum: ['ضلفة', 'جسم', 'ضهر'] }
  }],
  accessories: {
    hinges: [{
      hingeType: { type: String, enum: ['عدلة', 'نص ركبة', 'ركبة', 'عقربة', 'مشتركه', 'بلايند كورنر'] },
      brand: { type: String, enum: ['بلومو', 'تاتيوس', 'اندكس'] },
      quantity: { type: Number, default: 0 },
      cost: { type: Number, default: 0 }
    }],
    drawerRunners: [{
      mountType: { type: String, enum: ['سفلية', 'جانبية'] },
      size: { type: String, enum: ['35', '40', '45', '50'] },
      brand: { type: String, enum: ['بلوم', 'تاتيوس', 'اراي', 'هيتش', 'ساميت', 'اندكس'] },
      quantity: { type: Number, default: 0 },
      cost: { type: Number, default: 0 }
    }],
    skirting: { type: Boolean, default: false }
  },
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
