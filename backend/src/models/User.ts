import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // You can add more fields here if needed, e.g., fullName, phoneNumber
  fullName: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User; 