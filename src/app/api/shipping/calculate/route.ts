import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ShippingMethod from '@/models/ShippingMethod';

// POST /api/shipping/calculate - Calculate shipping cost for specific method
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { methodId, orderValue, weight = 1, region = 'Istanbul' } = body;

    if (!methodId || !orderValue) {
      return NextResponse.json(
        { message: 'Method ID and order value are required' },
        { status: 400 }
      );
    }

    // Find the shipping method
    const method = await ShippingMethod.findById(methodId);

    if (!method) {
      return NextResponse.json(
        { message: 'Shipping method not found' },
        { status: 404 }
      );
    }

    if (!method.isActive) {
      return NextResponse.json(
        { message: 'Shipping method is not active' },
        { status: 400 }
      );
    }

    try {
      // Calculate cost and delivery info
      const cost = method.calculateCost(orderValue, weight, region);
      const delivery = method.getEstimatedDelivery(region);

      const result = {
        methodId: method._id,
        name: method.name,
        type: method.type,
        cost,
        originalPrice: method.basePrice,
        isFree: cost === 0,
        savings: cost === 0 ? method.basePrice : 0,
        estimatedDelivery: delivery,
        calculation: {
          orderValue,
          weight,
          region,
          basePrice: method.basePrice,
          freeShippingThreshold: method.freeShippingThreshold,
          appliedRules: [] as any[]
        }
      };

      // Add calculation details
      if (cost === 0 && method.freeShippingThreshold > 0) {
        result.calculation.appliedRules.push({
          type: 'free_shipping',
          description: `Free shipping for orders over ${method.freeShippingThreshold} TL`,
          discount: method.basePrice
        });
      }

      // Check regional pricing
      const regionalRule = method.regionalPricing.find((rule: any) => 
        rule.region.toLowerCase() === region.toLowerCase() ||
        rule.cities.some((city: any) => city.toLowerCase() === region.toLowerCase())
      );

      if (regionalRule && regionalRule.priceMultiplier !== 1) {
        result.calculation.appliedRules.push({
          type: 'regional_pricing',
          description: `Regional pricing for ${region}`,
          multiplier: regionalRule.priceMultiplier
        });
      }

      // Check weight rules
      const weightRule = method.weightRules
        .sort((a: any, b: any) => a.maxWeight - b.maxWeight)
        .find((rule: any) => weight <= rule.maxWeight);

      if (weightRule && weightRule.additionalPrice > 0) {
        result.calculation.appliedRules.push({
          type: 'weight_surcharge',
          description: `Additional charge for ${weight}kg`,
          surcharge: weightRule.additionalPrice
        });
      }

      return NextResponse.json(result);

    } catch (calculationError: any) {
      return NextResponse.json(
        { message: calculationError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    return NextResponse.json(
      { message: 'Error calculating shipping cost' },
      { status: 500 }
    );
  }
} 