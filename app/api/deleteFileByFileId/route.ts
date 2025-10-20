import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface Chat {
  file_id: string;
  user_id: string;
}
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const file_id = req.headers.get('file-id') as string;
    if (!user_id || !file_id) {
      NextResponse.json({ error: 'user_id or file_id is missing' }, { status: 400 });
    }
    const { message } = await deleteFileByFileId(file_id, user_id);
    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error deleting File by ID',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function deleteFileByFileId(file_id: string, user_id: string): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/document/DeletingFile`, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'file-id': file_id,
      'user-id': user_id,
    },
  });
  if (!response.ok) {
    throw new Error(`deleteFileByFileId failed with status ${response.status}: ${JSON.stringify(response)}`);
  }
  const jsonResponse = await response.json();
  console.log('jsonResponse', jsonResponse);
  return {
    message: jsonResponse,
  };
}
