'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethod {
  _id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  color: string;
  isPopular?: boolean;
  processingFee: number;
  features: string[];
  restrictions?: string[];
  processingTime: string;
  securityLevel: string;
  supportedCards?: string[];
}

interface PaymentOptionsProps {
  orderAmount: number;
  onPaymentSelect: (method: PaymentMethod, paymentData?: any) => void;
  selectedPayment?: string;
}

export default function PaymentOptions({ 
  orderAmount, 
  onPaymentSelect, 
  selectedPayment 
}: PaymentOptionsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Credit Card Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    fetchPaymentMethods();
  }, [orderAmount]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      
      // Temporarily bypass API and use hardcoded methods for demo
      const fallbackMethods = [
        {
          _id: 'credit-card-1',
          name: 'Kredi/Banka Kartı',
          description: 'Visa, Mastercard, Troy kartlarınız ile güvenli ödeme. 3D Secure korumalı.',
          type: 'credit-card',
          icon: '💳',
          color: '#3b82f6',
          isPopular: true,
          processingFee: orderAmount * 0.025,
          features: [
            '3D Secure güvenlik',
            'Anında onay',
            'Tüm kartlar kabul',
            'Taksit seçenekleri'
          ],
          processingTime: 'Anında',
          securityLevel: 'high',
          supportedCards: ['visa', 'mastercard', 'troy', 'american-express']
        },
        {
          _id: 'cash-on-delivery-1',
          name: 'Kapıda Ödeme',
          description: 'Siparişinizi teslim alırken nakit veya kartla ödeyebilirsiniz.',
          type: 'cash-on-delivery',
          icon: '💵',
          color: '#10b981',
          isPopular: true,
          processingFee: orderAmount <= 2000 ? 5.0 : 0,
          features: [
            'Nakit veya kart',
            'Ürünü görüp öde',
            'Risk yok',
            'Kolay iade'
          ],
          restrictions: orderAmount > 2000 ? ['Sipariş tutarı 2000 TL\'yi aştığı için kullanılamaz'] : ['Maksimum 2000 TL'],
          processingTime: 'Teslimat anında',
          securityLevel: 'medium'
        },
        {
          _id: 'bank-transfer-1',
          name: 'Havale/EFT',
          description: 'Banka havalesi ile ödeme yapın. %3 indirim fırsatı!',
          type: 'bank-transfer',
          icon: '🏦',
          color: '#8b5cf6',
          processingFee: orderAmount >= 100 ? -orderAmount * 0.03 : 0,
          features: [
            '%3 indirim avantajı',
            'Komisyon yok',
            'Güvenli transfer',
            'Tüm bankalar'
          ],
          restrictions: orderAmount < 100 ? ['Minimum 100 TL gereklidir'] : ['24-48 saat onay süresi'],
          processingTime: '24-48 saat',
          securityLevel: 'high'
        },
        {
          _id: 'stripe-1',
          name: 'Stripe Ödeme',
          description: 'Stripe ile güvenli ve hızlı ödeme. Dünya standartlarında güvenlik.',
          type: 'stripe',
          icon: '🔥',
          color: '#635bff',
          isPopular: true,
          processingFee: orderAmount * 0.029 + 0.30,
          features: [
            'Dünya standartı güvenlik',
            'Anında onay',
            'Tüm kartlar',
            'Uluslararası ödeme'
          ],
          processingTime: 'Anında',
          securityLevel: 'high'
        }
      ];

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentMethods(fallbackMethods);
      setError('');
      
      console.log('Payment methods loaded:', fallbackMethods);
      
      /*
      // Original API call - commented out for demo
      const response = await fetch(
        `/api/payment/methods?orderAmount=${orderAmount}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      setPaymentMethods(data.methods || []);
      */
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Ödeme seçenekleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onPaymentSelect(method);
  };

  const handleCreditCardSubmit = () => {
    if (!selectedMethod) return;

    // Validate card form
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Lütfen tüm kart bilgilerini doldurun');
      return;
    }

    const paymentData = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardName,
      expiryDate,
      cvv,
      installments: parseInt(installments)
    };

    onPaymentSelect(selectedMethod, paymentData);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'mastercard';
    if (num.startsWith('3')) return 'american-express';
    return 'unknown';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Ödeme seçenekleri yükleniyor...</span>
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 rounded-xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
                </div>
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
          onClick={fetchPaymentMethods}
          className="mt-3 text-red-600 hover:text-red-800 font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Ödeme Yöntemi
        </h3>
        <span className="text-sm text-gray-500">
          {paymentMethods.length} seçenek mevcut
        </span>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <AnimatePresence>
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedPayment === method._id
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
                      
                      {/* Processing Fee */}
                      <div className="text-right">
                        {method.processingFee === 0 ? (
                          <span className="text-sm font-medium text-green-600">
                            Komisyon Yok
                          </span>
                        ) : method.processingFee < 0 ? (
                          <span className="text-sm font-medium text-green-600">
                            {Math.abs(method.processingFee).toFixed(2)} TL İndirim
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            +{method.processingFee.toFixed(2)} TL
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {method.description}
                    </p>

                    {/* Processing Time */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        ⏱️ İşleme Süresi:
                      </span>
                      <span className="text-sm text-indigo-600 font-medium">
                        {method.processingTime}
                      </span>
                    </div>

                    {/* Features */}
                    {method.features && method.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
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

                    {/* Restrictions */}
                    {method.restrictions && method.restrictions.length > 0 && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {method.restrictions.map((restriction, idx) => (
                          <p key={idx}>• {restriction}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      selectedPayment === method._id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPayment === method._id && (
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
              {selectedPayment === method._id && (
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

      {/* Credit Card Form */}
      {selectedMethod?.type === 'credit-card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💳 Kart Bilgileri
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kart Numarası
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                />
                <div className="absolute right-3 top-3">
                  {getCardType(cardNumber) === 'visa' && <span className="text-blue-600 font-bold">VISA</span>}
                  {getCardType(cardNumber) === 'mastercard' && <span className="text-red-500 font-bold">MC</span>}
                </div>
              </div>
            </div>

            {/* Card Holder Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kart Üzerindeki İsim
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Son Kullanma Tarihi
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>

            {/* CVV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Installments */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taksit Seçeneği
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">Tek Çekim</option>
                <option value="2">2 Taksit</option>
                <option value="3">3 Taksit</option>
                <option value="6">6 Taksit</option>
                <option value="9">9 Taksit</option>
                <option value="12">12 Taksit</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreditCardSubmit}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            🔒 Güvenli Ödeme Yap
          </button>
        </motion.div>
      )}

      {/* Bank Transfer Info */}
      {selectedMethod?.type === 'bank-transfer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏦 Havale/EFT Bilgileri
          </h4>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="font-semibold text-gray-900">KadoShop Ticaret A.Ş.</p>
              <p className="text-gray-600">Garanti BBVA</p>
              <p className="text-gray-600">IBAN: TR98 0006 2000 1234 0006 2971 23</p>
              <p className="text-gray-600">Açıklama: Sipariş No</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                💰 Bu ödeme yöntemi ile %3 indirim kazanırsınız!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cash on Delivery Info */}
      {selectedMethod?.type === 'cash-on-delivery' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💵 Kapıda Ödeme
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-700">
              <span>✓</span>
              <span>Siparişinizi kapıda nakit veya kartla ödeyebilirsiniz</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <span>✓</span>
              <span>Ürünü inceleyip sonra ödeme yapabilirsiniz</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                💡 Kapıda ödeme için 5 TL ek ücret alınmaktadır.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stripe Payment Info */}
      {selectedMethod?.type === 'stripe' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🔥 Stripe Güvenli Ödeme
          </h4>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-violet-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-violet-600 font-bold">S</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Stripe Checkout</p>
                  <p className="text-sm text-gray-600">Dünya standartlarında güvenli ödeme</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>SSL Şifreleme</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>PCI DSS Uyumlu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Fraud Koruması</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>3D Secure</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-violet-900">İşlem Ücreti</p>
                  <p className="text-sm text-violet-700">%2.9 + ₺0.30</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-violet-900">Toplam</p>
                  <p className="text-lg font-bold text-violet-900">
                    ₺{(orderAmount + (selectedMethod?.processingFee || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onPaymentSelect(selectedMethod, { provider: 'stripe' })}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔒</span>
              <span>Stripe ile Güvenli Ödeme</span>
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Stripe güvenli ödeme sayfasına yönlendirileceksiniz
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 