'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  rating: number;
}

interface SearchAndFilterProps {
  categories: string[];
  onFilterChange: (filters: FilterState) => void;
  productsCount: number;
}

export default function SearchAndFilter({ 
  categories, 
  onFilterChange, 
  productsCount 
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000'),
    sortBy: searchParams.get('sortBy') || 'newest',
    rating: parseInt(searchParams.get('rating') || '0')
  });

  // Mock product names for search suggestions
  const productSuggestions = [
    'iPhone 14', 'Samsung Galaxy', 'MacBook Pro', 'AirPods', 'iPad',
    'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Apple Watch',
    'Canon EOS', 'Sony WH-1000XM4', 'Dell XPS', 'Surface Pro'
  ];

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Generate suggestions
    if (value.length > 0) {
      const filtered = productSuggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      updateFilters({ search: value });
    }, 300);
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });

    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      sortBy: 'newest',
      rating: 0
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilterChange(clearedFilters);
    router.push('/', { scroll: false });
    setIsFilterOpen(false);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'minPrice' && value === 0) return false;
    if (key === 'maxPrice' && value === 10000) return false;
    if (key === 'sortBy' && value === 'newest') return false;
    return value && value !== '' && value !== 0;
  }).length;

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-4" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleSearchChange(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side - Filter button and active filters */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.447.894l-4-2A1 1 0 017 18.586v-4.586a1 1 0 00-.293-.707L.293 7.707A1 1 0 010 7V4z" />
              </svg>
              <span>Filtrele</span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <span>Filtreleri Temizle</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Right side - Sort and results count */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {productsCount} ürün bulundu
            </span>

            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">En Yeni</option>
              <option value="price-low">Fiyat: Düşük - Yüksek</option>
              <option value="price-high">Fiyat: Yüksek - Düşük</option>
              <option value="rating">En Çok Beğenilen</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat Aralığı</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => updateFilters({ minPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: parseInt(e.target.value) || 10000 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Puan</label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating}
                        onChange={(e) => updateFilters({ rating: parseInt(e.target.value) })}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">ve üzeri</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={0}
                      checked={filters.rating === 0}
                      onChange={(e) => updateFilters({ rating: parseInt(e.target.value) })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Tümü</span>
                  </label>
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı Filtreler</label>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilters({ maxPrice: 100 })}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    100₺ Altı
                  </button>
                  <button
                    onClick={() => updateFilters({ minPrice: 100, maxPrice: 500 })}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    100₺ - 500₺
                  </button>
                  <button
                    onClick={() => updateFilters({ minPrice: 500 })}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    500₺ Üzeri
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Actions */}
            <div className="md:hidden mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 