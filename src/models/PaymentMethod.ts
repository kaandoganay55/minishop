import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['credit-card', 'cash-on-delivery', 'bank-transfer', 'digital-wallet'],
    index: true
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  processingFeePercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAmount: {
    type: Number,
    default: null
  },
  supportedCards: [{
    type: String,
    enum: ['visa', 'mastercard', 'american-express', 'discover', 'troy']
  }],
  features: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  restrictions: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  processingTime: {
    type: String,
    default: 'Anında'
  },
  securityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'high'
  }
}, {
  timestamps: true
});

// Indexes
paymentMethodSchema.index({ type: 1, isActive: 1 });
paymentMethodSchema.index({ isPopular: -1 });

// Calculate processing fee for an order
paymentMethodSchema.methods.calculateFee = function(orderAmount: number) {
  if (!this.isActive) {
    return 0;
  }

  let fee = this.processingFee || 0;
  
  // Add percentage-based fee
  if (this.processingFeePercent && this.processingFeePercent > 0) {
    fee += (orderAmount * this.processingFeePercent) / 100;
  }

  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

// Check if payment method is available for amount
paymentMethodSchema.methods.isAvailableForAmount = function(amount: number) {
  if (!this.isActive) {
    return false;
  }

  if (this.minAmount && amount < this.minAmount) {
    return false;
  }

  if (this.maxAmount && amount > this.maxAmount) {
    return false;
  }

  return true;
};

// Static method to get available payment methods
paymentMethodSchema.statics.getAvailableForOrder = async function(orderAmount: number) {
  const methods = await this.find({ isActive: true }).sort({ isPopular: -1, name: 1 });
  
  return methods.filter((method: any) => method.isAvailableForAmount(orderAmount))
    .map((method: any) => ({
      _id: method._id,
      name: method.name,
      description: method.description,
      type: method.type,
      icon: method.icon,
      color: method.color,
      isPopular: method.isPopular,
      processingFee: method.calculateFee(orderAmount),
      features: method.features,
      restrictions: method.restrictions,
      processingTime: method.processingTime,
      securityLevel: method.securityLevel,
      supportedCards: method.supportedCards
    }));
};

const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod; 