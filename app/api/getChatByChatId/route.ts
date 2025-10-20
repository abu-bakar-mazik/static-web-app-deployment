import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export interface Chat {
  chat_id: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { chat_id } = (await req.json()) as Chat;
    if (!chat_id) {
      return NextResponse.json({ error: 'chat_id is missing' }, { status: 400 });
    }
    const { history } = await getConversationByChatId(chat_id);
    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching chat by ID',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function getConversationByChatId(chatId: string): Promise<{ history: Array<{ content: string; role: string }> }> {
  try {
    const response = await fetch(`${BASE_URL}/sessions/GetSpecificChat`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatId),
    });
    if (!response.ok) {
      throw new Error(`getConversationByChatId failed with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    return { history: jsonResponse };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to fetch conversation by chat ID');
  }
}
