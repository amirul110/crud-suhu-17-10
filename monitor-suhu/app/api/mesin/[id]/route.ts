import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async ({ params }: { params: { id: number } }) => {
    try {
        const response = await Axios.get(API_ENDPOINTS.GETMESINBYID(params.id));

        return NextResponse.json({ data: response.data });
    } catch (err) {
        return NextResponse.json({ message: 'Gagal mendapatkan data master mesin dari id yang diberikan' }, { status: 500 });
    }
};

export const PUT = async (request: NextRequest, { params }: { params: { id: number } }) => {
    try {
        const body = await request.json();
        const response = await Axios.put(API_ENDPOINTS.EDITMESIN(params.id), body);

        return NextResponse.json({ data: response.data });
    } catch (err) {
        return NextResponse.json({ message: 'Gagal mengupdate data master mesin' }, { status: 500 });
    }
};



export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
        console.log('DELETE API Route - ID:', params.id);
        
        // GUNAKAN ENDPOINT YANG BENAR - sesuaikan dengan backend routes
        const response = await Axios.delete(`${API_ENDPOINTS.GETALLMESIN}/delete/${params.id}`);
        
        console.log('Backend response:', response.data);
        
        return NextResponse.json({ data: response.data });
    } catch (err: any) {
        console.error('Delete API error:', err);
        
        // Debug lebih detail
        if (err.response) {
            console.error('Error response:', err.response.data);
            console.error('Error status:', err.response.status);
        }
        
        return NextResponse.json({ 
            message: err.response?.data?.message || 'Gagal menghapus data master mesin',
            error: err.message 
        }, { 
            status: err.response?.status || 500 
        });
    }
};
