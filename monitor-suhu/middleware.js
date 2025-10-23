import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia123");

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  // Jika tidak ada token → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET); // verifikasi token
    return NextResponse.next();      // token valid → lanjut
  } catch (err) {
    return NextResponse.redirect(new URL("/auth/login", req.url)); // token invalid → login
  }
}

// matcher untuk halaman yang harus login
export const config = {
  matcher: ["/", "/dashboard/:path*", "/(main)/:path*"],
};
