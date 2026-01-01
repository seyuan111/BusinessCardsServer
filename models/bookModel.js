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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    name: { type: String, required: true },

    address: {
      type: String,
      validate: {
        validator: (v) => !v || v.split('\n').filter(Boolean).length <= 3,
        message: 'Address must be 3 lines or fewer.',
      },
    },

    email: { type: String, required: true },

    occupation: { type: String },

    contact: {
      type: String,
      required: true,
      match: /^\(\d{3}\) \d{3}-\d{4}$/, // (xxx) xxx-xxxx
    },

    fax: {
      type: String,
      match: /^\(\d{3}\) \d{3}-\d{4}$/, // (xxx) xxx-xxxx
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

// Ensure contact details are unique per user while allowing different users to reuse them
businessSchema.index({ user: 1, email: 1 }, { unique: true });
businessSchema.index({ user: 1, contact: 1 }, { unique: true });
businessSchema.index(
  { user: 1, fax: 1 },
  {
    unique: true,
    partialFilterExpression: { fax: { $exists: true, $nin: [null, ''] } },
  }
);

export const Business = mongoose.model('Business', businessSchema);

