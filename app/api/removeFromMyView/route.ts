import { RemoveFromViewRequest } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface RemoveFromViewResponse {
  status: string;
  message: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const { prompt_id, action } = (await req.json()) as RemoveFromViewRequest;
    if (!user_id || !prompt_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, prompt_id, or action' },
        { status: 400 }
      );
    }
    if (action !== 'hide' && action !== 'unhide') {
      return NextResponse.json(
        { error: 'Action must be either "hide" or "unhide"' },
        { status: 400 }
      );
    }
    const response = await removeFromMyView(user_id, prompt_id, action);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error removing prompt from view:', error);
    if (error instanceof Error) {
      if (error.message.includes('Prompt owners cannot hide their own prompts')) {
        return NextResponse.json(
          {
            error: 'Cannot hide own prompt',
            details: error.message,
            errorType: 'OWNER_RESTRICTION'
          },
          { status: 400 }
        );
      }
      if (error.message.includes('400')) {
        return NextResponse.json(
          {
            error: 'Bad request',
            details: error.message,
            errorType: 'BAD_REQUEST'
          },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      {
        error: 'Error removing prompt from view',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
async function removeFromMyView(
  user_id: string,
  prompt_id: string,
  action: 'hide' | 'unhide'
): Promise<RemoveFromViewResponse> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/prompt-sharing/remove-from-my-view`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': user_id,
      },
      body: JSON.stringify({
        prompt_id,
        action,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorJson.message || errorText;
      } catch {
      }
      throw new Error(`Failed to remove prompt from view: ${response.status} ${errorDetail}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in removeFromMyView:', error);
    throw error;
  }
}