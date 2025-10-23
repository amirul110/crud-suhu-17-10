'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Mesin } from '@/types/mesin';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import MesinDialogForm from '@/app/(main)/master/mesin/components/MesinDialogForm';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier, { ToastNotifierHandle } from '@/app/components/ToastNotifier';

const MesinPage = () => {
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [addDialog, setAddDialog] = useState<boolean>(false);
    const [editDialog, setEditDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

    const [mesin, setMesin] = useState<Mesin[]>([]);
    const [filteredMesin, setFilteredMesin] = useState<Mesin[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedMesin, setSelectedMesin] = useState<Mesin | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
    
    // State untuk filter
    const [filterKode, setFilterKode] = useState<string>('');
    const [filterNama, setFilterNama] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const fetchMesin = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/mesin');
            
            if (!res.ok) {
                throw new Error(`Error HTTP! status: ${res.status}`);
            }

            const json = await res.json();
            const body = json.data;

            // Periksa apakah body ada dan memiliki status
            if (body && body.status === '00') {
                const mesinData = body.master_mesin || [];
                setMesin(mesinData);
                setFilteredMesin(mesinData); // Set filtered data sama dengan semua data awal
                if (mesinData.length > 0) {
                    toastRef.current?.showToast(body.status, `Berhasil memuat ${mesinData.length} data mesin`);
                }
            } else {
                const errorMessage = body?.message || 'Response tidak valid dari server';
                const errorStatus = body?.status || '99';
                toastRef.current?.showToast(errorStatus, errorMessage);
            }
        } catch (err) {
            console.error(`Gagal fetch mesin: ${err}`);
            toastRef.current?.showToast('99', 'Gagal memuat data mesin');
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk melakukan pencarian
    const handleSearch = () => {
        setIsSearching(true);
        
        // Jika kedua filter kosong, tampilkan semua data
        if (!filterKode.trim() && !filterNama.trim()) {
            setFilteredMesin(mesin);
            if (mesin.length === 0) {
                toastRef.current?.showToast('01', 'Tidak ada data mesin');
            } else {
                toastRef.current?.showToast('00', `Menampilkan semua ${mesin.length} data mesin`);
            }
            setIsSearching(false);
            return;
        }

        // Filter data berdasarkan kode dan/atau nama
        const filtered = mesin.filter(item => {
            const matchKode = filterKode.trim() 
                ? item.kode_mesin?.toLowerCase().includes(filterKode.toLowerCase())
                : true;
            
            const matchNama = filterNama.trim()
                ? item.nama_mesin?.toLowerCase().includes(filterNama.toLowerCase())
                : true;

            return matchKode && matchNama;
        });

        setFilteredMesin(filtered);
        
        // Tampilkan pesan hasil pencarian
        if (filtered.length === 0) {
            toastRef.current?.showToast('01', 'Data mesin tidak ditemukan dengan filter yang diberikan');
        } else {
            toastRef.current?.showToast('00', `Ditemukan ${filtered.length} data mesin`);
        }
        
        setIsSearching(false);
    };

    // Fungsi untuk reset filter
    const handleResetFilter = () => {
        setFilterKode('');
        setFilterNama('');
        setFilteredMesin(mesin);
        if (mesin.length > 0) {
            toastRef.current?.showToast('00', `Menampilkan semua ${mesin.length} data mesin`);
        }
    };

    // Handle submit form (tambah/edit)
    const handleSubmit = async (data: Mesin) => {
        try {
            console.log('🔄 Mulai submit data mesin...');
            console.log('📝 Dialog mode:', dialogMode);
            console.log('🎯 Data yang dikirim:', data);

            // Validasi data sebelum dikirim
            if (!data.kode_mesin || !data.nama_mesin || data.suhu_maksimal === undefined) {
                toastRef.current?.showToast('01', 'Harap isi semua field yang required');
                return;
            }

            let response;
            let url = '/api/mesin';
            let method = 'POST';

            if (dialogMode === 'edit' && selectedMesin) {
                url = `/api/mesin/${selectedMesin.id}`;
                method = 'PUT';
                console.log('✏️ Mode edit - ID:', selectedMesin.id);
            }

            console.log('🌐 Request ke:', { url, method });

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kode_mesin: data.kode_mesin,
                    nama_mesin: data.nama_mesin,
                    suhu_maksimal: data.suhu_maksimal
                })
            });

            console.log('📨 HTTP Status:', response.status, response.statusText);

            const responseText = await response.text();
            console.log('📦 Response text:', responseText);

            // Parse response
            let json;
            try {
                json = JSON.parse(responseText);
                console.log('📦 Parsed JSON:', json);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                throw new Error('Format response tidak valid dari server');
            }

            // Validasi struktur response
            if (!json.data) {
                console.error('❌ Tidak ada data dalam response:', json);
                throw new Error('Struktur response tidak valid - data tidak ditemukan');
            }

            const body = json.data;
            console.log('🔍 Response body:', body);

            // Handle response berdasarkan status
            if (body.status === '00' || response.ok) {
                const successMessage = body.message || 
                    (dialogMode === 'add' ? 'Mesin berhasil ditambahkan' : 'Mesin berhasil diupdate');
                
                toastRef.current?.showToast('00', successMessage);
                console.log('✅ Operasi berhasil:', successMessage);
                
                // Refresh data untuk memastikan konsistensi
                await fetchMesin();
                
                // Tutup dialog
                setDialogMode(null);
                setSelectedMesin(null);
                
            } else {
                // Handle error response
                const errorStatus = body.status || '01';
                const errorMessage = body.message || 'Terjadi kesalahan tidak diketahui';
                console.error('❌ Error dari server:', { status: errorStatus, message: errorMessage });
                toastRef.current?.showToast(errorStatus, errorMessage);
            }

        } catch (err) {
            console.error('💥 Error dalam handleSubmit:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal terhubung ke server';
            toastRef.current?.showToast('99', errorMessage);
        }
    };

    const handleDelete = async (mesinToDelete: Mesin) => {
        try {
            console.log('Menghapus mesin ID:', mesinToDelete.id);
            
            const res = await fetch(`/api/mesin/${mesinToDelete.id}`, {
                method: 'DELETE'
            });

            console.log('Status response:', res.status);
            
            if (!res.ok) {
                throw new Error(`Error HTTP! status: ${res.status}`);
            }

            const text = await res.text();
            console.log('Response mentah:', text);

            let json;
            try {
                json = JSON.parse(text);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Format response dari server tidak valid');
            }

            console.log('JSON parsed:', json);

            // Periksa apakah data ada dalam response
            if (!json.data) {
                console.error('Tidak ada data dalam response:', json);
                toastRef.current?.showToast('99', 'Struktur response tidak valid');
                return;
            }

            const body = json.data;

            if (body.status === '00') {
                toastRef.current?.showToast(body.status, body.message);
                // Refresh data setelah hapus
                await fetchMesin();
            } else {
                toastRef.current?.showToast(body.status, body.message);
            }
            
        } catch (err) {
            console.error('Error hapus mesin:', err);
            const message = err instanceof Error ? err.message : 'Gagal terhubung ke server.';
            toastRef.current?.showToast('99', message);
        }
    };

    // Handle enter key pada input filter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        fetchMesin();
    }, []);

    return (
        <div className="card p-4">
            {/* Header seperti contoh Master Data Pasien */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Master Data Mesin</h1>
                <div className="flex gap-2">
                   
                </div>
            </div>

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="field">
                    <label htmlFor="kode-mesin" className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Mesin
                    </label>
                    <InputText 
                        id="kode-mesin"
                        value={filterKode}
                        onChange={(e) => setFilterKode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Cari kode mesin..." 
                        className="w-full"
                    />
                </div>
                <div className="field">
                    <label htmlFor="nama-mesin" className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Mesin
                    </label>
                    <InputText 
                        id="nama-mesin"
                        value={filterNama}
                        onChange={(e) => setFilterNama(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Cari nama mesin..." 
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

            {/* Action Button */}
            <div className="flex justify-content-between align-items-center my-4">
                <div className="text-sm text-gray-600">
                    {filteredMesin.length > 0 ? (
                        `Menampilkan ${filteredMesin.length} dari ${mesin.length} mesin`
                    ) : (
                        'Tidak ada data mesin'
                    )}
                </div>
                <Button
                    label="Tambah Mesin"
                    icon="pi pi-plus"
                    onClick={() => {
                        setDialogMode('add');
                        setSelectedMesin(null);
                    }}
                    className="p-button-success"
                />
            </div>

            {/* Data Table */}
            <DataTable 
                value={filteredMesin} 
                paginator 
                rows={10}
                rowsPerPageOptions={[5, 10, 20, 50]}
                loading={isLoading}
                scrollable
                scrollHeight="flex"
                emptyMessage="Tidak ada data mesin yang sesuai dengan filter"
                className="shadow-sm"
                size="small"
            >
                <Column 
                    field="kode_mesin" 
                    header="Kode Mesin" 
                    sortable 
                    style={{ minWidth: '120px' }}
                />
                <Column 
                    field="nama_mesin" 
                    header="Nama Mesin" 
                    sortable 
                    style={{ minWidth: '200px' }}
                />
                <Column 
                    field="suhu_maksimal" 
                    header="Suhu Maksimal" 
                    sortable
                    body={(row) => `${row.suhu_maksimal}°C`}
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
                    body={(row: Mesin) => (
                        <div className="flex gap-1">
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-warning p-button-sm"
                                tooltip="Edit"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => {
                                    setSelectedMesin(row);
                                    setDialogMode('edit');
                                }}
                            />
                            <Button
                                icon="pi pi-trash"
                                className="p-button-danger p-button-sm"
                                tooltip="Hapus"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => {
                                    confirmDialog({
                                        message: `Yakin ingin menghapus mesin "${row.nama_mesin}" (${row.kode_mesin})?`,
                                        header: 'Konfirmasi Hapus',
                                        icon: 'pi pi-exclamation-triangle',
                                        acceptLabel: 'Hapus',
                                        rejectLabel: 'Batal',
                                        acceptClassName: 'p-button-danger',
                                        accept: () => handleDelete(row)
                                    });
                                }}
                            />
                        </div>
                    )}
                    style={{ width: '100px' }}
                />
            </DataTable>

            <ConfirmDialog />

            {/* Komponen form dialog yang sebenarnya digunakan */}
            <MesinDialogForm
                visible={dialogMode !== null}
                mode={dialogMode}
                initialData={selectedMesin}
                onHide={() => {
                    setDialogMode(null);
                    setSelectedMesin(null);
                }}
                onSubmit={handleSubmit}
            />

            <ToastNotifier ref={toastRef} />
        </div>
    );
};

export default MesinPage;