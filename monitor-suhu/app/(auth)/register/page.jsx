'use client';

import { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import '@/styles/gradient.css';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // default role user
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const router = useRouter();

    const roleOptions = [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' }
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

            if (json.data?.status === '00') {
                showToast('success', 'Register Berhasil', 'Silakan login menggunakan akun baru Anda');
                setTimeout(() => router.push('/auth/login'), 1000);
            } else {
                showToast('error', 'Register Gagal', json.data?.message || 'Terjadi kesalahan');
            }
        } catch (err) {
            showToast('error', 'Error', err.message || 'Terjadi kesalahan server');
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
                        <div className="col-12 md:col-6 flex flex-col justify-center h-full px-4">
                            <h3 className="text-2xl text-center font-semibold mb-5">Register</h3>
                            <form className="grid" onSubmit={handleRegister}>
                                <div className="col-12 mb-3">
                                    <label htmlFor="name">Nama</label>
                                    <InputText
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full mt-2"
                                        required
                                    />
                                </div>
                                <div className="col-12 mb-3">
                                    <label htmlFor="email">Email</label>
                                    <InputText
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full mt-2"
                                        required
                                    />
                                </div>
                                <div className="col-12 mb-3">
                                    <label htmlFor="password">Password</label>
                                    <InputText
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full mt-2"
                                        required
                                    />
                                </div>
                                <div className="col-12 mb-4">
                                    <label htmlFor="role">Role</label>
                                    <Dropdown
                                        id="role"
                                        value={role}
                                        options={roleOptions}
                                        onChange={(e) => setRole(e.value)}
                                        placeholder="Pilih Role"
                                        className="w-full mt-2"
                                    />
                                </div>

                                <div className="col-12">
                                    <Button
                                        label={loading ? 'Memproses...' : 'Register'}
                                        loading={loading}
                                        className="w-full"
                                        type="submit"
                                    />
                                </div>
                            </form>

                            <p className="mt-3 text-center">
                                Sudah punya akun? <a href="/auth/login" className="text-blue-500">Login</a>
                            </p>
                        </div>

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
