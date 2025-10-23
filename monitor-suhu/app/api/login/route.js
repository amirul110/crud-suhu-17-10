import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { SignJWT } from "jose";

export async function POST(req) {
  const { email, password } = await req.json();

  // Koneksi ke database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // ubah jika MySQL pakai password
    database: "be_monitor_suhu",
  });

  try {
    // Cari user berdasarkan email
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 🔐 Buat JWT pakai jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "rahasia123");
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h") // token berlaku 1 jam
      .sign(secret);

    // 🔁 Kirim token di cookie HTTP-only
    const res = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 jam
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
