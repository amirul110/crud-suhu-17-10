import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '@/app/api/api';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const id = params.id;
        console.log('🔄 GET Mesin by ID - Endpoint:', API_ENDPOINTS.GETMESINBYID(parseInt(id)));

        const response = await Axios.get(API_ENDPOINTS.GETMESINBYID(parseInt(id)));
        console.log('✅ GET Mesin by ID Response:', response.data);

        return NextResponse.json({ 
            data: response.data 
        });
        
    } catch (err: any) {
        console.error('❌ GET Mesin by ID Error:', err);
        
        return NextResponse.json({ 
            data: {
                status: '99',
                message: err.response?.data?.message || 'Gagal mendapatkan data master mesin',
                error: err.message
            }
        }, { 
            status: err.response?.status || 500 
        });
    }
};

export const PUT = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const id = params.id;
        const body = await request.json();
        
        console.log('🔄 PUT Mesin - Endpoint:', API_ENDPOINTS.EDITMESIN(parseInt(id)));
        console.log('📦 PUT Data:', body);

        const response = await Axios.put(API_ENDPOINTS.EDITMESIN(parseInt(id)), body);
        console.log('✅ PUT Mesin Response:', response.data);

        return NextResponse.json({ 
            data: response.data 
        });
        
    } catch (err: any) {
        console.error('❌ PUT Mesin Error:', err);
        
        return NextResponse.json({ 
            data: {
                status: '99',
                message: err.response?.data?.message || 'Gagal mengupdate data master mesin',
                error: err.message
            }
        }, { 
            status: err.response?.status || 500 
        });
    }
};

export const DELETE = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        const id = params.id;
        console.log('🗑️ DELETE Mesin - Endpoint:', API_ENDPOINTS.DELETEMESIN(parseInt(id)));
        
        const response = await Axios.delete(API_ENDPOINTS.DELETEMESIN(parseInt(id)));
        console.log('✅ DELETE Mesin Response:', response.data);
        
        return NextResponse.json({ 
            data: response.data 
        });
        
    } catch (err: any) {
        console.error('❌ DELETE Mesin Error:', err);
        
        if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error status:', err.response.status);
        }
        
        return NextResponse.json({ 
            data: {
                status: '99',
                message: err.response?.data?.message || 'Gagal menghapus data master mesin',
                error: err.message
            }
        }, { 
            status: err.response?.status || 500 
        });
    }
};