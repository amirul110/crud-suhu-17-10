import { Axios } from '@/utils/axios';
import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '../routes'
// Temporary - hardcode endpoints dulu
const API_URL = process.env.API_URL || 'http://localhost:8100/api';

export const GET = async () => {
    try {
        console.log('🔄 GET /api/users - Fetching users from backend');
        const response = await Axios.get(`${API_URL}/user`);
        
        console.log('✅ GET /api/users - Success:', response.data);
        return NextResponse.json({ data: response.data });
        
    } catch (err: any) {
        console.error('❌ GET /api/users - Error:', err);
        return NextResponse.json(
            { 
                data: { 
                    status: '99', 
                    message: 'Failed to fetch users data',
                    error: err.message
                } 
            },
            { status: 500 }
        );
    }
};

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        console.log('🔄 POST /api/users - Creating user:', body);
        
        const response = await Axios.post(`${API_URL}/user/create`, body);
        
        console.log('✅ POST /api/users - Success:', response.data);
        return NextResponse.json({ data: response.data });
        
    } catch (err: any) {
        console.error('❌ POST /api/users - Error:', err);
        
        // Return error response yang valid JSON
        return NextResponse.json(
            { 
                data: { 
                    status: '99', 
                    message: err.response?.data?.message || 'Failed to create user',
                    error: err.message
                } 
            },
            { status: 500 }
        );
    }
};