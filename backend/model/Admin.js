import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false, // Optional for existing admins, required for new employees
  },
  role: {
    type: String,
    enum: ['superadmin', 'employee'],
    default: 'superadmin',
  },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
