import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const preferencesSchema = new mongoose.Schema({
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  language: { type: String, default: 'English (UK)' },
  currency: { type: String, default: 'GBP' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  nationality: String,
  preferences: { type: preferencesSchema, default: () => ({}) },
  addresses: [addressSchema],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
