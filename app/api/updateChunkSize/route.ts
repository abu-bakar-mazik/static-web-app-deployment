import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface ApiResponse {
  message: string;
  chunk_size: string;
  overlap_size: string;
}
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const url = new URL(req.url);
    const chunk_size = url.searchParams.get('chunk_size') as string;
    const overlap_size = url.searchParams.get('overlap_size') as string;
    if (!user_id || chunk_size === undefined || overlap_size === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'chunk_size and overlap_size are required',
        },
        { status: 400 },
      );
    }
    const updateResponse = await updateChunkSize(user_id, chunk_size, overlap_size);
    return NextResponse.json(
      {
        message: updateResponse.message,
        chunk_size: updateResponse.chunk_size,
        overlap_size: updateResponse.overlap_size,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Update Chunk Size Error:', error);
    return NextResponse.json(
      {
        error: 'Error updating chunk size',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
async function updateChunkSize(userId: string, chunkSize: string, overlapSize: string): Promise<ApiResponse> {
  const API_URL = `${BASE_URL}/config/UpdateChunkSize?chunk_size=${chunkSize}&overlap_size=${overlapSize}`;
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId,
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to update chunk size: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.message === undefined || data.chunk_size === undefined || data.overlap_size === undefined) {
    throw new Error('Invalid API response structure');
  }
  return data;
}
