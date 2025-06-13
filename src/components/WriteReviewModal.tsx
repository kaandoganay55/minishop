'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import StarRating from './StarRating';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onReviewAdded: () => void;
}

const WriteReviewModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewAdded
}: WriteReviewModalProps) => {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
    images: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      alert('Please login to write a review');
      return;
    }

    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!formData.title.trim() || !formData.comment.trim()) {
      alert('Please fill in title and comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          title: formData.title.trim(),
          comment: formData.comment.trim(),
          pros: formData.pros.filter(pro => pro.trim()),
          cons: formData.cons.filter(con => con.trim()),
          images: formData.images.filter(img => img.trim()),
          userEmail: session.user.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Review submitted successfully!');
        onReviewAdded();
        onClose();
        setFormData({
          rating: 0,
          title: '',
          comment: '',
          pros: [''],
          cons: [''],
          images: ['']
        });
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      alert('An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProsCons = (type: 'pros' | 'cons') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removeProsCons = (type: 'pros' | 'cons', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updateProsCons = (type: 'pros' | 'cons', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
              <p className="text-gray-600 mt-1">{productName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size="lg"
                showLabel
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Tell others about your experience with this product..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/1000</p>
            </div>

            {/* Pros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What did you like? (Optional)
              </label>
              {formData.pros.map((pro, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => updateProsCons('pros', index, e.target.value)}
                    placeholder="Something you liked..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={100}
                  />
                  {formData.pros.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProsCons('pros', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addProsCons('pros')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                + Add another pro
              </button>
            </div>

            {/* Cons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What could be improved? (Optional)
              </label>
              {formData.cons.map((con, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateProsCons('cons', index, e.target.value)}
                    placeholder="Something that could be better..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    maxLength={100}
                  />
                  {formData.cons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProsCons('cons', index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addProsCons('cons')}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                + Add another con
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formData.rating === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal; 