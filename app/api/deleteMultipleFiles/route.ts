import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is missing' }, { status: 400 });
    }
    // Parse the request body to get the array of file IDs
    const fileIds = await req.json();
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty file IDs array' }, { status: 400 });
    }
    const response = await deleteSelectedFiles(fileIds, user_id);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error deleting files',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
async function deleteSelectedFiles(fileIds: string[], user_id: string): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/document/delete-selected-files`, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
      'user-id': user_id,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fileIds)
  });
  if (!response.ok) {
    throw new Error(`Failed to delete files with status ${response.status}`);
  }
  return await response.json();
}