'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/');
    }
    setIsMenuOpen(false); // Close mobile menu after search
    setIsSearchOpen(false); // Close mobile search
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center space-x-2 hover:text-indigo-700 transition-colors">
            <span className="text-3xl">🎁</span>
            <span>KadoShop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">

            <div className="flex items-center space-x-6">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profilim</span>
                  </Link>
                  <span className="text-gray-700">
                    Merhaba, <span className="font-medium">{session.user?.name}</span>
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
              
              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
                
                {/* Cart Item Count Badge */}
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <svg className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isSearchOpen ? 'max-h-20 opacity-100 pb-4' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Ara
            </button>
          </form>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4 space-y-3">
            {session ? (
              <>
                <div className="text-gray-700 px-4 py-3 bg-indigo-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Merhaba,</p>
                      <p className="text-sm text-gray-600">{session.user?.name}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profilim</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıkış Yap</span>
                  </div>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Giriş Yap</span>
                  </div>
                </Link>
                <Link
                  href="/register"
                  className="block mx-4 bg-indigo-600 text-white px-4 py-3 rounded-xl text-center hover:bg-indigo-700 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 