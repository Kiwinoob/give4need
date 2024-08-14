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
  const cookies = request.cookies.get("auth-token");

  // If there is no token, user is not authenticated
  if (!cookies) {
    const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);
    if (!isPublicPath) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }

  // Assuming the token is in cookies and needs to be validated
  // You would need to validate the token on the client side or via an endpoint here

  // If the token is valid
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
  ],
};
