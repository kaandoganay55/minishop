import mongoose from 'mongoose';

const shippingMethodSchema = new mongoose.Schema({
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
    enum: ['standard', 'fast', 'express', 'same-day'],
    index: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedDays: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    }
  },
  // Regional pricing based on city/state
  regionalPricing: [{
    region: {
      type: String,
      required: true,
      trim: true
    },
    cities: [{
      type: String,
      trim: true
    }],
    priceMultiplier: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 5
    },
    additionalDays: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    }
  }],
  // Weight-based pricing
  weightRules: [{
    maxWeight: {
      type: Number,
      required: true,
      min: 0
    },
    additionalPrice: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
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
  // Business rules
  availableDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  cutoffTime: {
    type: String, // "14:00" format
    default: "15:00"
  },
  maxOrderValue: {
    type: Number,
    default: null
  },
  minOrderValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
shippingMethodSchema.index({ type: 1, isActive: 1 });
shippingMethodSchema.index({ basePrice: 1 });
shippingMethodSchema.index({ 'regionalPricing.region': 1 });

// Calculate shipping cost for a specific order
shippingMethodSchema.methods.calculateCost = function(orderValue: number, weight: number = 1, region: string = 'Istanbul') {
  if (!this.isActive) {
    throw new Error('Shipping method is not active');
  }

  // Check order value limits
  if (this.minOrderValue && orderValue < this.minOrderValue) {
    throw new Error(`Minimum order value is ${this.minOrderValue} TL`);
  }

  if (this.maxOrderValue && orderValue > this.maxOrderValue) {
    throw new Error(`Maximum order value is ${this.maxOrderValue} TL`);
  }

  // Check free shipping threshold
  if (this.freeShippingThreshold > 0 && orderValue >= this.freeShippingThreshold) {
    return 0;
  }

  let cost = this.basePrice;

  // Apply regional pricing
  const regionalRule = this.regionalPricing.find((rule: any) => 
    rule.region.toLowerCase() === region.toLowerCase() ||
    rule.cities.some((city: any) => city.toLowerCase() === region.toLowerCase())
  );

  if (regionalRule) {
    cost *= regionalRule.priceMultiplier;
  }

  // Apply weight-based pricing
  const weightRule = this.weightRules
    .sort((a: any, b: any) => a.maxWeight - b.maxWeight)
    .find((rule: any) => weight <= rule.maxWeight);

  if (weightRule) {
    cost += weightRule.additionalPrice;
  }

  return Math.round(cost * 100) / 100; // Round to 2 decimal places
};

// Calculate estimated delivery date
shippingMethodSchema.methods.getEstimatedDelivery = function(region: string = 'Istanbul') {
  const today = new Date();
  let estimatedDays = this.estimatedDays.max;

  // Apply regional additional days
  const regionalRule = this.regionalPricing.find((rule: any) => 
    rule.region.toLowerCase() === region.toLowerCase() ||
    rule.cities.some((city: any) => city.toLowerCase() === region.toLowerCase())
  );

  if (regionalRule) {
    estimatedDays += regionalRule.additionalDays;
  }

  // Check cutoff time for today
  const now = new Date();
  const cutoff = new Date();
  const [hours, minutes] = this.cutoffTime.split(':');
  cutoff.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // If past cutoff time or weekend, start counting from next business day
  if (now > cutoff || this.availableDays.length > 0) {
    estimatedDays += 1;
  }

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + estimatedDays);

  return {
    date: deliveryDate,
    formatted: deliveryDate.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    businessDays: estimatedDays
  };
};

// Static method to get available shipping methods for an order
shippingMethodSchema.statics.getAvailableForOrder = async function(orderValue: number, weight: number = 1, region: string = 'Istanbul') {
  const methods = await this.find({ isActive: true }).sort({ basePrice: 1 });
  
  return methods.map((method: any) => {
    try {
      const cost = method.calculateCost(orderValue, weight, region);
      const delivery = method.getEstimatedDelivery(region);
      
      return {
        _id: method._id,
        name: method.name,
        description: method.description,
        type: method.type,
        cost,
        originalPrice: method.basePrice,
        isFree: cost === 0,
        estimatedDelivery: delivery,
        icon: method.icon,
        color: method.color,
        isPopular: method.isPopular,
        features: method.features,
        savings: cost === 0 ? method.basePrice : 0
      };
    } catch (error) {
      return null; // Method not available for this order
    }
  }).filter(Boolean);
};

const ShippingMethod = mongoose.models.ShippingMethod || mongoose.model('ShippingMethod', shippingMethodSchema);

export default ShippingMethod; 