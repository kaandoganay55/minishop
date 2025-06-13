'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StarRating from './StarRating';
import WriteReviewModal from './WriteReviewModal';

interface Review {
  _id: string;
  user: {
    name: string;
    image?: string;
  };
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  helpfulVotes: Array<{
    user: string;
    vote: 'helpful' | 'not-helpful';
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsListProps {
  productId: string;
  productName: string;
}

const ReviewsList = ({ productId, productName }: ReviewsListProps) => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        productId,
        sort: sortBy,
        ...(filterRating !== 'all' && { rating: filterRating })
      });

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        calculateRatingStats(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setRatingStats({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewsData.length;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      breakdown[review.rating as keyof typeof breakdown]++;
    });

    setRatingStats({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewsData.length,
      ratingBreakdown: breakdown
    });
  };

  const handleVote = async (reviewId: string, vote: 'helpful' | 'not-helpful') => {
    if (!session?.user?.email) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vote,
          userEmail: session.user.email
        }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getUserVote = (review: Review) => {
    if (!session?.user?.id) return null;
    const userVote = review.helpfulVotes.find(v => v.user === session.user.id);
    return userVote?.vote || null;
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterRating]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {ratingStats.averageRating}
            </div>
            <StarRating 
              rating={ratingStats.averageRating} 
              size="lg" 
              readonly 
              showCount 
              count={ratingStats.totalReviews}
            />
            <p className="text-gray-600 mt-2">
              Based on {ratingStats.totalReviews} reviews
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingStats.ratingBreakdown[star as keyof typeof ratingStats.ratingBreakdown];
              const percentage = ratingStats.totalReviews > 0 
                ? (count / ratingStats.totalReviews) * 100 
                : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-2">{star}</span>
                  <StarIcon className="h-3 w-3 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button & Filters */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowWriteModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all"
        >
          Write a Review
        </button>

        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest-rating">Highest Rating</option>
            <option value="lowest-rating">Lowest Rating</option>
            <option value="most-helpful">Most Helpful</option>
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">Be the first to share your thoughts about this product!</p>
          <button
            onClick={() => setShowWriteModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
          >
            Write the First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const userVote = getUserVote(review);
            
            return (
              <div key={review._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    {/* User Info & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="sm" readonly />
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>

                    {/* Review Content */}
                    <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                    {/* Pros & Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros.length > 0 && (
                          <div>
                            <h6 className="font-medium text-green-800 mb-2 flex items-center gap-1">
                              <span className="text-green-600">👍</span> Pros
                            </h6>
                            <ul className="space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons.length > 0 && (
                          <div>
                            <h6 className="font-medium text-red-800 mb-2 flex items-center gap-1">
                              <span className="text-red-600">👎</span> Cons
                            </h6>
                            <ul className="space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Helpful Votes */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Was this helpful?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(review._id, 'helpful')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            userVote === 'helpful'
                              ? 'bg-green-100 text-green-800'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          👍 Yes ({review.helpful})
                        </button>
                        <button
                          onClick={() => handleVote(review._id, 'not-helpful')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            userVote === 'not-helpful'
                              ? 'bg-red-100 text-red-800'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          👎 No ({review.notHelpful})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        productId={productId}
        productName={productName}
        onReviewAdded={fetchReviews}
      />
    </div>
  );
};

// Simple star icon component
const StarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default ReviewsList; 