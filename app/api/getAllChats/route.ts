import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = await req.json();
    if (!user_id) {
      return NextResponse.json({error: 'user_id is missing'}, {status: 400});
    }
    const { history } = await getConversationByChatId(user_id);
    const fullResponse = {
      history
    };
    return NextResponse.json(fullResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({error: 'Error'}, { status: 500 });
  }
}
async function getConversationByChatId(user_id: string): Promise<{ history: Array<{ content: string; role: string }> }> {
  try {
    const response = await fetch(`${BASE_URL}/sessions/get_sessionids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(user_id)
    });
    if (!response.ok) {
      throw new Error(`getConversationByChatId failed with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log("response", jsonResponse);
    return {
      history: jsonResponse
    };
  } catch(error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}
