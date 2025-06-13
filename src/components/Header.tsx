'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  'Tümü',
  'Elektronik',
  'Giyim',
  'Ayakkabı',
  'Oyun',
  'Fotoğraf'
];

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Tümü');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'Tümü') params.set('category', selectedCategory);
    
    router.push(`/?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    const params = new URLSearchParams(searchParams.toString());
    if (category !== 'Tümü') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Arama çubuğu */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Kategori seçimi */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Arama butonu */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ara
          </button>
        </form>
      </div>
    </div>
  );
} 