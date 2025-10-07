import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { CheckoutItem } from '@/types/shop';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items }: { items: CheckoutItem[] } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Create line items for the payment link
    const lineItems: Stripe.PaymentLinkCreateParams.LineItem[] = [];

    for (const item of items) {
      // Determine the price to use (variant price takes precedence)
      const itemPrice = item.selectedVariant?.price ?? item.price;
      
      // Build product name with variant details
      let productName = item.name;
      const variantDetails: string[] = [];
      
      if (item.selectedVariant?.size) {
        variantDetails.push(`Size: ${item.selectedVariant.size}`);
      }
      if (item.selectedVariant?.color) {
        variantDetails.push(`Color: ${item.selectedVariant.color}`);
      }
      
      if (variantDetails.length > 0) {
        productName = `${productName} - ${variantDetails.join(', ')}`;
      }

      // Create a price using price_data (ad-hoc pricing)
      // This allows us to create products on the fly without managing a product catalog
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(itemPrice * 100), // Convert to cents
          product_data: {
            name: productName,
            // Include product images (Stripe accepts up to 8 images)
            ...(item.images && item.images.length > 0 && {
              images: item.images.slice(0, 8), // Stripe supports max 8 images
            }),
            metadata: {
              item_id: item.id,
              sku: item.selectedVariant?.sku || 'N/A',
              ...(item.selectedVariant?.size && { size: item.selectedVariant.size }),
              ...(item.selectedVariant?.color && { color: item.selectedVariant.color }),
            },
          },
        },
      });
    }

    // Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${req.nextUrl.origin}/checkout/success`,
        },
      },
      // Optional: Configure additional settings
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Customize based on your shipping countries
      },
      // Metadata to track the order
      metadata: {
        order_date: new Date().toISOString(),
        items_count: items.length.toString(),
      },
    });

    return NextResponse.json({
      url: paymentLink.url,
      id: paymentLink.id,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}

