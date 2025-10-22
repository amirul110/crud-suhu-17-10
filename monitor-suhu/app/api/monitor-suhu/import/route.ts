import { API_ENDPOINTS } from '@/app/api/api';
import { Axios } from '@/utils/axios';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Ambil array buffer langsung
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer); // ✅ Gunakan ini, bukan Buffer

        const externalFormData = new FormData();
        externalFormData.append(
            'file',
            new Blob([uint8Array], { type: file.type }),
            file.name
        );

        const response = await Axios.post(
            API_ENDPOINTS.IMPORTEXCEL,
            externalFormData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // ✅ perbaiki typo
                },
            }
        );

        return NextResponse.json({ data: response.data });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Failed to post data' }, { status: 500 });
    }
};
