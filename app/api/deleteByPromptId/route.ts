import { DeleteByIdResponse, DeletePromptRequest } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const { prompt_id } = (await req.json()) as DeletePromptRequest;
    if (!user_id || !prompt_id) {
      return NextResponse.json({ error: `Missing required field: user_id or prompt_id || ${prompt_id}` }, { status: 400 });
    }
    const deleteResponse = await deletePromptById(user_id, prompt_id);
    console.log('Prompt deleted by id successfully:', JSON.stringify(deleteResponse));
    return NextResponse.json(deleteResponse, { status: 200 });
  } catch (error) {
    console.error('Delete Prompt By ID Error:', error);
    return NextResponse.json(
      {
        error: 'Error deleting prompt by ID',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function deletePromptById(userId: string, promptId: string): Promise<DeleteByIdResponse> {
  const API_URL = `${BASE_URL}/prompt/delete-prompt-by-id`;
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId,
    },
    body: JSON.stringify(promptId),
  });
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const errorDetails = responseBody?.message || response.statusText;
    throw new Error(`Failed to delete prompt by ID: ${errorDetails}`);
  }
  return responseBody;
}
