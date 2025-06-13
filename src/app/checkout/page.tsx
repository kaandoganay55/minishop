'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import AddressList from '@/components/AddressList';
import ShippingOptions from '@/components/ShippingOptions';
import PaymentOptions from '@/components/PaymentOptions';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const checkoutSteps: CheckoutStep[] = [
  {
    id: 1,
    title: 'Adres Bilgileri',
    description: 'Teslimat adresinizi seçin',
    icon: '📍'
  },
  {
    id: 2,
    title: 'Teslimat Seçenekleri',
    description: 'Teslimat yönteminizi belirleyin',
    icon: '🚚'
  },
  {
    id: 3,
    title: 'Sipariş Özeti',
    description: 'Siparişinizi kontrol edin',
    icon: '📋'
  },
  {
    id: 4,
    title: 'Ödeme',
    description: 'Ödeme bilgilerinizi girin',
    icon: '💳'
  }
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
  };

  const handleShippingSelect = (method: any) => {
    setSelectedShipping(method._id);
    setShippingCost(method.cost);
  };

  const handlePaymentSelect = (method: any, data?: any) => {
    setSelectedPayment(method._id);
    setPaymentData(data);
  };

  const nextStep = () => {
    if (currentStep < checkoutSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedAddress !== null;
      case 2:
        return selectedShipping !== '';
      case 3:
        return true; // Order summary can always proceed
      case 4:
        return selectedPayment !== '';
      default:
        return false;
    }
  };

  const completeOrder = async () => {
    if (!canProceedToNextStep()) return;

    setLoading(true);
    try {
      // Here you would typically:
      // 1. Create order in database
      // 2. Process payment
      // 3. Send confirmation emails
      // 4. Clear cart
      // 5. Redirect to success page

      // For demo, we'll just simulate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      router.push('/order-success');
    } catch (error) {
      console.error('Order completion error:', error);
      alert('Sipariş tamamlanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sipariş Tamamla
          </h1>
          <p className="text-gray-600">
            Siparişinizi tamamlamak için aşağıdaki adımları takip edin
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {checkoutSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      '✓'
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${
                      currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < checkoutSteps.length - 1 && (
                  <div className={`flex-1 mx-4 h-0.5 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Address Selection */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <span className="text-2xl mr-3">📍</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Teslimat Adresi
                        </h2>
                        <p className="text-gray-600">
                          Siparişinizin teslim edileceği adresi seçin
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600">Adresleriniz yüklenecek...</p>
                        <button
                          onClick={() => setSelectedAddress({ _id: 'demo', title: 'Demo Adres', city: 'Istanbul' })}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Demo Adres Seç
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Shipping Options */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <span className="text-2xl mr-3">🚚</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Teslimat Seçenekleri
                        </h2>
                        <p className="text-gray-600">
                          Size uygun teslimat yöntemini seçin
                        </p>
                      </div>
                    </div>

                    <ShippingOptions
                      orderValue={total}
                      selectedAddress={selectedAddress}
                      onShippingSelect={handleShippingSelect}
                      selectedShipping={selectedShipping}
                    />
                  </motion.div>
                )}

                {/* Step 3: Order Summary */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <span className="text-2xl mr-3">📋</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Sipariş Özeti
                        </h2>
                        <p className="text-gray-600">
                          Sipariş detaylarınızı kontrol edin
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Selected Address */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Teslimat Adresi</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium">{selectedAddress?.title}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedAddress?.address}, {selectedAddress?.district}/{selectedAddress?.city}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedAddress?.firstName} {selectedAddress?.lastName} - {selectedAddress?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Selected Shipping */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Teslimat Yöntemi</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium">Seçilen teslimat yöntemi gösterilecek</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Sipariş İçeriği</h3>
                        <div className="space-y-3">
                          {items.map((item: any) => (
                            <div key={item.id || item._id || item.name} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
                              <img
                                src={item.image || "/api/placeholder/60/60"}
                                alt={item.name}
                                className="w-15 h-15 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {(item.price * item.quantity).toFixed(2)} TL
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Payment */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Ödeme Bilgileri
                        </h2>
                        <p className="text-gray-600">
                          Ödeme yönteminizi seçin ve bilgilerinizi girin
                        </p>
                      </div>
                    </div>

                    <PaymentOptions
                      orderAmount={total + shippingCost}
                      onPaymentSelect={handlePaymentSelect}
                      selectedPayment={selectedPayment}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Geri
                </button>

                {currentStep === checkoutSteps.length ? (
                  <button
                    onClick={completeOrder}
                    disabled={!canProceedToNextStep() || loading}
                    className={`px-8 py-2 rounded-lg font-medium transition-colors ${
                      !canProceedToNextStep() || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>İşleniyor...</span>
                      </span>
                    ) : (
                      '🎉 Siparişi Tamamla'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      !canProceedToNextStep()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    İleri →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Özeti
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium">{total.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toFixed(2)} TL`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Toplam</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {(total + shippingCost).toFixed(2)} TL
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Ücretsiz iade hakkı</p>
                <p>• 7/24 müşteri desteği</p>
                <p>• Güvenli ödeme altyapısı</p>
                <p>• SSL şifrelemeli işlem</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 