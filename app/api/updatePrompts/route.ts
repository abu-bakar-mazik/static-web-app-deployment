import { PromptUpdateResponse, UpdatePromptRequest } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const { prompt_id, title, prompt } = (await req.json()) as UpdatePromptRequest;
    if (!user_id || !prompt_id || !title || !prompt) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'user_id, prompt_id, title, and prompt are required',
        },
        { status: 400 },
      );
    }
    const updateResponse = await updatePrompt(user_id, prompt_id, title, prompt);
    const transformedResponse: PromptUpdateResponse = {
      status: updateResponse.status,
      PromptID: updateResponse.PromptID,
      UpdatedTitle: updateResponse.UpdatedTitle,
      UpdatedPrompt: updateResponse.UpdatedPrompt,
      UpdatedDatetime: updateResponse.UpdatedDatetime,
    };
    return NextResponse.json(transformedResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Update Prompt Error:', error);
    return NextResponse.json(
      {
        error: 'Error updating prompt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
async function updatePrompt(userId: string, promptId: string, newTitle: string, newPrompt: string[]): Promise<PromptUpdateResponse> {
  const API_URL = `${BASE_URL}/prompt/update-prompt-group`;
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'user-id': userId,
    },
    body: JSON.stringify({
      prompt_group_id: promptId,
      title: newTitle,
      prompt_group: [newPrompt],
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update prompt: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.PromptID || !data.UpdatedTitle || !data.UpdatedPrompt) {
    throw new Error('Invalid API response structure');
  }
  return data;
}
