import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  pros: [{
    type: String,
    maxlength: 100
  }],
  cons: [{
    type: String,
    maxlength: 100
  }],
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'not-helpful']
    }
  }],
  reported: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Calculate average rating for a product
reviewSchema.statics.getProductRating = async function(productId: string) {
  const result = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), approved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingBreakdown: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result[0].ratingBreakdown.forEach((rating: number) => {
    breakdown[rating as keyof typeof breakdown]++;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    ratingBreakdown: breakdown
  };
};

// Prevent duplicate reviews from the same user for the same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review; 