import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // cents
  compareAt: Number, // cents
  category: { type: String, required: true },
  university: { type: String, default: '' },
  gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
  images: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  colors: { type: [colorSchema], default: [] },
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  rating: Number,
  reviewCount: { type: Number, default: 0 },
  badge: String,
  countdownEnd: Date,
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
