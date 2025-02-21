import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    email: { type: String, required: true, unique: true },
    occupation: { type: String },
    contact: {
      type: String,
      required: true,
      match: /^\(\d{3}\) \d{3}-\d{4}$/, // Regex for (xxx) xxx-xxxx format
      unique: true
    },
  },
  { timestamps: true }
);

export const Business = mongoose.model('Business', businessSchema);
