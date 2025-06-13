import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PaymentMethod from '@/models/PaymentMethod';

// GET /api/payment/methods - Get available payment methods
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderAmount = parseFloat(searchParams.get('orderAmount') || '0');

    if (orderAmount <= 0) {
      return NextResponse.json(
        { message: 'Invalid order amount' },
        { status: 400 }
      );
    }

    // Get available payment methods for this order
    const availableMethods = await (PaymentMethod as any).getAvailableForOrder(orderAmount);

    return NextResponse.json({
      methods: availableMethods,
      orderAmount,
      totalMethods: availableMethods.length
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { message: 'Error fetching payment methods' },
      { status: 500 }
    );
  }
}

// POST /api/payment/methods - Create or seed payment methods
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { seed } = body;

    // If seed=true, create default payment methods
    if (seed) {
      // Clear existing methods
      await PaymentMethod.deleteMany({});

      // Create default payment methods
      const defaultMethods = [
        {
          name: 'Kredi/Banka Kartı',
          description: 'Visa, Mastercard, Troy kartlarınız ile güvenli ödeme. 3D Secure korumalı.',
          type: 'credit-card',
          icon: '💳',
          color: '#3b82f6',
          isPopular: true,
          processingFee: 0,
          processingFeePercent: 2.5,
          supportedCards: ['visa', 'mastercard', 'troy', 'american-express'],
          features: [
            '3D Secure güvenlik',
            'Anında onay',
            'Tüm kartlar kabul',
            'Taksit seçenekleri'
          ],
          processingTime: 'Anında',
          securityLevel: 'high'
        },
        {
          name: 'Kapıda Ödeme',
          description: 'Siparişinizi teslim alırken nakit veya kartla ödeyebilirsiniz.',
          type: 'cash-on-delivery',
          icon: '💵',
          color: '#10b981',
          isPopular: true,
          processingFee: 5.00,
          processingFeePercent: 0,
          maxAmount: 2000,
          features: [
            'Nakit veya kart',
            'Ürünü görüp öde',
            'Risk yok',
            'Kolay iade'
          ],
          restrictions: [
            'Maksimum 2000 TL',
            'Aynı gün teslimat hariç'
          ],
          processingTime: 'Teslimat anında',
          securityLevel: 'medium'
        },
        {
          name: 'Havale/EFT',
          description: 'Banka havalesi ile ödeme yapın. %3 indirim fırsatı!',
          type: 'bank-transfer',
          icon: '🏦',
          color: '#8b5cf6',
          processingFee: 0,
          processingFeePercent: -3, // %3 indirim
          minAmount: 100,
          features: [
            '%3 indirim avantajı',
            'Komisyon yok',
            'Güvenli transfer',
            'Tüm bankalar'
          ],
          restrictions: [
            'Minimum 100 TL',
            '24-48 saat onay süresi'
          ],
          processingTime: '24-48 saat',
          securityLevel: 'high'
        },
        {
          name: 'Dijital Cüzdan',
          description: 'PayPal, Apple Pay, Google Pay ile hızlı ödeme.',
          type: 'digital-wallet',
          icon: '📱',
          color: '#f59e0b',
          processingFee: 0,
          processingFeePercent: 1.5,
          features: [
            'Tek tık ödeme',
            'Biometric güvenlik',
            'Uluslararası geçerli',
            'Anında onay'
          ],
          processingTime: 'Anında',
          securityLevel: 'high'
        }
      ];

      const createdMethods = await PaymentMethod.insertMany(defaultMethods);

      return NextResponse.json({
        message: 'Default payment methods created successfully',
        methods: createdMethods,
        count: createdMethods.length
      }, { status: 201 });
    }

    // Regular create method (from body)
    const method = new PaymentMethod(body);
    await method.save();

    return NextResponse.json({
      message: 'Payment method created successfully',
      method
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { message: 'Error creating payment method' },
      { status: 500 }
    );
  }
} 