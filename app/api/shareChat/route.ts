import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const chat_id = url.searchParams.get('chat_id');
    if (!chat_id) {
      return NextResponse.json({ error: 'chat_id is missing' }, { status: 400 });
    }
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id header is missing' }, { status: 400 });
    }
    const jsonResponse = await makeChatPublic(chat_id, user_id);
    return NextResponse.json(jsonResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
async function makeChatPublic(chat_id: string, user_id: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/config/make-chat-public?chat_id=${chat_id}`, {
    method: 'POST',
    headers: {
      'user-id': user_id,
    },
  });
  if (!response.ok) {
    throw new Error(`Request to make chat public failed with status ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}
