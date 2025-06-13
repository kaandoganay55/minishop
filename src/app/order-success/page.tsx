'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px'
              }}
              animate={{
                y: window.innerHeight + 100,
                rotate: 360,
                scale: [1, 0.5, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-4xl text-green-600"
            >
              ✅
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Siparişiniz Başarıyla Alındı! 🎉
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-xl text-gray-600"
          >
            Teşekkür ederiz! Siparişiniz işleme alınmıştır.
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📋 Sipariş Bilgileri
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş Numarası:</span>
                  <span className="font-medium text-indigo-600">#KS{Date.now().toString().slice(-6)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş Tarihi:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödeme Durumu:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Ödeme Alındı
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş Durumu:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📦 Hazırlanıyor
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🚚 Teslimat Bilgileri
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 block">Teslimat Adresi:</span>
                  <span className="font-medium">Demo Adres, İstanbul</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block">Tahmini Teslimat:</span>
                  <span className="font-medium">{new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block">Kargo Firması:</span>
                  <span className="font-medium">KadoShop Express</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Toplam Tutar:</span>
                <span className="text-2xl font-bold text-indigo-600">₺ 299.99</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            🎯 Bundan Sonra Neler Olacak?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📧</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Email Onayı</h4>
              <p className="text-sm text-gray-600">
                Sipariş onay mailinizi birkaç dakika içinde alacaksınız
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📦</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Hazırlık</h4>
              <p className="text-sm text-gray-600">
                Siparişiniz özenle paketlenip kargoya verilecek
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🚚</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Teslimat</h4>
              <p className="text-sm text-gray-600">
                Kargo takip numaranızla teslimatı izleyebilirsiniz
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            📊 Siparişlerimi Görüntüle
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            🛍️ Alışverişe Devam Et
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            🖨️ Yazdır
          </button>
        </motion.div>

        {/* Customer Support */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-center mt-8 p-6 bg-gray-50 rounded-xl"
        >
          <p className="text-gray-600 mb-4">
            🤝 Herhangi bir sorunuz mu var?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+901234567890"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              📞 0123 456 78 90
            </a>
            <a
              href="mailto:destek@kadoshop.com"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              ✉️ destek@kadoshop.com
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              💬 Canlı Destek
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 