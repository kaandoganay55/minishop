import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Güvenlik için şifreleri hariç tutarak kullanıcıları getir
    const users = await User.find({}).select('-password');
    
    return NextResponse.json({ 
      message: 'Kullanıcılar başarıyla getirildi',
      count: users.length,
      users 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcılar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 