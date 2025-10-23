'use client';

import SuhuDialogForm from '@/app/(main)/monitor/suhu/components/SuhuDialogForm';
import { Mesin } from '@/types/mesin';
import { MonitorSuhu } from '@/types/monitor-suhu';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useEffect, useRef, useState } from 'react';
import { formatISODate } from '@/utils/format-iso-date';
import { FileUpload } from 'primereact/fileupload';
import ToastNotifier, { ToastNotifierHandle } from '@/app/components/ToastNotifier';

const SuhuPage = () => {
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [monitorSuhu, setMonitorSuhu] = useState<MonitorSuhu[]>([]);
    const [filteredMonitorSuhu, setFilteredMonitorSuhu] = useState<MonitorSuhu[]>([]);
    const [mesin, setMesin] = useState<Mesin[]>([]);
    const [selectedMonitorSuhu, setSelectedMonitorSuhu] = useState<MonitorSuhu | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
    const [fileUploadDialog, setFileUploadDialog] = useState<boolean>(false);

    // State untuk filter
    const [filterKode, setFilterKode] = useState<string>('');
    const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
    const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const fetchMasterMesin = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/mesin');
            const json = await res.json();

            setMesin(json.data.master_mesin);
        } catch (err) {
            console.error(`Failed to fetch: ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMonitorSuhu = async () => {
        try {
            const response = await fetch('/api/monitor-suhu', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();
            console.log('📡 monitor-suhu result:', result);

            if (result.status === '00' && Array.isArray(result.data)) {
                setMonitorSuhu(result.data);
                setFilteredMonitorSuhu(result.data);
                toastRef.current?.showToast('00', `Berhasil memuat ${result.data.length} data suhu`);
            } else {
                setMonitorSuhu([]);
                setFilteredMonitorSuhu([]);
                toastRef.current?.showToast('info', 'Tidak ada data suhu');
            }
        } catch (error) {
            console.error('🔧 fetchMonitorSuhu error:', error);
            setMonitorSuhu([]);
            setFilteredMonitorSuhu([]);
            toastRef.current?.showToast('99', 'Gagal memuat data suhu');
        }
    };

    // Fungsi untuk melakukan pencarian berdasarkan tanggal
    const handleTerapkanFilter = () => {
        setIsSearching(true);
        
        // Jika semua filter kosong, tampilkan semua data
        if (!filterKode.trim() && !tanggalMulai && !tanggalSelesai) {
            setFilteredMonitorSuhu(monitorSuhu);
            if (monitorSuhu.length === 0) {
                toastRef.current?.showToast('01', 'Tidak ada data suhu');
            } else {
                toastRef.current?.showToast('00', `Menampilkan semua ${monitorSuhu.length} data suhu`);
            }
            setIsSearching(false);
            return;
        }

        // Filter data berdasarkan kode dan/atau rentang tanggal
        const filtered = monitorSuhu.filter(item => {
            const matchKode = filterKode.trim() 
                ? item.kode_mesin?.toLowerCase().includes(filterKode.toLowerCase())
                : true;
            
            // Filter berdasarkan rentang tanggal
            let matchTanggal = true;
            if (tanggalMulai || tanggalSelesai) {
                const itemDate = new Date(item.tanggal_input);
                
                if (tanggalMulai && tanggalSelesai) {
                    // Filter antara tanggal mulai dan selesai
                    matchTanggal = itemDate >= tanggalMulai && itemDate <= tanggalSelesai;
                } else if (tanggalMulai) {
                    // Filter dari tanggal mulai ke atas
                    matchTanggal = itemDate >= tanggalMulai;
                } else if (tanggalSelesai) {
                    // Filter sampai tanggal selesai
                    matchTanggal = itemDate <= tanggalSelesai;
                }
            }

            return matchKode && matchTanggal;
        });

        setFilteredMonitorSuhu(filtered);
        
        // Tampilkan pesan hasil pencarian
        if (filtered.length === 0) {
            toastRef.current?.showToast('01', 'Data suhu tidak ditemukan dengan filter yang diberikan');
        } else {
            let message = `Ditemukan ${filtered.length} data suhu`;
            if (tanggalMulai || tanggalSelesai) {
                const formatDate = (date: Date) => date.toLocaleDateString('id-ID');
                if (tanggalMulai && tanggalSelesai) {
                    message += ` dari ${formatDate(tanggalMulai)} sampai ${formatDate(tanggalSelesai)}`;
                } else if (tanggalMulai) {
                    message += ` dari ${formatDate(tanggalMulai)}`;
                } else if (tanggalSelesai) {
                    message += ` sampai ${formatDate(tanggalSelesai)}`;
                }
            }
            toastRef.current?.showToast('00', message);
        }
        
        setIsSearching(false);
    };

    // Fungsi untuk reset filter
    const handleBatalFilter = () => {
        setFilterKode('');
        setTanggalMulai(null);
        setTanggalSelesai(null);
        setFilteredMonitorSuhu(monitorSuhu);
        if (monitorSuhu.length > 0) {
            toastRef.current?.showToast('00', `Menampilkan semua ${monitorSuhu.length} data suhu`);
        }
    };

    const handleSubmit = async (data: MonitorSuhu) => {
        try {
            let response;
            let url = '/api/monitor-suhu';
            let method = 'POST';

            if (dialogMode === 'edit' && selectedMonitorSuhu) {
                url = `/api/monitor-suhu/${selectedMonitorSuhu.id}`;
                method = 'PUT';
            }

            console.log(`🔄 ${method} request to:`, url);
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            console.log('📦 Response:', json);

            if (json.data?.status === '00') {
                toastRef.current?.showToast('00', json.data?.message || 'Operasi berhasil');
                
                if (dialogMode === 'add') {
                    const updated = json.data.monitor_suhu;
                    setMonitorSuhu((prev) => [...prev, updated]);
                    setFilteredMonitorSuhu((prev) => [...prev, updated]);
                } else if (dialogMode === 'edit') {
                    const updated = json.data.monitor_suhu;
                    setMonitorSuhu((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                    setFilteredMonitorSuhu((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                }
                
                setDialogMode(null);
                setSelectedMonitorSuhu(null);
                
            } else {
                toastRef.current?.showToast('99', json.data?.message || 'Terjadi kesalahan');
            }

        } catch (err) {
            console.error('💥 Submit error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
            toastRef.current?.showToast('99', errorMessage);
        }
    };

    const handleDelete = async (row: MonitorSuhu) => {
        try {
            console.log('🗑️ Deleting monitor suhu ID:', row.id);
            
            const res = await fetch(`/api/monitor-suhu/${row.id}`, {
                method: 'DELETE'
            });

            console.log('📨 Delete response status:', res.status);

            const responseText = await res.text();
            console.log('📦 Delete response text:', responseText);

            let json;
            try {
                json = JSON.parse(responseText);
                console.log('📦 Parsed JSON:', json);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error('Response tidak valid dari server');
            }

            if (json.data?.data?.status === '00') {
                toastRef.current?.showToast('00', json.data.data.message || 'Data berhasil dihapus');
                setMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                setFilteredMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                
            } else if (json.data?.status === '00') {
                toastRef.current?.showToast('00', json.data.message || 'Data berhasil dihapus');
                setMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                setFilteredMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                
            } else {
                const errorMessage = json.data?.data?.message || json.data?.message || json.message || 'Gagal menghapus data';
                console.error('❌ Backend error:', errorMessage);
                toastRef.current?.showToast('99', errorMessage);
            }

        } catch (err) {
            console.error('💥 Delete error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data';
            toastRef.current?.showToast('99', errorMessage);
        }
    };

    useEffect(() => {
        fetchMonitorSuhu();
        fetchMasterMesin();
    }, []);

    return (
        <div className="card p-4">
            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Monitor Data Suhu</h1>
                <div className="flex gap-2">
                    <Button
                        label="Mulai"
                        icon="pi pi-play"
                        className="p-button-success"
                    />
                    <Button
                        label="Selesai"
                        icon="pi pi-check"
                        className="p-button-primary"
                    />
                    <Button
                        label="Terapkan"
                        icon="pi pi-cog"
                        className="p-button-help"
                    />
                </div>
            </div>

            {/* Filter Section dengan Tanggal Mulai dan Selesai */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="field">
                    <label htmlFor="kode-mesin" className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Mesin
                    </label>
                    <InputText 
                        id="kode-mesin"
                        value={filterKode}
                        onChange={(e) => setFilterKode(e.target.value)}
                        placeholder="Cari kode mesin..." 
                        className="w-full"
                    />
                </div>
                
                <div className="field">
                    <label htmlFor="tanggal-mulai" className="block text-sm font-medium text-gray-700 mb-2">
                        Mulai
                    </label>
                    <Calendar 
                        id="tanggal-mulai"
                        value={tanggalMulai}
                        onChange={(e) => setTanggalMulai(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        placeholder="Tanggal mulai"
                        className="w-full"
                        showIcon
                    />
                </div>
                
                <div className="field">
                    <label htmlFor="tanggal-selesai" className="block text-sm font-medium text-gray-700 mb-2">
                        Sampai
                    </label>
                    <Calendar 
                        id="tanggal-selesai"
                        value={tanggalSelesai}
                        onChange={(e) => setTanggalSelesai(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        placeholder="Tanggal selesai"
                        className="w-full"
                        showIcon
                    />
                </div>
                
                <div className="field flex items-end gap-2">
                    <Button 
                        label="Terapkan" 
                        icon="pi pi-check" 
                        className="p-button-primary w-full"
                        onClick={handleTerapkanFilter}
                        loading={isSearching}
                    />
                    <Button 
                        label="Batal" 
                        icon="pi pi-times" 
                        className="p-button-secondary w-full"
                        onClick={handleBatalFilter}
                        severity="help"
                    />
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-content-between align-items-center my-4">
                <div className="text-sm text-gray-600">
                    {filteredMonitorSuhu.length > 0 ? (
                        `Menampilkan ${filteredMonitorSuhu.length} dari ${monitorSuhu.length} data suhu`
                    ) : (
                        'Tidak ada data suhu'
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        label="Import Excel"
                        icon="pi pi-file"
                        onClick={() => setFileUploadDialog(true)}
                        className="p-button-info"
                    />
                    <Button
                        label="Tambah Data"
                        icon="pi pi-plus"
                        onClick={() => {
                            setDialogMode('add');
                            setSelectedMonitorSuhu(null);
                        }}
                        className="p-button-success"
                    />
                </div>
            </div>

            {/* Data Table */}
            <DataTable 
                value={filteredMonitorSuhu} 
                paginator 
                rows={10}
                rowsPerPageOptions={[5, 10, 20, 50]}
                loading={isLoading}
                scrollable
                scrollHeight="flex"
                emptyMessage="Tidak ada data suhu yang sesuai dengan filter"
                className="shadow-sm"
                size="small"
            >
                <Column 
                    field="kode_mesin" 
                    header="Kode Mesin" 
                    sortable 
                    style={{ minWidth: '150px' }}
                />
                <Column 
                    field="tanggal_input" 
                    header="Tanggal Input" 
                    sortable
                    body={(row) => formatISODate(row.tanggal_input)}
                    style={{ minWidth: '180px' }}
                />
                <Column 
                    field="keterangan_suhu" 
                    header="Suhu (°C)" 
                    sortable
                    body={(row) => `${row.keterangan_suhu}°C`}
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
                    body={(row: MonitorSuhu) => (
                        <div className="flex gap-1">
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-warning p-button-sm"
                                tooltip="Edit"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => {
                                    setSelectedMonitorSuhu(row);
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
                                        message: `Yakin ingin menghapus data suhu untuk mesin ${row.kode_mesin}?`,
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

            {/* Komponen form dialog */}
            <SuhuDialogForm
                visible={dialogMode !== null}
                mode={dialogMode}
                initialData={selectedMonitorSuhu}
                mesin={mesin}
                onHide={() => {
                    setDialogMode(null);
                    setSelectedMonitorSuhu(null);
                }}
                onSubmit={handleSubmit}
            />

            {/* Dialog Import Excel */}
            <Dialog 
                style={{ minWidth: '70vw' }} 
                header="Import Data Excel" 
                visible={fileUploadDialog} 
                onHide={() => setFileUploadDialog(false)}
            >
                <FileUpload
                    name="file"
                    url="/api/monitor-suhu/import"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    chooseLabel="Upload Excel"
                    customUpload
                    uploadHandler={async (event) => {
                        const file = event.files[0];
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                            const res = await fetch('/api/monitor-suhu/import', {
                                method: 'POST',
                                body: formData
                            });

                            const json = await res.json();
                            console.log('📦 Import response:', json);

                            if (!res.ok) {
                                throw new Error(json.message || 'Import failed');
                            }

                            if (json.data?.status === '00') {
                                toastRef.current?.showToast(json.data.status, json.data.message);
                                await fetchMonitorSuhu(); // Refresh data
                                setFileUploadDialog(false);
                            } else {
                                toastRef.current?.showToast(json.data?.status || '99', json.data?.message || 'Import gagal');
                            }
                        } catch (err) {
                            console.error(`💥 Import Error: ${(err as Error).message}`);
                            toastRef.current?.showToast('99', 'Gagal mengimport data');
                        }
                    }}
                />
            </Dialog>

            <ToastNotifier ref={toastRef} />
        </div>
    );
};

export default SuhuPage;