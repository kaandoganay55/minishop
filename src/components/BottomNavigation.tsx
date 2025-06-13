'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();
  const { data: session } = useSession();

  const navItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      href: '/',
      icon: (isActive: boolean) => (
        <svg 
          className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} 
          fill={isActive ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? "0" : "2"} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
      ),
    },
    {
      id: 'categories',
      label: 'Kategoriler',
      href: '/?category=all',
      icon: (isActive: boolean) => (
        <svg 
          className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} 
          fill={isActive ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? "0" : "2"} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
      ),
    },
    {
      id: 'search',
      label: 'Ara',
      href: '/?search=',
      icon: (isActive: boolean) => (
        <svg 
          className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} 
          fill={isActive ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? "0" : "2"} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: session ? 'Profil' : 'Giriş',
      href: session ? '/profile' : '/login',
      icon: (isActive: boolean) => (
        <svg 
          className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} 
          fill={isActive ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={isActive ? "0" : "2"} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden backdrop-blur-lg bg-white/95">
        {/* Floating Action Button (FAB) for Cart - Modern touch */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={toggleCart}
            className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center justify-around py-2 px-4 pt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.id === 'home' && pathname === '/') ||
              (item.id === 'profile' && (pathname.startsWith('/profile') || pathname.startsWith('/login')));

            return (
              <div key={item.id} className="flex flex-col items-center min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'text-indigo-600 bg-indigo-50 transform scale-105' 
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50 active:scale-95'
                  }`}
                >
                  {item.icon(isActive)}
                  <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Padding for Content */}
      <div className="h-20 md:hidden"></div>
    </>
  );
} 