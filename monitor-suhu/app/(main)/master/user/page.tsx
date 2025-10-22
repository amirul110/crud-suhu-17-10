'use client';

import { User } from '@/types/user';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier, { ToastNotifierHandle } from '@/app/components/ToastNotifier';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

const UserPage = () => {
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [addDialog, setAddDialog] = useState<boolean>(false);
    const [editDialog, setEditDialog] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        role: ''
    });

    const roleOptions = [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' }
    ];

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Fetching users...');
            const res = await fetch('/api/users');
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const json = await res.json();
            console.log('📦 Users API Response:', json);
            
            // Handle different response structures
            let usersData: User[] = [];
            
            if (json.data) {
                // Case 1: { data: { status: '00', users: [...] } }
                if (json.data.status === '00' && json.data.users) {
                    usersData = json.data.users;
                }
                // Case 2: { data: { status: '00', data: [...] } }
                else if (json.data.status === '00' && json.data.data) {
                    usersData = json.data.data;
                }
                // Case 3: { data: [...] } (direct array)
                else if (Array.isArray(json.data)) {
                    usersData = json.data;
                }
                // Case 4: { data: { users: [...] } }
                else if (json.data.users && Array.isArray(json.data.users)) {
                    usersData = json.data.users;
                }
                // Case 5: Backend returns data directly
                else if (Array.isArray(json.data)) {
                    usersData = json.data;
                }
            }
            
            console.log('👥 Extracted users:', usersData);
            setUsers(usersData);
            
            if (usersData.length === 0) {
                toastRef.current?.showToast('info', 'Tidak ada data user');
            }
            
        } catch (err) {
            console.error('❌ Failed to fetch users:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data user';
            toastRef.current?.showToast('99', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: ''
        });
        setSelectedUser(null);
    };

    const handleInputChange = (field: keyof UserFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            console.log('➕ Adding new user:', formData);
            
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const json = await res.json();
            console.log('📨 Add user response:', json);
            
            if (json.data?.status === '00') {
                toastRef.current?.showToast('00', json.data?.message || 'User berhasil ditambahkan');
                setAddDialog(false);
                resetForm();
                fetchUsers(); // Refresh data
            } else {
                toastRef.current?.showToast('99', json.data?.message || 'Gagal menambah user');
            }
        } catch (err) {
            console.error('❌ Add user error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal menambah user';
            toastRef.current?.showToast('99', errorMessage);
        }
    };

const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
        console.log('✏️ Updating user ID:', selectedUser.id);
        
        const updateData = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            ...(formData.password && { password: formData.password })
        };

        const res = await fetch(`/api/users/${selectedUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        const json = await res.json();
        
        if (!res.ok) {
            // Gunakan message dari backend jika ada
            const errorMessage = json.data?.message || 'Gagal mengupdate user';
            throw new Error(errorMessage);
        }

        if (json.data?.status === '00') {
            toastRef.current?.showToast('00', json.data?.message || 'User berhasil diupdate');
            setEditDialog(false);
            resetForm();
            fetchUsers();
        } else {
            throw new Error(json.data?.message || 'Gagal update user');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
        toastRef.current?.showToast('99', errorMessage);
    }
};
    const handleDeleteUser = async (user: User) => {
        confirmDialog({
            message: `Yakin ingin menghapus user "${user.name}"?`,
            header: 'Konfirmasi Hapus',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Hapus',
            rejectLabel: 'Batal',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    console.log('🗑️ Deleting user:', user.id);
                    
                    const res = await fetch(`/api/users/${user.id}`, {
                        method: 'DELETE'
                    });

                    const json = await res.json();
                    console.log('📨 Delete user response:', json);
                    
                    if (json.data?.status === '00') {
                        toastRef.current?.showToast('00', json.data?.message || 'User berhasil dihapus');
                        fetchUsers();
                    } else {
                        toastRef.current?.showToast('99', json.data?.message || 'Gagal menghapus user');
                    }
                } catch (err) {
                    console.error('❌ Delete user error:', err);
                    const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus user';
                    toastRef.current?.showToast('99', errorMessage);
                }
            }
        });
    };

    const setupEditForm = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '', // Password usually empty in edit
            role: user.role || ''
        });
        setEditDialog(true);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="card">
            <h3 className="text-xl font-semibold">Master User</h3>

            <div className="flex justify-content-between items-center my-3">
                <Button 
                    label="Refresh" 
                    icon="pi pi-refresh" 
                    className="text-sm p-button-outlined"
                    onClick={fetchUsers}
                    loading={isLoading}
                />
                <Button 
                    label="Tambah User" 
                    icon="pi pi-plus" 
                    className="text-sm" 
                    onClick={() => {
                        resetForm();
                        setAddDialog(true);
                    }} 
                />
            </div>

            <DataTable 
                size="small" 
                className="text-sm" 
                value={users} 
                paginator 
                rows={10} 
                loading={isLoading} 
                scrollable
                emptyMessage="Tidak ada data user"
            >
                <Column field="name" header="Nama User" filter sortable />
                <Column field="email" header="Email" filter sortable />
                <Column field="role" header="Role" filter sortable />
                <Column
                    header="Aksi"
                    body={(row: User) => (
                        <div className="flex gap-2">
                            <Button 
                                icon="pi pi-pencil" 
                                size="small" 
                                severity="warning" 
                                tooltip="Edit User"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => setupEditForm(row)} 
                            />
                            <Button 
                                icon="pi pi-trash" 
                                size="small" 
                                severity="danger" 
                                tooltip="Hapus User"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => handleDeleteUser(row)} 
                            />
                        </div>
                    )}
                    style={{ width: '120px' }}
                />
            </DataTable>

            {/* Add User Dialog */}
            <Dialog 
                header="Tambah User" 
                visible={addDialog} 
                onHide={() => setAddDialog(false)} 
                className="w-11 md:w-6 lg:w-5"
            >
                <form onSubmit={handleAddUser}>
                    <div className="mb-3">
                        <label htmlFor="name" className="block font-medium mb-2">Nama User *</label>
                        <InputText 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            type="text" 
                            className="w-full" 
                            placeholder="Masukkan nama user" 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="block font-medium mb-2">Email *</label>
                        <InputText 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            type="email" 
                            className="w-full" 
                            placeholder="Masukkan email" 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="block font-medium mb-2">Password *</label>
                        <InputText 
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            type="password" 
                            className="w-full" 
                            placeholder="Masukkan password" 
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role" className="block font-medium mb-2">Role *</label>
                        <Dropdown 
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.value)}
                            options={roleOptions} 
                            className="w-full" 
                            placeholder="Pilih Role"
                            required
                        />
                    </div>

                    <div className="flex justify-content-end gap-2">
                        <Button 
                            type="button" 
                            label="Batal" 
                            severity="secondary" 
                            onClick={() => setAddDialog(false)} 
                        />
                        <Button 
                            type="submit" 
                            label="Simpan" 
                            severity="success" 
                            icon="pi pi-save" 
                        />
                    </div>
                </form>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog 
                header="Edit User" 
                visible={editDialog} 
                onHide={() => setEditDialog(false)} 
                className="w-11 md:w-6 lg:w-5"
            >
                <form onSubmit={handleEditUser}>
                    <div className="mb-3">
                        <label htmlFor="name" className="block font-medium mb-2">Nama User *</label>
                        <InputText 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            type="text" 
                            className="w-full" 
                            placeholder="Masukkan nama user" 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="block font-medium mb-2">Email *</label>
                        <InputText 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            type="email" 
                            className="w-full" 
                            placeholder="Masukkan email" 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="block font-medium mb-2">Password</label>
                        <InputText 
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            type="password" 
                            className="w-full" 
                            placeholder="Kosongkan jika tidak ingin mengubah password" 
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role" className="block font-medium mb-2">Role *</label>
                        <Dropdown 
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.value)}
                            options={roleOptions} 
                            className="w-full" 
                            placeholder="Pilih Role"
                            required
                        />
                    </div>

                    <div className="flex justify-content-end gap-2">
                        <Button 
                            type="button" 
                            label="Batal" 
                            severity="secondary" 
                            onClick={() => setEditDialog(false)} 
                        />
                        <Button 
                            type="submit" 
                            label="Update" 
                            severity="warning" 
                            icon="pi pi-save" 
                        />
                    </div>
                </form>
            </Dialog>

            <ConfirmDialog />
            <ToastNotifier ref={toastRef} />
        </div>
    );
};

export default UserPage;