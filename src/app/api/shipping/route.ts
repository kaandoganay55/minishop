import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ShippingMethod from '@/models/ShippingMethod';

// GET /api/shipping - Get available shipping methods
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderValue = parseFloat(searchParams.get('orderValue') || '0');
    const weight = parseFloat(searchParams.get('weight') || '1');
    const region = searchParams.get('region') || 'Istanbul';

    if (orderValue <= 0) {
      return NextResponse.json(
        { message: 'Invalid order value' },
        { status: 400 }
      );
    }

    // Get available shipping methods for this order
    // Cast to any to avoid TypeScript static method issues
    const availableMethods = await (ShippingMethod as any).getAvailableForOrder(
      orderValue,
      weight,
      region
    );

    return NextResponse.json({
      methods: availableMethods,
      orderValue,
      region,
      totalMethods: availableMethods.length
    });

  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json(
      { message: 'Error fetching shipping methods' },
      { status: 500 }
    );
  }
}

// POST /api/shipping - Create or seed shipping methods (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { seed } = body;

    // If seed=true, create default shipping methods
    if (seed) {
      // Clear existing methods
      await ShippingMethod.deleteMany({});

      // Create default shipping methods
      const defaultMethods = [
        {
          name: 'Standart Teslimat',
          description: 'Ücretsiz kargo 300 TL ve üzeri siparişlerde! Normal teslimat süresi.',
          type: 'standard',
          basePrice: 29.99,
          freeShippingThreshold: 300,
          estimatedDays: { min: 3, max: 7 },
          icon: '📦',
          color: '#10b981',
          features: [
            '300 TL üzeri ücretsiz kargo',
            'Güvenli paketleme',
            'SMS bilgilendirme'
          ],
          regionalPricing: [
            {
              region: 'Istanbul',
              cities: ['Istanbul', 'Ankara', 'Izmir'],
              priceMultiplier: 1,
              additionalDays: 0
            },
            {
              region: 'Anadolu',
              cities: ['Konya', 'Kayseri', 'Sivas', 'Erzurum'],
              priceMultiplier: 1.2,
              additionalDays: 1
            }
          ],
          weightRules: [
            { maxWeight: 5, additionalPrice: 0 },
            { maxWeight: 15, additionalPrice: 15 },
            { maxWeight: 30, additionalPrice: 35 }
          ],
          cutoffTime: '15:00',
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        {
          name: 'Hızlı Teslimat',
          description: 'Daha hızlı ulaşsın! 1-3 iş günü içinde kapınızda.',
          type: 'fast',
          basePrice: 49.99,
          freeShippingThreshold: 500,
          estimatedDays: { min: 1, max: 3 },
          icon: '⚡',
          color: '#f59e0b',
          isPopular: true,
          features: [
            'Öncelikli işleme',
            'Hızlı kargo',
            'Canlı takip',
            '500 TL üzeri ücretsiz'
          ],
          regionalPricing: [
            {
              region: 'Istanbul',
              cities: ['Istanbul', 'Ankara', 'Izmir'],
              priceMultiplier: 1,
              additionalDays: 0
            },
            {
              region: 'Anadolu',
              cities: ['Konya', 'Kayseri', 'Sivas'],
              priceMultiplier: 1.3,
              additionalDays: 1
            }
          ],
          weightRules: [
            { maxWeight: 5, additionalPrice: 0 },
            { maxWeight: 15, additionalPrice: 20 },
            { maxWeight: 30, additionalPrice: 45 }
          ],
          cutoffTime: '14:00',
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        {
          name: 'Ekspres Teslimat',
          description: 'Süper hızlı! Ertesi gün kapınızda.',
          type: 'express',
          basePrice: 79.99,
          freeShippingThreshold: 1000,
          estimatedDays: { min: 1, max: 1 },
          icon: '🚀',
          color: '#ef4444',
          features: [
            'Ertesi gün teslimat',
            'Aynı gün kargo',
            'Öncelikli işleme',
            '1000 TL üzeri ücretsiz'
          ],
          restrictions: [
            'Sadece İstanbul, Ankara, İzmir',
            'Hafta içi 12:00\'a kadar sipariş'
          ],
          regionalPricing: [
            {
              region: 'Istanbul',
              cities: ['Istanbul', 'Ankara', 'Izmir'],
              priceMultiplier: 1,
              additionalDays: 0
            }
          ],
          weightRules: [
            { maxWeight: 5, additionalPrice: 0 },
            { maxWeight: 15, additionalPrice: 25 }
          ],
          cutoffTime: '12:00',
          maxOrderValue: 5000,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        {
          name: 'Aynı Gün Teslimat',
          description: 'Bugün sipariş, bugün elinizde! Seçili bölgelerde.',
          type: 'same-day',
          basePrice: 119.99,
          freeShippingThreshold: 2000,
          estimatedDays: { min: 0, max: 0 },
          icon: '⚡',
          color: '#8b5cf6',
          features: [
            'Aynı gün teslimat',
            '4 saatte kapıda',
            'Özel kuryeli',
            'Canlı takip'
          ],
          restrictions: [
            'Sadece İstanbul Avrupa yakası',
            '09:00-15:00 arası sipariş',
            'Maksimum 2 kg'
          ],
          regionalPricing: [
            {
              region: 'Istanbul',
              cities: ['Istanbul'],
              priceMultiplier: 1,
              additionalDays: 0
            }
          ],
          weightRules: [
            { maxWeight: 2, additionalPrice: 0 }
          ],
          cutoffTime: '15:00',
          maxOrderValue: 3000,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        }
      ];

      const createdMethods = await ShippingMethod.insertMany(defaultMethods);

      return NextResponse.json({
        message: 'Default shipping methods created successfully',
        methods: createdMethods,
        count: createdMethods.length
      }, { status: 201 });
    }

    // Regular create method (from body)
    const method = new ShippingMethod(body);
    await method.save();

    return NextResponse.json({
      message: 'Shipping method created successfully',
      method
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating shipping method:', error);
    return NextResponse.json(
      { message: 'Error creating shipping method' },
      { status: 500 }
    );
  }
} 