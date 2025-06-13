'use client';

import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
      {/* Dekoratif arka plan deseni */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Hero içeriği */}
      <div className="container mx-auto px-4 py-16 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Alışverişin En İyi Adresi
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            En yeni ürünler, en iyi fiyatlar ve hızlı teslimat ile
            alışverişin keyfini çıkarın.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/?category=Elektronik')}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
            >
              Elektronik
            </button>
            <button
              onClick={() => router.push('/?category=Giyim')}
              className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Giyim
            </button>
          </div>
        </div>
      </div>

      {/* Dalga efekti */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1440 120V0C1252.89 80 1044.23 120 720 120C395.77 120 187.109 80 0 0V120H1440Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
} 