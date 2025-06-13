import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import User from '@/models/User';

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const type = searchParams.get('type'); // 'shipping', 'billing', 'both'

    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email required' },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Build query
    const query: any = { 
      user: user._id, 
      isActive: true 
    };

    if (type && type !== 'all') {
      query.$or = [
        { type: type },
        { type: 'both' }
      ];
    }

    // Get addresses
    const addresses = await Address.find(query)
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      addresses
    });

  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { message: 'Error fetching addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      userEmail,
      type = 'both',
      title,
      firstName,
      lastName,
      company,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'Turkey',
      isDefault = false
    } = body;

    // Validate required fields
    const requiredFields = [
      'userEmail', 'title', 'firstName', 'lastName', 
      'phone', 'addressLine1', 'city', 'state', 'postalCode'
    ];

    for (const field of requiredFields) {
      if (!body[field]?.toString().trim()) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate postal code (5 digits for Turkey)
    if (!/^[0-9]{5}$/.test(postalCode)) {
      return NextResponse.json(
        { message: 'Postal code must be 5 digits' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!/^[0-9+\-\s\(\)]{10,15}$/.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check if this is user's first address (make it default)
    const existingAddresses = await Address.countDocuments({ 
      user: user._id, 
      isActive: true 
    });

    const shouldBeDefault = isDefault || existingAddresses === 0;

    // Create address
    const address = new Address({
      user: user._id,
      type,
      title: title.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company?.trim() || '',
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim() || '',
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      isDefault: shouldBeDefault
    });

    await address.save();

    return NextResponse.json({
      message: 'Address created successfully',
      address
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating address:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { message: 'Invalid address data' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Error creating address' },
      { status: 500 }
    );
  }
} 