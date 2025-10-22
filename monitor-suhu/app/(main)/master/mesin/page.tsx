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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedMesin, setSelectedMesin] = useState<Mesin | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);

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
                toastRef.current?.showToast(body.status, body.message);
                setMesin(body.master_mesin || []);
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
            
            // Update state berdasarkan mode
            if (dialogMode === 'add') {
                const newMesin = body.master_mesin || body.data;
                if (newMesin) {
                    console.log('➕ Data mesin baru:', newMesin);
                    setMesin((prev) => [...prev, newMesin]);
                }
            } else if (dialogMode === 'edit') {
                const updatedMesin = body.master_mesin || body.data;
                if (updatedMesin) {
                    console.log('✏️ Data mesin updated:', updatedMesin);
                    setMesin((prev) => prev.map((item) => 
                        item.id === updatedMesin.id ? updatedMesin : item
                    ));
                }
            }
            
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
                setMesin((prev) => prev.filter((item) => item.id !== mesinToDelete.id));
            } else {
                toastRef.current?.showToast(body.status, body.message);
            }
            
        } catch (err) {
            console.error('Error hapus mesin:', err);
            const message = err instanceof Error ? err.message : 'Gagal terhubung ke server.';
            toastRef.current?.showToast('99', message);
        }
    };

    useEffect(() => {
        fetchMesin();
    }, []);

    return (
        <div className="card">
            <h3 className="text-xl font-semibold">Master Mesin</h3>

            <div className="flex justify-content-end my-3">
                <Button
                    label="Tambah Mesin"
                    icon="pi pi-plus"
                    onClick={() => {
                        setDialogMode('add');
                        setSelectedMesin(null);
                    }}
                />
            </div>

            <DataTable 
                size="small" 
                className="text-sm" 
                value={mesin} 
                paginator 
                rows={10} 
                loading={isLoading} 
                scrollable
                emptyMessage="Tidak ada data mesin"
            >
                <Column field="kode_mesin" header="Kode Mesin" filter />
                <Column field="nama_mesin" header="Nama Mesin" filter />
                <Column header="Suhu Maksimal" field="suhu_maksimal" body={(row) => `${row.suhu_maksimal}°C`} />
                <Column
                    header="Aksi"
                    body={(row: Mesin) => (
                        <div className="flex gap-2">
                            <Button
                                icon="pi pi-pencil text-sm"
                                size="small"
                                severity="warning"
                                onClick={() => {
                                    setSelectedMesin(row);
                                    setDialogMode('edit');
                                }}
                            />
                            <Button
                                icon="pi pi-trash text-sm"
                                size="small"
                                severity="danger"
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
                    style={{ width: '150px' }}
                />
            </DataTable>

            <ConfirmDialog />

            {/* Dialog untuk edit manual (tidak digunakan jika menggunakan MesinDialogForm) */}
            <Dialog header={`Update Data ${selectedMesin?.kode_mesin}`} visible={editDialog} onHide={() => setEditDialog(false)}>
                <form>
                    <div className="mb-3">
                        <label htmlFor="kode-mesin">Kode Mesin</label>
                        <InputText value={selectedMesin?.kode_mesin} type="text" className="w-full mt-3" placeholder="Kode Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nama-mesin">Nama Mesin</label>
                        <InputText value={selectedMesin?.nama_mesin} type="text" className="w-full mt-3" placeholder="Nama Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="suhu-maksiaml">Suhu Maksimal Mesin</label>
                        <div className="p-inputgroup mt-3">
                            <InputNumber value={selectedMesin?.suhu_maksimal} placeholder="Suhu Maksimal Mesin" useGrouping={false} />
                            <span className="p-inputgroup-addon">°C</span>
                        </div>
                    </div>

                    <div className="flex justify-content-end">
                        <Button label="Submit" severity="success" icon="pi pi-save" />
                    </div>
                </form>
            </Dialog>

            {/* Dialog untuk tambah manual (tidak digunakan jika menggunakan MesinDialogForm) */}
            <Dialog header="Tambah Data Master Mesin" visible={addDialog} onHide={() => setAddDialog(false)}>
                <form>
                    <div className="mb-3">
                        <label htmlFor="kode-mesin">Kode Mesin</label>
                        <InputText type="text" className="w-full mt-3" placeholder="Kode Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nama-mesin">Nama Mesin</label>
                        <InputText type="text" className="w-full mt-3" placeholder="Nama Mesin" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="suhu-maksiaml">Suhu Maksimal Mesin</label>
                        <div className="p-inputgroup mt-3">
                            <InputNumber type="text" placeholder="Suhu Maksimal Mesin" useGrouping={false} />
                            <span className="p-inputgroup-addon">°C</span>
                        </div>
                    </div>

                    <div className="flex justify-content-end">
                        <Button label="Submit" severity="success" icon="pi pi-save" />
                    </div>
                </form>
            </Dialog>

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