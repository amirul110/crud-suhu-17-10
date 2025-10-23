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
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
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

    // State untuk filter
    const [filterNama, setFilterNama] = useState<string>('');
    const [filterEmail, setFilterEmail] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

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
            setFilteredUsers(usersData);
            
            if (usersData.length === 0) {
                toastRef.current?.showToast('info', 'Tidak ada data user');
            } else {
                toastRef.current?.showToast('00', `Berhasil memuat ${usersData.length} data user`);
            }
            
        } catch (err) {
            console.error('❌ Failed to fetch users:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data user';
            toastRef.current?.showToast('99', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk melakukan pencarian
    const handleSearch = () => {
        setIsSearching(true);
        
        // Jika kedua filter kosong, tampilkan semua data
        if (!filterNama.trim() && !filterEmail.trim()) {
            setFilteredUsers(users);
            if (users.length === 0) {
                toastRef.current?.showToast('01', 'Tidak ada data user');
            } else {
                toastRef.current?.showToast('00', `Menampilkan semua ${users.length} data user`);
            }
            setIsSearching(false);
            return;
        }

        // Filter data berdasarkan nama dan/atau email
        const filtered = users.filter(item => {
            const matchNama = filterNama.trim() 
                ? item.name?.toLowerCase().includes(filterNama.toLowerCase())
                : true;
            
            const matchEmail = filterEmail.trim()
                ? item.email?.toLowerCase().includes(filterEmail.toLowerCase())
                : true;

            return matchNama && matchEmail;
        });

        setFilteredUsers(filtered);
        
        // Tampilkan pesan hasil pencarian
        if (filtered.length === 0) {
            toastRef.current?.showToast('01', 'Data user tidak ditemukan dengan filter yang diberikan');
        } else {
            toastRef.current?.showToast('00', `Ditemukan ${filtered.length} data user`);
        }
        
        setIsSearching(false);
    };

    // Fungsi untuk reset filter
    const handleResetFilter = () => {
        setFilterNama('');
        setFilterEmail('');
        setFilteredUsers(users);
        if (users.length > 0) {
            toastRef.current?.showToast('00', `Menampilkan semua ${users.length} data user`);
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

    // Handle enter key pada input filter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="card p-4">
            {/* Header seperti Master Mesin */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Master Data User</h1>
                <div className="flex gap-2">
                    
                </div>
            </div>

            {/* Filter Section seperti Master Mesin */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="field">
                    <label htmlFor="nama-user" className="block text-sm font-medium text-gray-700 mb-2">
                        Nama User
                    </label>
                    <InputText 
                        id="nama-user"
                        value={filterNama}
                        onChange={(e) => setFilterNama(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Cari nama user..." 
                        className="w-full"
                    />
                </div>
                <div className="field">
                    <label htmlFor="email-user" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <InputText 
                        id="email-user"
                        value={filterEmail}
                        onChange={(e) => setFilterEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Cari email..." 
                        className="w-full"
                    />
                </div>
                <div className="field flex items-end gap-2">
                    <Button 
                        label="Cari" 
                        icon="pi pi-search" 
                        className="p-button-primary w-full"
                        onClick={handleSearch}
                        loading={isSearching}
                    />
                    <Button 
                        label="Reset" 
                        icon="pi pi-refresh" 
                        className="p-button-secondary w-full"
                        onClick={handleResetFilter}
                        severity="help"
                    />
                </div>
            </div>

            {/* Action Button seperti Master Mesin */}
            <div className="flex justify-content-between align-items-center my-4">
                <div className="text-sm text-gray-600">
                    {filteredUsers.length > 0 ? (
                        `Menampilkan ${filteredUsers.length} dari ${users.length} user`
                    ) : (
                        'Tidak ada data user'
                    )}
                </div>
                <Button
                    label="Tambah User"
                    icon="pi pi-plus"
                    onClick={() => {
                        resetForm();
                        setAddDialog(true);
                    }}
                    className="p-button-success"
                />
            </div>

            {/* Data Table seperti Master Mesin */}
            <DataTable 
                value={filteredUsers} 
                paginator 
                rows={10}
                rowsPerPageOptions={[5, 10, 20, 50]}
                loading={isLoading}
                scrollable
                scrollHeight="flex"
                emptyMessage="Tidak ada data user yang sesuai dengan filter"
                className="shadow-sm"
                size="small"
            >
                <Column 
                    field="name" 
                    header="Nama User" 
                    sortable 
                    style={{ minWidth: '200px' }}
                />
                <Column 
                    field="email" 
                    header="Email" 
                    sortable 
                    style={{ minWidth: '250px' }}
                />
                <Column 
                    field="role" 
                    header="Role" 
                    sortable
                    style={{ minWidth: '120px' }}
                />
                <Column 
                    header="Status"
                    body={() => (
                        <span className="p-tag p-tag-success">Aktif</span>
                    )}
                    style={{ minWidth: '100px' }}
                />
                <Column
                    header="Aksi"
                    body={(row: User) => (
                        <div className="flex gap-1">
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-warning p-button-sm"
                                tooltip="Edit"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => setupEditForm(row)}
                            />
                            <Button
                                icon="pi pi-trash"
                                className="p-button-danger p-button-sm"
                                tooltip="Hapus"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => handleDeleteUser(row)}
                            />
                        </div>
                    )}
                    style={{ width: '100px' }}
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