import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validasyon
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    await connectDB();

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 12);

    // Admin kullanıcı oluşturma
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: true // Admin olarak işaretle
    });

    return NextResponse.json({
      message: 'Admin kullanıcı başarıyla oluşturuldu',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Admin kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 