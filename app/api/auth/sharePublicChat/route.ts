import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface Chat {
  chat_id: string;
  user_id: string;
}
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const chat_id = url.searchParams.get('chat_id');
    if (!chat_id) {
      return NextResponse.json({ error: 'chat_id is missing' }, { status: 400 });
    }
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is missing' }, { status: 400 });
    }
    const { history } = await fetchSharedUserChat(chat_id, user_id);
    const fullResponse = {
      response: 'Chat data fetched successfully',
      history,
    };
    return NextResponse.json(fullResponse, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
async function fetchSharedUserChat(chat_id: string, user_id: string): Promise<{ history: Array<{ content: string; role: string }> }> {
  const response = await fetch(`${BASE_URL}/config/share-user-chat?chat_id=${chat_id}`, {
    method: 'GET',
    headers: {
      'user-id': user_id,
    },
  });
  if (!response.ok) {
    throw new Error(`Request to share user chat failed with status ${response.status}: ${response.statusText}`);
  }
  const jsonResponse = await response.json();
  console.log('jsonResponse', jsonResponse);
  return {
    history: jsonResponse,
  };
}
