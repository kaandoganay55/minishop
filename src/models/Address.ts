import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['shipping', 'billing', 'both'],
    default: 'both',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  company: {
    type: String,
    maxlength: 100,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9+\-\s\(\)]{10,15}$/, 'Invalid phone number'],
    trim: true
  },
  addressLine1: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  addressLine2: {
    type: String,
    maxlength: 200,
    trim: true
  },
  city: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  state: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    match: [/^[0-9]{5}$/, 'Invalid postal code (must be 5 digits)'],
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'Turkey',
    maxlength: 50,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
addressSchema.index({ user: 1, isDefault: -1 });
addressSchema.index({ user: 1, type: 1 });
addressSchema.index({ user: 1, isActive: 1 });

// Ensure only one default address per user per type
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default status from other addresses of the same user
    await mongoose.model('Address').updateMany(
      { 
        user: this.user, 
        _id: { $ne: this._id },
        $or: [
          { type: this.type },
          { type: 'both' },
          ...(this.type === 'both' ? [{ type: 'shipping' }, { type: 'billing' }] : [])
        ]
      },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for full name
addressSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
addressSchema.virtual('formattedAddress').get(function() {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.postalCode,
    this.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Include virtuals when converting to JSON
addressSchema.set('toJSON', { virtuals: true });
addressSchema.set('toObject', { virtuals: true });

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address; 