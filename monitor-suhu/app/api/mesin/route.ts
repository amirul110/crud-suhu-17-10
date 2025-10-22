import { Axios } from '@/utils/axios';
import { API_ENDPOINTS } from '../api';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
    try {
        console.log('🔄 GET Mesin - Endpoint:', API_ENDPOINTS.GETALLMESIN);
        const response = await Axios.get(API_ENDPOINTS.GETALLMESIN);
        console.log('✅ GET Mesin Response:', response.data);
        
        return NextResponse.json({ 
            data: response.data 
        });
        
    } catch (err: any) {
        console.error('❌ GET Mesin Error:', err);
        
        return NextResponse.json({ 
            data: {
                status: '99',
                message: err.response?.data?.message || 'Gagal mendapatkan data master mesin',
                master_mesin: []
            }
        }, { 
            status: err.response?.status || 500 
        });
    }
};

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        console.log('🔄 POST Mesin - Endpoint:', API_ENDPOINTS.ADDMESIN);
        console.log('📦 POST Data:', body);

        const response = await Axios.post(API_ENDPOINTS.ADDMESIN, body);
        console.log('✅ POST Mesin Response:', response.data);

        return NextResponse.json({ 
            data: response.data 
        });
        
    } catch (err: any) {
        console.error('❌ POST Mesin Error:', err);
        
        // Debug detail error
        if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error status:', err.response.status);
        }
        
        return NextResponse.json({ 
            data: {
                status: '99',
                message: err.response?.data?.message || 'Gagal menambahkan data master mesin',
                error: err.message
            }
        }, { 
            status: err.response?.status || 500 
        });
    }
};