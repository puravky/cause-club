import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Supabase Auth callback handler.
 * Exchanges the auth code for a session after email confirmation.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const metadata = user.user_metadata;

      if (metadata && (metadata.charity_id || metadata.charity_percentage)) {
        await supabase
          .from("users")
          .update({
            charity_id: metadata.charity_id,
            charity_percentage: metadata.charity_percentage || 10,
          })
          .eq("id", user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or error, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
