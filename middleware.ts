import { NextRequest, NextResponse } from "next/server";

/** Keep the frontend on one origin so cookie-backed refresh-token rotation is
 * coordinated by the browser across all open tabs. Both public hostnames still
 * work; www is redirected to the canonical apex hostname. */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production" || request.nextUrl.hostname.toLowerCase() !== "www.hadijam.com") {
    return NextResponse.next();
  }

  const canonicalUrl = request.nextUrl.clone();
  canonicalUrl.hostname = "hadijam.com";
  canonicalUrl.protocol = "https:";
  return NextResponse.redirect(canonicalUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
