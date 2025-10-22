/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import Link from 'next/link'; // <-- import Link
import '@/styles/gradient.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const toast = useRef(null);

    const showToast = (severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();

            if (json.success) {
                localStorage.setItem('user', JSON.stringify(json.user));
                showToast('success', 'Login Berhasil', `Selamat datang, ${json.user.nama || 'User'}!`);
                setTimeout(() => router.push('/'), 1000);
            } else {
                showToast('error', 'Login Gagal', json.message || 'Email atau password salah');
            }
        } catch (err) {
            showToast('error', 'Error', err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-content-center align-items-center">
            <div className="animated-gradient-bg">
                <Toast ref={toast} />
                <div className="card w-10 h-full md:h-30rem">
                    <div className="grid h-full">
                        {/* Form Login */}
                        <div className="col-12 md:col-6 flex flex-col justify-center h-full px-4">
                            <div>
                                <h3 className="text-2xl text-center font-semibold mb-5">
                                    {process.env.NEXT_PUBLIC_APP_NAME || 'Monitor Suhu'}
                                </h3>

                                <form className="grid" onSubmit={handleLogin}>
                                    <div className="col-12">
                                        <label htmlFor="email">Email</label>
                                        <InputText
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full mt-3"
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="password">Password</label>
                                        <InputText
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full mt-3"
                                            required
                                        />
                                    </div>

                                    <div className="col-12 mt-3">
                                        <Button
                                            label={loading ? 'Memproses...' : 'Login'}
                                            className="w-full"
                                            loading={loading}
                                        />
                                    </div>
                                </form>

                                {/* Opsi Register */}
                                <p className="mt-3 text-center text-sm text-gray-600">
                                    Belum pernah login?{' '}
                                    <Link href="/auth/register" className="text-blue-600 hover:underline">
                                        Register dulu
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Gambar samping */}
                        <div className="hidden md:block md:col-6 h-full">
                            <img
                                src="https://api.minio.jatimprov.go.id/kominfo-jatim/images/e1a81661-d82b-4775-af7a-aaa72616961f.jpg"
                                className="w-full h-full object-cover"
                                alt="cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
