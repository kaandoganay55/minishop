import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';
import Product from '@/models/Product';

// GET /api/reviews - Get reviews with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { approved: true };
    
    if (productId) {
      query.product = productId;
    }
    
    if (userId) {
      query.user = userId;
    }
    
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        query.rating = ratingNum;
      }
    }

    // Build sort
    const sortOptions: any = {};
    
    switch (sort) {
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'highest-rating':
        sortOptions.rating = -1;
        break;
      case 'lowest-rating':
        sortOptions.rating = 1;
        break;
      case 'most-helpful':
        sortOptions.helpful = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Get reviews with populated user data
    const reviews = await Review.find(query)
      .populate('user', 'name image')
      .populate('product', 'name images')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Review.countDocuments(query);
    
    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Error fetching reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { productId, rating, title, comment, pros = [], cons = [], images = [], userEmail } = body;

    // Simple validation - in production you'd want proper auth
    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email required' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!productId || !rating || !title || !comment) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: user._id,
      product: productId
    });

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const review = new Review({
      user: user._id,
      product: productId,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      pros: pros.map((pro: string) => pro.trim()).filter(Boolean),
      cons: cons.map((con: string) => con.trim()).filter(Boolean),
      images: images.filter((img: string) => img.trim()),
      verified: false
    });

    await review.save();

    // Calculate and update product rating manually
    const allReviews = await Review.find({ product: productId, approved: true });
    const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10,
      numReviews: allReviews.length
    });

    // Populate user data for response
    await review.populate('user', 'name image');

    return NextResponse.json({
      message: 'Review created successfully',
      review
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { message: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error creating review' },
      { status: 500 }
    );
  }
} 