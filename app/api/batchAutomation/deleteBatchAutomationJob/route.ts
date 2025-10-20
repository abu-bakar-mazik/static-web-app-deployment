import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface DeleteByIdResponse {
  message: string;
  DeletedBatchId: string;
}
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const url = new URL(req.url);
    const batch_id = url.searchParams.get('batch_id');
    if (!user_id || !batch_id) {
      return NextResponse.json({ error: `Missing required field: user_id or batch_id || ${batch_id}` }, { status: 400 });
    }
    const deleteResponse = await deleteBatchById(user_id, batch_id);
    console.log('Batch deleted by id successfully:', JSON.stringify(deleteResponse));
    return NextResponse.json(deleteResponse, { status: 200 });
  } catch (error) {
    console.error('Delete Batch By ID Error:', error);
    return NextResponse.json(
      {
        error: 'Error deleting batch by ID',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function deleteBatchById(userId: string, batchId: string): Promise<DeleteByIdResponse> {
  const API_URL = `${BASE_URL}/batch-automation/delete/${batchId}`;
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'user-id': userId,
    },
  });
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const errorDetails = responseBody?.message || response.statusText;
    throw new Error(`Failed to delete batch by ID: ${errorDetails}`);
  }
  return responseBody;
}
