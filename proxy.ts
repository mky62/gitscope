import { clerkMiddleware } from "@clerk/nextjs/server";

const RESERVED = new Set([
  "api",
  "dashboard",
  "signin",
  "sign-in",
  "sign-up",
  "sso-callback",
]);

function isPublicProfilePath(pathname: string) {
  const m = pathname.match(/^\/([^/]+)$/);
  if (!m) return false;
  const seg = m[1];
  return !!seg && !RESERVED.has(seg);
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/sso-callback")
  ) {
    return;
  }

  // Clerk webhook must be reachable publicly.
  if (pathname === "/api/webhooks/clerk") return;

  if (isPublicProfilePath(pathname)) return;

  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};