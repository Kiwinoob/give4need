// middleware.ts
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/register", "/login", "/reset-password"];

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToPath(request: NextRequest, path = "/") {
  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");

  if (!token) {
    // Handle unauthenticated requests
    const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);
    if (!isPublicPath) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }

  // Token exists, continue with authentication check or redirect
  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);
  if (isPublicPath) {
    const redirectSearchParams = request.nextUrl.searchParams.get("redirect");
    return redirectToPath(request, redirectSearchParams || "/");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/reset-password",
    "/change-password",
    "/create-listing",
    "/edit-listing",
    "/listing",
    "/inbox",
    "/settings/:path*",
    "/:category/:id",
  ],
};
