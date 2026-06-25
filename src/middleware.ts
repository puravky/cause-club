import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Create a Supabase client for use in Next.js middleware.
 * Uses request/response cookie pairs (not the cookies() API).
 */
function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}

/* ─── Protected route prefixes ──────────────── */
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-protected routes
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);

  // ── 1. Session check ──────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Fetch user profile for subscription + role ──
  const { data: profile } = await supabase
    .from("users")
    .select("subscription_status, role, charity_id")
    .eq("id", user.id)
    .single();

  // ── 3. Admin route guard (check BEFORE subscription) ──
  if (pathname.startsWith("/admin") && profile?.role !== "admin") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // ── 4. Subscription validation (PRD §4: real-time on every request) ──
  const activeStatuses = ["active", "trialing"];
  const hasActiveSubscription =
    profile?.subscription_status &&
    activeStatuses.includes(profile.subscription_status);

  if (!hasActiveSubscription) {
    const pricingUrl = request.nextUrl.clone();
    pricingUrl.pathname = "/pricing";
    return NextResponse.redirect(pricingUrl);
  }

  // ── 5. Onboarding / Charity selection guard ───
  if (pathname.startsWith("/dashboard") && !profile?.charity_id) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static, _next/image, favicon.ico
     * - API routes (they handle their own auth)
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
