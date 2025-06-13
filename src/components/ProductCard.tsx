'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import StarRating from './StarRating';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock?: number;
  rating?: number;
  originalPrice?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToWishlist }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      addItem({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stock: product.stock
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product._id);
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-1">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          %{discountPercentage} İndirim
        </div>
      )}

      {/* Stock Status */}
      {isOutOfStock && (
        <div className="absolute top-3 right-3 z-10 bg-gray-900 text-white px-2 py-1 rounded-full text-xs font-medium">
          Stokta Yok
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all duration-300 group/wishlist"
      >
        <svg
          className={`w-4 h-4 transition-all duration-300 ${
            isWishlisted 
              ? 'text-red-500 fill-current scale-110' 
              : 'text-gray-400 group-hover/wishlist:text-red-400 group-hover/wishlist:scale-110'
          }`}
          fill="none"
          strokeWidth="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-700 group-hover:scale-110 ${
            isOutOfStock ? 'grayscale opacity-70' : ''
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            href={`/product/${product._id}`}
            className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100"
          >
            Hızlı Görünüm
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {product.category}
          </span>
          {/* Rating */}
          {product.rating && (
            <StarRating 
              rating={product.rating} 
              size="sm" 
              readonly 
              showCount 
              count={Math.floor(Math.random() * 100) + 10} // Mock review count
            />
          )}
        </div>

        {/* Product Name */}
        <Link href={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-300 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {product.price.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY'
              })}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY'
                })}
              </span>
            )}
          </div>

          {/* Stock Info */}
          {product.stock !== undefined && (
            <div className="text-xs text-gray-500">
              {product.stock > 0 ? (
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Stokta {product.stock} adet</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-red-500">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Stokta yok</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-indigo-400 text-white cursor-wait'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Ekleniyor...</span>
              </div>
            ) : isOutOfStock ? (
              'Stokta Yok'
            ) : (
              'Sepete Ekle'
            )}
          </button>
          
          <Link
            href={`/product/${product._id}`}
            className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 