import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, charityId } = body;

    if (!amount || isNaN(amount) || amount <= 0 || !charityId) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Get user details for customer
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    const stripe = getStripe();
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : profile?.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Independent Charity Donation",
              description: "One-time donation directly to your selected cause.",
            },
            unit_amount: Math.round(amount * 100), // in pence
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/charity?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/charity?canceled=true`,
      metadata: {
        userId: user.id,
        type: "independent",
        charityId: charityId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe independent checkout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
