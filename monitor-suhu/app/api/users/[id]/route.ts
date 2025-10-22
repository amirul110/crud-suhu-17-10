import { Axios } from '@/utils/axios';
import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/app/api/api';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        
        console.log(`🔄 Update user ID: ${id}`);
        
        // Coba endpoint yang mungkin
        let response;
        try {
            response = await Axios.put(`${API_ENDPOINTS.GETALLUSERS}/${id}`, body);
        } catch (firstError: any) {
            // Jika gagal, coba endpoint alternatif
            if (firstError.response?.status === 404) {
                throw new Error('Endpoint update user tidak ditemukan di backend');
            }
            throw firstError;
        }
        
        return NextResponse.json({ data: response.data });
        
    } catch (err: any) {
        console.error(`❌ Update user error:`, err.message);
        
        // Return error yang bersih
        return NextResponse.json(
            { 
                data: { 
                    status: '99', 
                    message: 'Fitur edit user saat ini tidak tersedia'
                } 
            },
            { status: 404 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        console.log(`🗑️ Delete user ID: ${id}`);
        
        const response = await Axios.delete(API_ENDPOINTS.DELETEUSER(id));
        
        return NextResponse.json({ data: response.data });
        
    } catch (err: any) {
        console.error(`❌ Delete user error:`, err.message);
        
        return NextResponse.json(
            { 
                data: { 
                    status: '99', 
                    message: err.response?.data?.message || 'Gagal menghapus user'
                } 
            },
            { status: err.response?.status || 500 }
        );
    }
}