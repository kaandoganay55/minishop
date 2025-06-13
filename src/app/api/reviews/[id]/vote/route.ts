import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';

// POST /api/reviews/[id]/vote - Vote helpful or not helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { vote, userEmail } = body; // vote: 'helpful' | 'not-helpful'

    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email required' },
        { status: 401 }
      );
    }

    if (!['helpful', 'not-helpful'].includes(vote)) {
      return NextResponse.json(
        { message: 'Invalid vote type' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const review = await Review.findById(params.id);
    if (!review) {
      return NextResponse.json(
        { message: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVoteIndex = review.helpfulVotes.findIndex(
      (v: any) => v.user.toString() === user._id.toString()
    );

    if (existingVoteIndex > -1) {
      // User already voted, update their vote
      const existingVote = review.helpfulVotes[existingVoteIndex];
      
      // If same vote, remove it (toggle)
      if (existingVote.vote === vote) {
        review.helpfulVotes.splice(existingVoteIndex, 1);
        
        // Update counters
        if (vote === 'helpful') {
          review.helpful = Math.max(0, review.helpful - 1);
        } else {
          review.notHelpful = Math.max(0, review.notHelpful - 1);
        }
      } else {
        // Different vote, update it
        existingVote.vote = vote;
        
        // Update counters
        if (vote === 'helpful') {
          review.helpful += 1;
          review.notHelpful = Math.max(0, review.notHelpful - 1);
        } else {
          review.notHelpful += 1;
          review.helpful = Math.max(0, review.helpful - 1);
        }
      }
    } else {
      // New vote
      review.helpfulVotes.push({
        user: user._id,
        vote
      });

      // Update counters
      if (vote === 'helpful') {
        review.helpful += 1;
      } else {
        review.notHelpful += 1;
      }
    }

    await review.save();

    return NextResponse.json({
      message: 'Vote recorded',
      helpful: review.helpful,
      notHelpful: review.notHelpful
    });

  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { message: 'Error voting on review' },
      { status: 500 }
    );
  }
} 