import { Axios } from '@/utils/axios';
import { NextRequest, NextResponse } from 'next/server';
const API_URL = process.env.API_URL || 'http://localhost:8100/api';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // ✅ FIX: Promise untuk Next.js 13+
) {
    try {
        const { id } = await params;  // ✅ FIX: await the Promise
        const body = await request.json();
        
        console.log(`🔄 PUT /api/users/${id} - Updating user:`, body);
        const response = await Axios.put(`${API_URL}/user/edit/${id}`, body);
        
        console.log(`✅ PUT /api/users/${id} - Success:`, response.data);
        return NextResponse.json({ data: response.data });
        
    } catch (err: any) {
        console.error(`❌ PUT /api/users/${id} - Error:`, err);
        return NextResponse.json(
            { 
                data: { 
                    status: '99', 
                    message: err.response?.data?.message || 'Failed to update user',
                    error: err.message
                } 
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // ✅ FIX: Promise untuk Next.js 13+
) {
    try {
        const { id } = await params;  // ✅ FIX: await the Promise
        
        console.log(`🔄 DELETE /api/users/${id} - Deleting user`);
        const response = await Axios.delete(`${API_URL}/user/delete/${id}`);
        
        console.log(`✅ DELETE /api/users/${id} - Success:`, response.data);
        return NextResponse.json({ data: response.data });
        
    } catch (err: any) {
        console.error(`❌ DELETE /api/users/${id} - Error:`, err);
        return NextResponse.json(
            { 
                data: { 
                    status: '99', 
                    message: err.response?.data?.message || 'Failed to delete user',
                    error: err.message
                } 
            },
            { status: 500 }
        );
    }
}