import mongoose from 'mongoose';

const isWebsite = (value = '') => {
  const v = String(value).trim();
  if (!v) return true; // optional

  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withProtocol);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
};

const normalizeWebsite = (value = '') => {
  const v = String(value).trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    address: {
      type: String,
      validate: {
        validator: (v) => !v || v.split('\n').filter(Boolean).length <= 3,
        message: 'Address must be 3 lines or fewer.',
      },
    },

    email: { type: String, required: true, unique: true },

    occupation: { type: String },

    contact: {
      type: String,
      required: true,
      match: /^\(\d{3}\) \d{3}-\d{4}$/, // (xxx) xxx-xxxx
      unique: true,
    },

    fax: {
      type: String,
      match: /^\(\d{3}\) \d{3}-\d{4}$/, // (xxx) xxx-xxxx
      unique: true,
      sparse: true, // allow multiple docs without fax
    },

    website: {
      type: String,
      default: '',
      validate: {
        validator: isWebsite,
        message: 'Website must be a valid URL (e.g., nike.com or https://nike.com).',
      },
      set: normalizeWebsite,
      // If you want websites to be unique too, uncomment:
      // unique: true,
      // sparse: true,  // allows multiple empty strings
    },
  },
  { timestamps: true }
);

export const Business = mongoose.model('Business', businessSchema);

