import { getSupabaseServer } from "@/server/supabase";
import { NextRequest, NextResponse } from "next/server";
import { OrderRecord } from "@/server/types";

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, quantity = 1 } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Fetch listing with seller info
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Validate listing is active and not sold
    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "Listing is not available for purchase" },
        { status: 400 }
      );
    }

    // Check if user is not the seller
    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own listing" },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = listing.price * quantity;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        price: totalPrice,
        status: "processing",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Update listing status to sold if single item
    if (quantity >= listing.quantity_available || !listing.quantity_available) {
      await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", listingId);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || "buyer"; // buyer or seller

    let query = supabase.from("orders").select(`
      id,
      listing_id,
      buyer_id,
      price,
      status,
      created_at,
      listings(id, model, brand, price, status, image_urls),
      buyers:buyer_id(id, full_name, email)
    `);

    if (role === "seller") {
      // Seller viewing orders for their listings
      query = query.eq("listings.seller_id", user.id);
    } else {
      // Buyer viewing their own orders
      query = query.eq("buyer_id", user.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status
// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const supabase = await getSupabaseServer();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { status } = await request.json();
//     const { id: orderId } = await params;

//     if (!status) {
//       return NextResponse.json(
//         { error: "Status is required" },
//         { status: 400 }
//       );
//     }

//     // Fetch order
//     const { data: order, error: orderError } = await supabase
//       .from("orders")
//       .select("*, listings(seller_id)")
//       .eq("id", orderId)
//       .single();

//     if (orderError || !order) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     // Check authorization (buyer or seller only)
//     if (order.buyer_id !== user.id && order.listing?.seller_id !== user.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Update order status
//     const { data: updated, error: updateError } = await supabase
//       .from("orders")
//       .update({ status })
//       .eq("id", orderId)
//       .select()
//       .single();

//     if (updateError) {
//       console.error("Order update error:", updateError);
//       return NextResponse.json(
//         { error: "Failed to update order" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(updated);
//   } catch (error) {
//     console.error("Order update error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }