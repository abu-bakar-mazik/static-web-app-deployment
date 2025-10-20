import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const modelName = url.searchParams.get('model');
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is missing' }, { status: 400 });
    }
    if (!modelName) {
      return NextResponse.json({ error: 'modelName is missing' }, { status: 400 });
    }
    const message = await SetUserChatModel(user_id, modelName);
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user chat model:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
async function SetUserChatModel(user_id: string, modelName: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/config/set-user-default-model?model=${modelName}`, {
      method: 'POST',
      headers: {
        'user-id': user_id,
      },
    });
    if (!response.ok) {
      throw new Error(`Request to share user chat failed with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log('jsonResponse', jsonResponse);
    return jsonResponse.message || 'Model updated successfully';
  } catch (error: unknown) {
    console.error('Error in setUserChatModel:', error);
    throw new Error('Failed to update the user chat model');
  }
}
