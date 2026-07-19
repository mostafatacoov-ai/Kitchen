import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will be hashed
  role: { 
    type: String, 
    enum: ['Admin', 'Accounting', 'AccountManager', 'Sales'], 
    default: 'Sales' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
