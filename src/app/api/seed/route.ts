import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: "iPhone 14 Pro",
    description: "Apple'ın en yeni amiral gemisi telefonu",
    price: 999.99,
    image: "https://picsum.photos/seed/iphone/400/300",
    category: "Elektronik",
    stock: 15
  },
  {
    name: "MacBook Air M2",
    description: "M2 işlemcili yeni MacBook Air",
    price: 1299.99,
    image: "https://picsum.photos/seed/macbook/400/300",
    category: "Elektronik",
    stock: 10
  },
  {
    name: "Nike Air Max",
    description: "Rahat ve şık spor ayakkabı",
    price: 129.99,
    image: "https://picsum.photos/seed/nike/400/300",
    category: "Ayakkabı",
    stock: 25
  },
  {
    name: "Levi's 501 Kot Pantolon",
    description: "Klasik kesim kot pantolon",
    price: 79.99,
    image: "https://picsum.photos/seed/levis/400/300",
    category: "Giyim",
    stock: 30
  },
  {
    name: "Samsung 4K Smart TV",
    description: "55 inç 4K Ultra HD Smart TV",
    price: 699.99,
    image: "https://picsum.photos/seed/samsung/400/300",
    category: "Elektronik",
    stock: 8
  },
  {
    name: "PlayStation 5",
    description: "Sony'nin en yeni oyun konsolu",
    price: 499.99,
    image: "https://picsum.photos/seed/ps5/400/300",
    category: "Oyun",
    stock: 5
  },
  {
    name: "Apple Watch Series 8",
    description: "Gelişmiş sağlık özellikleriyle akıllı saat",
    price: 399.99,
    image: "https://picsum.photos/seed/watch/400/300",
    category: "Elektronik",
    stock: 20
  },
  {
    name: "Canon EOS R6",
    description: "Profesyonel aynasız fotoğraf makinesi",
    price: 2499.99,
    image: "https://picsum.photos/seed/canon/400/300",
    category: "Fotoğraf",
    stock: 6
  }
];

export async function GET() {
  try {
    await connectDB();

    // Önce mevcut ürünleri temizleyelim
    await Product.deleteMany({});

    // Yeni ürünleri ekleyelim
    const products = await Product.insertMany(sampleProducts);

    return NextResponse.json({ 
      message: 'Örnek ürünler başarıyla eklendi',
      count: products.length,
      products 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Ürünler eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 