import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface ApiResponse {
  message: string;
}
interface UpdateChatTitle {
  chat_id: string;
  new_title: string;
}
if (!baseURL) {
  throw new Error('Environment variable NEXT_PUBLIC_API_BASE_URL is not defined');
}
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const { chat_id, new_title } = (await req.json()) as UpdateChatTitle;
    if (!chat_id) {
      return NextResponse.json({ error: 'Missing required chat_id' }, { status: 400 });
    }
    if (!new_title) {
      return NextResponse.json({ error: 'Missing required new_title' }, { status: 400 });
    }
    const response = await updateConversationName(chat_id, new_title);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function updateConversationName(chatId: string, chatTitle: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${baseURL}/sessions/update_chat_title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        new_title: chatTitle,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return { message: data.message };
  } catch (error) {
    console.error('updateConversationName Error:', error);
    throw new Error('Error while updating the conversation name');
  }
}