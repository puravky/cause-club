import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { priceId, userId, charityId, charityPercentage } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "priceId and userId are required fields" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        charityId: charityId || "",
        charityPercentage: charityPercentage ? String(charityPercentage) : "10",
        priceId,
      },
      success_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/pricing?checkout_cancelled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create Checkout Session URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown checkout error";
    console.error(`Stripe checkout error: ${message}`);
    return NextResponse.json(
      { error: `Internal checkout error: ${message}` },
      { status: 500 }
    );
  }
}
