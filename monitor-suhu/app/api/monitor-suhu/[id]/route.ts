// app/api/monitor-suhu/[id]/route.ts
import { API_ENDPOINTS } from '@/app/api/route'; // Adjust import path
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    console.log(`🔄 PUT Monitor Suhu ID: ${id}`);
    console.log(`🌐 Calling: ${API_ENDPOINTS.EDITMONITORSUHU(parseInt(id))}`);
    console.log(`📦 Request Body:`, body);

    const response = await axios.put(API_ENDPOINTS.EDITMONITORSUHU(parseInt(id)), body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ PUT Response:', response.data);
    return NextResponse.json({ 
      status: '00',
      message: 'Data monitor suhu berhasil diupdate',
      data: response.data 
    });

  } catch (err: any) {
    console.error('❌ PUT Error:', err);
    
    // Detailed error logging
    if (err.response) {
      console.error('Error URL:', err.config?.url);
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    }
    
    return NextResponse.json({ 
      status: '99',
      message: err.response?.data?.message || 'Gagal mengupdate data monitor suhu',
      error: err.response?.data
    }, { 
      status: err.response?.status || 500 
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    console.log(`🗑️ DELETE Monitor Suhu ID: ${id}`);
    console.log(`🌐 Calling: ${API_ENDPOINTS.DELETEMONITORSUHU(parseInt(id))}`);
    
    const response = await axios.delete(API_ENDPOINTS.DELETEMONITORSUHU(parseInt(id)));
    
    console.log('✅ DELETE Response:', response.data);
    return NextResponse.json({ 
      status: '00',
      message: 'Data monitor suhu berhasil dihapus',
      data: response.data 
    });
    
  } catch (err: any) {
    console.error('❌ DELETE Error:', err);
    
    // Detailed error logging
    if (err.response) {
      console.error('Error URL:', err.config?.url);
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    }
    
    return NextResponse.json({ 
      status: '99',
      message: err.response?.data?.message || 'Gagal menghapus data monitor suhu',
      error: err.response?.data
    }, { 
      status: err.response?.status || 500 
    });
  }
}

// Optional: Add GET handler for single monitor suhu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    console.log(`📥 GET Monitor Suhu by ID: ${id}`);
    console.log(`🌐 Calling: ${API_ENDPOINTS.GETMONITORSUHUBYID(parseInt(id))}`);
    
    const response = await axios.get(API_ENDPOINTS.GETMONITORSUHUBYID(parseInt(id)));
    
    console.log('✅ GET Response:', response.data);
    return NextResponse.json({ 
      status: '00',
      message: 'Data monitor suhu berhasil didapatkan',
      data: response.data 
    });
    
  } catch (err: any) {
    console.error('❌ GET Error:', err);
    
    if (err.response) {
      console.error('Error URL:', err.config?.url);
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    }
    
    return NextResponse.json({ 
      status: '99',
      message: err.response?.data?.message || 'Gagal mengambil data monitor suhu',
      error: err.response?.data
    }, { 
      status: err.response?.status || 500 
    });
  }
}