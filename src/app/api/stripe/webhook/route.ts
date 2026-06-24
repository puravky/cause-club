import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    console.error("Missing Stripe-Signature header");
    return new NextResponse("Webhook Error: Missing signature", { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    console.error(`Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  // Return 200 early for unknown event types
  if (!event.type.startsWith("checkout.session.") &&
      !event.type.startsWith("customer.subscription.") &&
      !event.type.startsWith("invoice.") &&
      event.type !== "charge.refunded") {
    console.log(`Unrecognised event type: ${event.type}. Acknowledging.`);
    return NextResponse.json({ received: true });
  }

  // Ignore events without a customer
  const eventObj = event.data.object as unknown as Record<string, unknown>;
  if (!eventObj.customer) {
    console.log(`Event ${event.type} has no customer. Acknowledging.`);
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const charityId = metadata.charityId || null;
        const charityPercentage = metadata.charityPercentage
          ? parseInt(metadata.charityPercentage, 10)
          : 10;

        if (!userId) {
          console.error("checkout.session.completed: Missing userId in metadata");
          break;
        }

        if (metadata.type === "independent") {
          console.log(`Processing independent donation for user ${userId}`);
          const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
          
          if (charityId && amountPaid > 0) {
            const { error: donationErr } = await supabase.from("donations").insert({
              user_id: userId,
              charity_id: charityId,
              amount: amountPaid,
              type: "independent",
            });
            if (donationErr) console.error("Failed to insert independent donation:", donationErr.message);
          }
          break;
        }

        console.log(`Processing checkout.session.completed for user ${userId}`);

        // 1. Update user profile with stripe details and charity configuration
        const { error: userErr } = await supabase
          .from("users")
          .update({
            stripe_customer_id: session.customer as string,
            subscription_status: "active",
            subscription_plan: session.metadata?.priceId === process.env.STRIPE_PRICE_YEARLY ? "yearly" : "monthly",
            charity_id: charityId || null,
            charity_percentage: charityPercentage,
          })
          .eq("id", userId);

        if (userErr) {
          console.error(`Error updating user ${userId}:`, userErr.message);
        }

        // 2. Fetch active Stripe subscription details to record the period bounds
        if (session.subscription) {
          const subscription = (await stripe.subscriptions.retrieve(
            session.subscription as string
          )) as unknown as {
            id: string;
            status: string;
            current_period_end: number;
            items: {
              data: {
                plan: {
                  interval: string;
                };
              }[];
            };
          };
          const interval = subscription.items.data[0]?.plan.interval === "year" ? "yearly" : "monthly";

          const { error: subErr } = await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            plan: interval,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, {
            onConflict: "stripe_subscription_id"
          });

          if (subErr) {
            console.error(`Error upserting subscription for user ${userId}:`, subErr.message);
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as {
          id: string;
          status: string;
          current_period_end: number;
        };
        console.log(`Processing ${event.type} for subscription ${subscription.id}`);

        // 1. Find user_id associated with this subscription
        const { data: subRecord, error: subQueryErr } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (subQueryErr || !subRecord) {
          console.error(`No local record found for subscription ${subscription.id}`);
          break;
        }

        const userId = subRecord.user_id;

        // 2. Update subscription status locally
        const { error: subUpdateErr } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (subUpdateErr) {
          console.error(`Failed to update subscription ${subscription.id}:`, subUpdateErr.message);
        }

        // 3. Sync status back to user row
        const { error: userUpdateErr } = await supabase
          .from("users")
          .update({
            subscription_status: subscription.status,
          })
          .eq("id", userId);

        if (userUpdateErr) {
          console.error(`Failed to sync status to user ${userId}:`, userUpdateErr.message);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as unknown as {
          id: string;
          customer: string;
          subscription: string | null;
          amount_paid: number | null;
        };
        console.log(`Processing invoice.payment_succeeded for invoice ${invoice.id}`);

        if (!invoice.subscription) {
          console.log("Invoice has no associated subscription. Skipping donation calculations.");
          break;
        }

        // 1. Find user from customer ID
        const { data: userProfile, error: userQueryErr } = await supabase
          .from("users")
          .select("id, charity_id, charity_percentage")
          .eq("stripe_customer_id", invoice.customer as string)
          .single();

        if (userQueryErr || !userProfile) {
          console.error(`No user profile found for stripe customer ${invoice.customer}`);
          break;
        }

        if (!userProfile.charity_id) {
          console.log(`User ${userProfile.id} has no charity selected. Skipping donation log.`);
          break;
        }

        // 2. Calculate donation contribution (based on user's selected percentage)
        const amountPaid = (invoice.amount_paid || 0) / 100;
        const donationPercentage = userProfile.charity_percentage || 10;
        const donationAmount = amountPaid * (donationPercentage / 100);

        console.log(`Logging donation of £${donationAmount} (${donationPercentage}% of £${amountPaid}) to charity ${userProfile.charity_id}`);

        try {
          const { error: donationErr } = await supabase.from("donations").insert({
          user_id: userProfile.id,
          charity_id: userProfile.charity_id,
          amount: donationAmount,
          type: "subscription_percentage",
        });

          if (donationErr) {
            console.error("Failed to insert donation log record:", donationErr.message);
          }
        } catch (donationInsertErr) {
          console.error("Exception inserting donation:", donationInsertErr);
          return new NextResponse("Webhook Processing Error: donation insert failed", { status: 500 });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Processing charge.refunded for charge ${charge.id}`);

        const { data: userProfile } = await supabase
          .from("users")
          .select("id, charity_id")
          .eq("stripe_customer_id", charge.customer as string)
          .single();

        if (userProfile && userProfile.charity_id) {
          const refundedAmount = (charge.amount_refunded || 0) / 100;
          
          console.log(`Logging negative donation (refund) of £${refundedAmount}`);
          const { error: refundErr } = await supabase.from("donations").insert({
            user_id: userProfile.id,
            charity_id: userProfile.charity_id,
            amount: -Math.abs(refundedAmount),
            type: "independent",
          });

          if (refundErr) console.error("Failed to log refund donation:", refundErr.message);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown processing error";
    console.error(`Stripe Webhook processing failed internally: ${message}`);
    return new NextResponse(`Webhook Processing Error: ${message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
