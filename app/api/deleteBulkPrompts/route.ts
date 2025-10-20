import { BulkDeleteRequest } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is missing' }, { status: 400 });
    }
    const deleteResponse = await deleteBulkPrompts(user_id);
    console.log('Files grouped by date:', NextResponse.json(deleteResponse));
    return NextResponse.json(deleteResponse, { status: 200 });
  } catch (error) {
    console.error('Bulk Delete Prompts Error:', error);
    return NextResponse.json(
      {
        error: 'Error deleting prompts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function deleteBulkPrompts(userId: string): Promise<BulkDeleteRequest> {
  const response = await fetch(`${BASE_URL}/prompt/bulk-delete-prompts`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete prompts: ${response.statusText}`);
  }
  return response.json();
}
