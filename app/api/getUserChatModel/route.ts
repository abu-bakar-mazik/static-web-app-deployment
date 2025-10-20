import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is missing' }, { status: 400 });
    }
    const { userModel, allModels } = await GetUserChatModel(user_id);
    const fullResponse = {
      userModel,
      allModels,
    };
    return NextResponse.json(fullResponse, { status: 200 });
  } catch (error) {
    console.error('Error fetching user chat model:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
async function GetUserChatModel(user_id: string): Promise<{ userModel: string; allModels: Array<string> }> {
  try {
    const response = await fetch(`${BASE_URL}/config/get-user-default-model`, {
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
    return { userModel: jsonResponse.default_model, allModels: jsonResponse.All_models };
  } catch (error) {
    console.error('Error in getUserChatModel:', error);
    throw error;
  }
}
