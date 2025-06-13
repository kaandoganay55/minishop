'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

interface ShippingMethod {
  _id: string;
  name: string;
  description: string;
  type: string;
  cost: number;
  originalPrice: number;
  isFree: boolean;
  savings: number;
  estimatedDelivery: {
    date: Date;
    formatted: string;
    businessDays: number;
  };
  icon: string;
  color: string;
  isPopular?: boolean;
  features: string[];
}

interface ShippingOptionsProps {
  orderValue: number;
  selectedAddress?: any;
  onShippingSelect: (method: ShippingMethod) => void;
  selectedShipping?: string;
}

export default function ShippingOptions({ 
  orderValue, 
  selectedAddress, 
  onShippingSelect,
  selectedShipping 
}: ShippingOptionsProps) {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { items } = useCart();

  // Calculate total weight (assuming 1kg per item for demo)
  const totalWeight = items.reduce((total: number, item: any) => total + item.quantity, 0);

  useEffect(() => {
    fetchShippingMethods();
  }, [orderValue, selectedAddress]);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const region = selectedAddress?.city || 'Istanbul';
      
      const response = await fetch(
        `/api/shipping?orderValue=${orderValue}&weight=${totalWeight}&region=${encodeURIComponent(region)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }

      const data = await response.json();
      setShippingMethods(data.methods || []);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setError('Teslimat seçenekleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: ShippingMethod) => {
    onShippingSelect(method);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Teslimat seçenekleri yükleniyor...</span>
        </div>
        
        {/* Loading skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 rounded-xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchShippingMethods}
          className="mt-3 text-red-600 hover:text-red-800 font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (shippingMethods.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Teslimat Seçeneği Bulunamadı
        </h3>
        <p className="text-gray-600">
          Bu adres ve sipariş tutarı için uygun teslimat seçeneği bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Teslimat Seçenekleri
        </h3>
        <span className="text-sm text-gray-500">
          {shippingMethods.length} seçenek mevcut
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {shippingMethods.map((method, index) => (
            <motion.div
              key={method._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedShipping === method._id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              {/* Popular badge */}
              {method.isPopular && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Popüler
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: method.color }}
                  >
                    {method.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {method.name}
                      </h4>
                      
                      {/* Price */}
                      <div className="text-right">
                        {method.isFree ? (
                          <div className="space-y-1">
                            <span className="text-lg font-bold text-green-600">
                              ÜCRETSİZ
                            </span>
                            {method.savings > 0 && (
                              <div className="text-xs text-gray-500 line-through">
                                {method.originalPrice.toFixed(2)} TL
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {method.cost.toFixed(2)} TL
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {method.description}
                    </p>

                    {/* Delivery estimate */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        📅 Tahmini Teslimat:
                      </span>
                      <span className="text-sm text-indigo-600 font-medium">
                        {method.estimatedDelivery.formatted}
                      </span>
                    </div>

                    {/* Features */}
                    {method.features && method.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {method.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Savings indicator */}
                    {method.savings > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          💰 {method.savings.toFixed(2)} TL tasarruf
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      selectedShipping === method._id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedShipping === method._id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected overlay effect */}
              {selectedShipping === method._id && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {selectedShipping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Seçilen Teslimat Yöntemi:
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {shippingMethods.find(m => m._id === selectedShipping)?.name}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
} 