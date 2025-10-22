// app/api/login/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

export async function POST(req) {
  const { email, password } = await req.json();

  // Koneksi langsung ke database
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // ganti jika MySQL pakai password
    database: "be_monitor_suhu",
  });

  try {
    // Query user berdasarkan email
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

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,   // sesuai field tabel
        email: user.email,
        role: user.role,   // optional, untuk master user page
      },
    });
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
