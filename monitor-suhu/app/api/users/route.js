// app/api/users/route.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // ganti jika pakai password
  database: "be_monitor_suhu",
};

// GET semua user
export async function GET() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute("SELECT id, name, email, role FROM users ORDER BY id DESC");
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { data: { status: "99", message: "Gagal memuat data user" } },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

// POST / Tambah user baru
export async function POST(req) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const { name, email, password, role } = await req.json();

    // Validasi sederhana
    if (!name || !email || !password || !role) {
      return NextResponse.json({ data: { status: "99", message: "Semua field wajib diisi" } }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Masukkan ke database
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    return NextResponse.json({ data: { status: "00", message: "User berhasil ditambahkan", userId: result.insertId } });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json(
      { data: { status: "99", message: "Gagal menambah user", error: err.message } },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
