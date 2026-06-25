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

/* ─── Config ──────────────────────────────────── */
const AUTH_ROUTES = ["/onboarding"];
const AUTH_SUB_ROUTES = ["/dashboard", "/admin", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Only intercept routes that need auth or auth+sub
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthSubRoute = AUTH_SUB_ROUTES.some((r) => pathname.startsWith(r));

  if (!isAuthRoute && !isAuthSubRoute) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);

  // 2. Session check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Fetch profile
  const { data: profile } = await supabase
    .from("users")
    .select("subscription_status, role, charity_id")
    .eq("id", user.id)
    .single();

  // 4. If profile is null (row missing)
  if (!profile) {
    if (pathname.startsWith("/admin")) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 5. Admin route guard
  if (pathname.startsWith("/admin") && profile.role !== "admin") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // 6. Subscription check — skip for /onboarding
  if (!pathname.startsWith("/onboarding")) {
    const isActive = ["active", "trialing"].includes(
      profile?.subscription_status ?? ""
    );
    if (!isActive) {
      const pricingUrl = request.nextUrl.clone();
      pricingUrl.pathname = "/pricing";
      return NextResponse.redirect(pricingUrl);
    }
  }

  // 7. Charity guard — only for /dashboard routes
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
