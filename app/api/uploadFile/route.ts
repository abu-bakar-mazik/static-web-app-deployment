import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const formData = await req.formData();
    const file = formData.get('files') as File;
    if (!user_id || !file) {
      return NextResponse.json({ error: 'user_id or file is missing' }, { status: 400 });
    }
    const response = await uploadFile(user_id, file);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
async function uploadFile(user_id: string, file: File,): Promise<{datetime: string; file_id: string; file_path: string; name: string;}> {
  const formData = new FormData();
  formData.append('files', file);
  const response = await fetch(`${BASE_URL}/document/UploadDoc`, {
    method: 'POST',
    body: formData,
    headers: {
      'accept': 'application/json',
      'user-id': user_id,
    },
  });
  if (!response.ok) {
    throw new Error(`uploadFile failed with status ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.file_metadata || !Array.isArray(data.file_metadata) || data.file_metadata.length === 0) {
    throw new Error('Invalid response format from API');
  }
  return data.file_metadata[0];
}
