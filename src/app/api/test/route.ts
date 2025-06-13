import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    // Test ürünü
    const testProduct = {
      name: "Test Ürün",
      description: "Bu bir test ürünüdür",
      price: 99.99,
      image: "https://picsum.photos/400/300",
      category: "Test",
      stock: 10
    };

    const product = await Product.create(testProduct);

    return NextResponse.json({ 
      message: 'Test ürünü başarıyla eklendi',
      product 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Ürün eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 