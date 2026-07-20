import mongoose from 'mongoose';

const PurchaseOrderSchema = new mongoose.Schema({
  jobOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProject', required: true },
  kitchenName: { type: String },
  clientName: { type: String },
  status: { type: String, enum: ['Pending', 'Ordered', 'Received'], default: 'Pending' },
  materials: {
    woodenBulks: { type: Array, default: [] },
    accessories: { type: Object, default: {} }
  },
  totalCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);
