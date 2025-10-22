'use client';

import SuhuDialogForm from '@/app/(main)/monitor/suhu/components/SuhuDialogForm';
import { Mesin } from '@/types/mesin';
import { MonitorSuhu } from '@/types/monitor-suhu';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { useEffect, useRef, useState } from 'react';
import { formatISODate } from '@/utils/format-iso-date';
import { FileUpload } from 'primereact/fileupload';
import ToastNotifier, { ToastNotifierHandle } from '@/app/components/ToastNotifier';

const SuhuPage = () => {
    const toastRef = useRef<ToastNotifierHandle>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [monitorSuhu, setMonitorSuhu] = useState<MonitorSuhu[]>([]);
    const [mesin, setMesin] = useState<Mesin[]>([]);
    const [selectedMonitorSuhu, setSelectedMonitorSuhu] = useState<MonitorSuhu | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
    const [fileUploadDialog, setFileUploadDialog] = useState<boolean>(false);

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

// In your page.tsx - update fetchMonitorSuhu function
const fetchMonitorSuhu = async () => {
  try {
    const response = await fetch('/api/monitor-suhu', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    console.log('📡 monitor-suhu result:', result);

    if (result.status === '00' && Array.isArray(result.data)) {
      setMonitorSuhu(result.data); // ⬅️ simpan langsung
    } else {
      setMonitorSuhu([]); // kosongkan kalau tidak valid
    }
  } catch (error) {
    console.error('🔧 fetchMonitorSuhu error:', error);
    setMonitorSuhu([]);
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

        // ✅ PERBAIKI: Handle berdasarkan status response
        if (json.data?.status === '00') {
            toastRef.current?.showToast('00', json.data?.message || 'Operasi berhasil');
            
            if (dialogMode === 'add') {
                const updated = json.data.monitor_suhu;
                setMonitorSuhu((prev) => [...prev, updated]);
            } else if (dialogMode === 'edit') {
                const updated = json.data.monitor_suhu;
                setMonitorSuhu((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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

    useEffect(() => {
        fetchMonitorSuhu();
        fetchMasterMesin();
    }, []);

    return (
        <div className="card">
            <h3 className="text-xl font-semibold">Update Suhu Mesin</h3>
            <div className="flex justify-content-end gap-3 my-3">
                <Button className="text-sm" label="Import excel" icon="pi pi-file" onClick={() => setFileUploadDialog(true)} size="small" />
                <Button
                    className="text-sm"
                    label="Tambah Data"
                    icon="pi pi-plus"
                    onClick={() => {
                        // setAddDialog(true)
                        setDialogMode('add');
                        setSelectedMonitorSuhu(null);
                    }}
                    size="small"
                />
            </div>
            <DataTable size="small" className="text-sm" value={monitorSuhu} paginator rows={10} loading={isLoading} scrollable>
                <Column field="kode_mesin" header="Kode Mesin" filter />
                <Column
                    field="tanggal_input"
                    header="Tanggal Input"
                    body={(row) => {
                        // `${new Date(row.tanggal_input)}`
                        return formatISODate(row.tanggal_input);
                    }}
                    sortable
                />
                <Column field="keterangan_suhu" header="Keterangan Suhu" body={(row) => `${row.keterangan_suhu}°C`} />

                <Column
                    header="Aksi"
                    body={(row: MonitorSuhu) => (
                        <div className="flex gap-2">
                            <Button
                                icon="pi pi-pencil text-sm"
                                size="small"
                                severity="warning"
                                onClick={() => {
                                    // setEditDialog(true);
                                    setSelectedMonitorSuhu(row);
                                    setDialogMode('edit');
                                }}
                            />
                        <Button
    icon="pi pi-trash text-sm"
    size="small"
    severity="danger"
    onClick={() => {
        confirmDialog({
            message: `Yakin ingin menghapus data suhu untuk mesin ${row.kode_mesin}?`,
            header: 'Konfirmasi Hapus',
            acceptLabel: 'Hapus',
            rejectLabel: 'Batal',
            acceptClassName: 'p-button-danger',
            accept: async () => {
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

                    // ✅ PERBAIKI: Handle nested response structure
                    if (json.data?.data?.status === '00') {
                        // ✅ SUCCESS - data berhasil dihapus
                        toastRef.current?.showToast('00', json.data.data.message || 'Data berhasil dihapus');
                        setMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                        
                    } else if (json.data?.status === '00') {
                        // ✅ ALTERNATIVE SUCCESS STRUCTURE
                        toastRef.current?.showToast('00', json.data.message || 'Data berhasil dihapus');
                        setMonitorSuhu((prev) => prev.filter((item) => item.id !== row.id));
                        
                    } else {
                        // ❌ ERROR
                        const errorMessage = json.data?.data?.message || json.data?.message || json.message || 'Gagal menghapus data';
                        console.error('❌ Backend error:', errorMessage);
                        toastRef.current?.showToast('99', errorMessage);
                    }

                } catch (err) {
                    console.error('💥 Delete error:', err);
                    const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data';
                    toastRef.current?.showToast('99', errorMessage);
                }
            }
        });
    }}
/>
                        </div>
                    )}
                    style={{ width: '150px' }}
                />
            </DataTable>
            <ConfirmDialog />
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
            <Dialog style={{ minWidth: '70vw' }} header="Import Data" visible={fileUploadDialog} onHide={() => setFileUploadDialog(false)}>
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