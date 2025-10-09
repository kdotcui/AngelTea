import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { CheckoutItem, ProductVariant } from '@/types/shop';
import { getShopItems } from '@/services/shopItemUtils';

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

    // Fetch all shop items from the database to validate against
    const shopItems = await getShopItems();
    const shopItemsMap = new Map(shopItems.map(item => [item.id, item]));

    // Create line items for the payment link
    const lineItems: Stripe.PaymentLinkCreateParams.LineItem[] = [];

    for (const item of items) {
      // SECURITY: Look up the product server-side instead of trusting client data
      const serverItem = shopItemsMap.get(item.id);
      
      if (!serverItem) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        );
      }

      // Validate quantity is positive
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return NextResponse.json(
          { error: `Invalid quantity for ${serverItem.name}` },
          { status: 400 }
        );
      }

      let serverPrice: number;
      let serverVariant: ProductVariant | undefined;
      let productName = serverItem.name;
      const variantDetails: string[] = [];

      // If the item has a selected variant, validate and find it server-side
      if (item.selectedVariant?.sku) {
        if (!serverItem.variants || serverItem.variants.length === 0) {
          return NextResponse.json(
            { error: `Product ${serverItem.name} does not have variants` },
            { status: 400 }
          );
        }

        // Find the variant by SKU
        serverVariant = serverItem.variants.find((v: ProductVariant) => v.sku === item.selectedVariant?.sku);
        
        if (!serverVariant) {
          return NextResponse.json(
            { error: `Variant not found for ${serverItem.name} with SKU: ${item.selectedVariant.sku}` },
            { status: 400 }
          );
        }

        // Validate stock for this variant
        if (serverVariant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${serverItem.name} (${serverVariant.sku}). Available: ${serverVariant.stock}, Requested: ${item.quantity}` },
            { status: 400 }
          );
        }

        // Use server-side variant price, or fall back to base price
        serverPrice = serverVariant.price ?? serverItem.price;

        // Build variant details for display
        if (serverVariant.size) {
          variantDetails.push(`Size: ${serverVariant.size}`);
        }
        if (serverVariant.color) {
          variantDetails.push(`Color: ${serverVariant.color}`);
        }
      } else {
        // No variant selected - validate against base item quantity/stock
        if (serverItem.quantity !== undefined && serverItem.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${serverItem.name}. Available: ${serverItem.quantity}, Requested: ${item.quantity}` },
            { status: 400 }
          );
        }

        // Use server-side base price
        serverPrice = serverItem.price;
      }

      // Build product name with variant details
      if (variantDetails.length > 0) {
        productName = `${productName} - ${variantDetails.join(', ')}`;
      }

      // Create a price using price_data (ad-hoc pricing)
      // Using server-side validated price, not client-supplied price
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(serverPrice * 100), // Convert to cents
          product_data: {
            name: productName,
            // Include product images (Stripe accepts up to 8 images)
            ...(serverItem.images && serverItem.images.length > 0 && {
              images: serverItem.images.slice(0, 8), // Stripe supports max 8 images
            }),
            metadata: {
              item_id: serverItem.id,
              sku: serverVariant?.sku || 'N/A',
              ...(serverVariant?.size && { size: serverVariant.size }),
              ...(serverVariant?.color && { color: serverVariant.color }),
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
  } catch (error: unknown) {
    console.error('Error creating payment link:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

