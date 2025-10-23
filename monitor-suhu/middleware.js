import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia123");

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  // Jika tidak ada token → arahkan ke login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    // Verifikasi JWT pakai jose
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error("JWT invalid:", err);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/", "/dashboard", "/(main)/:path*"],
};
