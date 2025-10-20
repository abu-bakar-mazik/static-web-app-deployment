import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { file_id, user_id } = await req.json();
    if (!file_id || !user_id) {
      return NextResponse.json({ error: 'Missing file_id in request body' }, { status: 400 });
    }
    const file_url = await getFileUrlByFileId(file_id, user_id);
    if (!file_url) {
      return NextResponse.json({ error: 'Failed to retrieve File Id' }, { status: 500 });
    }
    const fullResponse = {
      file_url: file_url,
    };
    return NextResponse.json(fullResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function getFileUrlByFileId(file_id: string, user_id: string): Promise<string | null> {
  try {
    console.log('File ID:', file_id);
    const response = await fetch(`${BASE_URL}/api/GetURLForFileByFileid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        file_id: file_id,
        user_id: user_id,
      },
    });
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    const file_url = await response.text();
    return file_url || null;
  } catch (error) {
    console.error('Error fetching File URL:', error);
    return null;
  }
}
function logError(method: string, error: unknown) {
  console.error(`[${method}] Error:`, error);
}