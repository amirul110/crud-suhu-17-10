import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

export async function POST(req) {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
        return NextResponse.json(
            { data: { status: '99', message: 'Semua field wajib diisi' } },
            { status: 400 }
        );
    }

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'be_monitor_suhu',
    });

    try {
        // Cek email
        const [existing] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return NextResponse.json(
                { data: { status: '99', message: 'Email sudah terdaftar' } },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        return NextResponse.json({
            data: { status: '00', message: 'Register berhasil', userId: result.insertId },
        });
    } catch (err) {
        console.error('Register error:', err);
        return NextResponse.json(
            { data: { status: '99', message: 'Terjadi kesalahan server' } },
            { status: 500 }
        );
    } finally {
        await connection.end();
    }
}
