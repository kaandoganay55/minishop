'use client';

import { useRouter } from 'next/navigation';

const categories = [
  {
    name: 'Elektronik',
    description: 'En yeni teknoloji ürünleri',
    image: 'https://picsum.photos/seed/electronics/400/300',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    name: 'Giyim',
    description: 'Moda ve stil',
    image: 'https://picsum.photos/seed/fashion/400/300',
    color: 'from-pink-500 to-rose-500'
  },
  {
    name: 'Ayakkabı',
    description: 'Rahat ve şık ayakkabılar',
    image: 'https://picsum.photos/seed/shoes/400/300',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'Oyun',
    description: 'Oyun ve eğlence',
    image: 'https://picsum.photos/seed/gaming/400/300',
    color: 'from-green-500 to-teal-500'
  }
];

export default function CategorySection() {
  const router = useRouter();

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Kategoriler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div
              key={category.name}
              onClick={() => router.push(`/?category=${category.name}`)}
              className="group cursor-pointer"
            >
              <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${category.color} aspect-[4/3]`}>
                {/* Kategori görseli */}
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url(${category.image})` }}
                >
                  <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity" />
                </div>
                
                {/* Kategori içeriği */}
                <div className="relative h-full flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 transform group-hover:translate-x-2 transition-transform">
                    {category.name}
                  </h3>
                  <p className="text-sm opacity-90 transform group-hover:translate-x-2 transition-transform delay-75">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 