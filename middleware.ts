import { type NextRequest, NextResponse } from "next/server";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase"; // Adjust the path to your Firebase config

const PUBLIC_PATHS = ["/register", "/login", "/reset-password"];

function redirectToLogin(request: any) {
  const url = new URL("/login", request.url);
  url.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToPath(request: any, path = "/") {
  const url = new URL(path, request.url);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const user = await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });

  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);
  const isAuthenticated = !!user;

  // If the user is not authenticated and trying to access a protected path, redirect to login
  if (!isAuthenticated && !isPublicPath) {
    return redirectToLogin(request);
  }

  // If the user is authenticated and trying to access a public path, redirect to the home page
  if (isAuthenticated && isPublicPath) {
    const redirectSearchParams = request.nextUrl.searchParams.get("redirect");

    if (redirectSearchParams) {
      return redirectToPath(request, redirectSearchParams);
    }

    return redirectToPath(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/reset-password", "/change-password"],
};
