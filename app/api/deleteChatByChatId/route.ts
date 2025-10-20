import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const chat_id = req.headers.get('chat-id') as string;
    if (!chat_id || !user_id) {
      return NextResponse.json({ error: 'chat_id || user_id is missing' }, { status: 400 });
    }
    const { history } = await deleteConversationByChatId(chat_id, user_id);
    const fullResponse = {
      history,
    };
    return NextResponse.json(fullResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
async function deleteConversationByChatId(chat_id: string, user_id: string): Promise<{ history: Array<{ content: string; role: string }> }> {
  const response = await fetch(`${BASE_URL}/document/deleteChatbychat_id`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'chat-id': chat_id,
      'user-id': user_id,
    },
  });
  if (!response.ok) {
    throw new Error(`deleteConversationByChatId failed with status ${response.status}: ${JSON.stringify(response)}`);
  }
  const jsonResponse = await response.json();
  console.log('jsonResponse', jsonResponse);
  return {
    history: jsonResponse,
  };
}
