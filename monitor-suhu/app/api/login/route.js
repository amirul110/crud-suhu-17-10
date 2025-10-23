import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  // Buat koneksi ke database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // ubah jika MySQL kamu pakai password
    database: "be_monitor_suhu",
  });

  try {
    // Cari user berdasarkan email
    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);

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

    // 🔐 Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "rahasia123", // ganti dengan env
      { expiresIn: "1h" }
    );

    // 🔁 Simpan token di cookie (HTTP only)
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });

    return response;
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
