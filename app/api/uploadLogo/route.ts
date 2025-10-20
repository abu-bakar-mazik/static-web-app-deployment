import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'file is missing' }, { status: 400 });
    }
    const { file_path } = await uploadLogo(file);
    const fullResponse = {
      message: 'File uploaded successfully',
      file_path,
    };
    return NextResponse.json(fullResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
async function uploadLogo(file: File): Promise<{ file_path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${BASE_URL}/config/change-logo`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`uploadLogo failed with status ${response.status}: ${response.statusText}`);
  }
  const jsonResponse = await response.json();
  console.log('jsonResponse', jsonResponse);
  return {
    file_path: jsonResponse.file_path,
  };
}
