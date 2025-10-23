'use client';

import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Mesin } from '@/types/mesin';

interface MesinDialogFormProps {
    visible: boolean;
    mode: 'add' | 'edit' | null;
    initialData: Mesin | null;
    onHide: () => void;
    onSubmit: (data: Mesin) => void;
}

const MesinDialogForm = ({ visible, mode, initialData, onHide, onSubmit }: MesinDialogFormProps) => {
    const [formData, setFormData] = useState<Partial<Mesin>>({
        kode_mesin: '',
        nama_mesin: '',
        suhu_maksimal: 0
    });

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                kode_mesin: '',
                nama_mesin: '',
                suhu_maksimal: 0
            });
        }
    }, [mode, initialData, visible]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.kode_mesin && formData.nama_mesin && formData.suhu_maksimal !== undefined) {
            onSubmit(formData as Mesin);
        }
    };

    const isEditMode = mode === 'edit';

    return (
        <Dialog 
            header={isEditMode ? `Edit Data Mesin - ${initialData?.kode_mesin}` : 'Tambah Data Mesin Baru'}
            visible={visible} 
            onHide={onHide}
            style={{ width: '500px' }}
            modal
            className="p-fluid"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="field">
                    <label htmlFor="kode_mesin" className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Mesin <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="kode_mesin"
                        value={formData.kode_mesin}
                        onChange={(e) => setFormData({ ...formData, kode_mesin: e.target.value })}
                        placeholder="Masukkan kode mesin"
                        required
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label htmlFor="nama_mesin" className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Mesin <span className="text-red-500">*</span>
                    </label>
                    <InputText
                        id="nama_mesin"
                        value={formData.nama_mesin}
                        onChange={(e) => setFormData({ ...formData, nama_mesin: e.target.value })}
                        placeholder="Masukkan nama mesin"
                        required
                        className="w-full"
                    />
                </div>

                <div className="field">
                    <label htmlFor="suhu_maksimal" className="block text-sm font-medium text-gray-700 mb-2">
                        Suhu Maksimal (°C) <span className="text-red-500">*</span>
                    </label>
                    <InputNumber
                        id="suhu_maksimal"
                        value={formData.suhu_maksimal}
                        onValueChange={(e) => setFormData({ ...formData, suhu_maksimal: e.value || 0 })}
                        placeholder="Masukkan suhu maksimal"
                        mode="decimal"
                        min={0}
                        max={1000}
                        useGrouping={false}
                        required
                        className="w-full"
                    />
                </div>

                <div className="flex justify-content-end gap-2 mt-6">
                    <Button
                        type="button"
                        label="Batal"
                        icon="pi pi-times"
                        onClick={onHide}
                        className="p-button-text"
                    />
                    <Button
                        type="submit"
                        label={isEditMode ? 'Update' : 'Simpan'}
                        icon={isEditMode ? 'pi pi-check' : 'pi pi-save'}
                        className="p-button-success"
                    />
                </div>
            </form>
        </Dialog>
    );
};

export default MesinDialogForm;