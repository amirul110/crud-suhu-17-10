'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import '@/styles/gradient.css';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const router = useRouter();

    const roleOptions = [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
    ];

    const showToast = (severity, summary, detail) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const json = await res.json();

            if (json.data.status === '00') {
                showToast('success', 'Register Berhasil', 'Silakan login sekarang!');
                setTimeout(() => router.push('/auth/login'), 1000);
            } else {
                showToast('error', 'Register Gagal', json.data.message || 'Terjadi kesalahan');
            }
        } catch (err) {
            showToast('error', 'Error', err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-content-center items-center">
            <div className="animated-gradient-bg">
                <Toast ref={toast} />
                <div className="card w-10 h-full md:h-30rem">
                    <div className="grid h-full">
                        {/* Form Section */}
                        <div className="col-12 md:col-6 flex flex-col justify-center h-full px-4">
                            <h3 className="text-2xl text-center font-semibold mb-5">
                                {process.env.NEXT_PUBLIC_APP_NAME || 'Monitor Suhu'} - Register
                            </h3>

                            <form onSubmit={handleRegister} className="grid gap-3">
                                <div className="col-12">
                                    <label>Name</label>
                                    <InputText
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full mt-1"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label>Email</label>
                                    <InputText
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full mt-1"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label>Password</label>
                                    <InputText
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full mt-1"
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label>Role</label>
                                    <Dropdown
                                        value={role}
                                        onChange={(e) => setRole(e.value)}
                                        options={roleOptions}
                                        placeholder="Pilih Role"
                                        className="w-full mt-1"
                                        required
                                    />
                                </div>

                                {/* Sudah punya akun */}
                                <p className="text-sm text-gray-600 mt-2 text-right">
                                    Sudah punya akun?{' '}
                                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                                        Login di sini
                                    </Link>
                                </p>

                                {/* Register Button */}
                                <div className="col-12 mt-3">
                                    <Button
                                        label={loading ? 'Memproses...' : 'Register'}
                                        className="w-full"
                                        loading={loading}
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Image Section */}
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

export default RegisterPage;
