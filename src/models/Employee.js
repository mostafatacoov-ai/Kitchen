import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Designer', 'Carpenter', 'Driver', 'Accountant', 'Manager', 'Other'], 
    required: true 
  },
  phone: { type: String },
  salary: { type: Number, default: 0 },
  hireDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

EmployeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
