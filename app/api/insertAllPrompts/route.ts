import { InsertPromptRequest, PromptInsertResponse } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const { title, prompt } = (await req.json()) as InsertPromptRequest;
    if (!user_id || !title || !prompt) {
      return NextResponse.json({ error: 'Missing required fields: user_id, title, or prompt' }, { status: 400 });
    }
    const insertResponse = await insertPrompt(user_id, title, prompt);
    return NextResponse.json(insertResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        error: 'Error inserting prompt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function insertPrompt(userId: string, title: string, prompt_group: string[]): Promise<PromptInsertResponse> {
  try {
    const response = await fetch(`${BASE_URL}/prompt/insert-prompt-group`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ title, prompt_group }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to insert prompt: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error in insertPrompt function:', error);
    throw error;
  }
}