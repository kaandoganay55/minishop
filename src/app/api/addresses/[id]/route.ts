import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import User from '@/models/User';

// GET /api/addresses/[id] - Get specific address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

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

    // Find address
    const address = await Address.findOne({
      _id: params.id,
      user: user._id,
      isActive: true
    });

    if (!address) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ address });

  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json(
      { message: 'Error fetching address' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      userEmail,
      type,
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
      country,
      isDefault
    } = body;

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

    // Find address
    const address = await Address.findOne({
      _id: params.id,
      user: user._id,
      isActive: true
    });

    if (!address) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }

    // Validate postal code if provided
    if (postalCode && !/^[0-9]{5}$/.test(postalCode)) {
      return NextResponse.json(
        { message: 'Postal code must be 5 digits' },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phone && !/^[0-9+\-\s\(\)]{10,15}$/.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Update fields
    const updateData: any = {};
    
    if (type) updateData.type = type;
    if (title) updateData.title = title.trim();
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (phone) updateData.phone = phone.trim();
    if (addressLine1) updateData.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2.trim();
    if (city) updateData.city = city.trim();
    if (state) updateData.state = state.trim();
    if (postalCode) updateData.postalCode = postalCode.trim();
    if (country) updateData.country = country.trim();
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    // Update address
    Object.assign(address, updateData);
    await address.save();

    return NextResponse.json({
      message: 'Address updated successfully',
      address
    });

  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { message: 'Error updating address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete address (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

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

    // Find address
    const address = await Address.findOne({
      _id: params.id,
      user: user._id,
      isActive: true
    });

    if (!address) {
      return NextResponse.json(
        { message: 'Address not found' },
        { status: 404 }
      );
    }

    // Soft delete (mark as inactive)
    address.isActive = false;
    address.isDefault = false;
    await address.save();

    // If this was the default address, make another address default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        user: user._id,
        isActive: true,
        _id: { $ne: params.id }
      }).sort({ createdAt: -1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return NextResponse.json({
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { message: 'Error deleting address' },
      { status: 500 }
    );
  }
} 