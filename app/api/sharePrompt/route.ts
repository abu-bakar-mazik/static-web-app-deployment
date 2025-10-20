import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface SharePromptRequest {
  prompt_id: string;
  shared_user_ids: string[];
  permission_level: string;
}
interface SharingRecord {
  id: string;
  prompt_id: string;
  owner_id: string;
  shared_user_id: string;
  permission_level: string;
  shared_datetime: string;
  status: string;
}
interface SharePromptResponse {
  status: 'success' | 'warning' | 'partial_success' | 'info';
  message: string;
  sharing_records: SharingRecord[];
  already_shared_users?: string[];
  newly_shared_users?: string[];
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const { prompt_id, shared_user_ids, permission_level } = (await req.json()) as SharePromptRequest;
    if (!user_id) {
      return NextResponse.json({ error: 'Missing required header: user-id' }, { status: 400 });
    }
    if (!prompt_id || !shared_user_ids || !permission_level) {
      return NextResponse.json({
        error: 'Missing required fields: prompt_id, shared_user_ids, or permission_level'
      }, { status: 400 });
    }
    if (!Array.isArray(shared_user_ids) || shared_user_ids.length === 0) {
      return NextResponse.json({
        error: 'shared_user_ids must be a non-empty array'
      }, { status: 400 });
    }
    const shareResponse = await sharePrompt(user_id, prompt_id, shared_user_ids, permission_level);
    return NextResponse.json(shareResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        error: 'Error sharing prompt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function sharePrompt(
  userId: string,
  promptId: string,
  sharedUserIds: string[],
  permissionLevel: string
): Promise<SharePromptResponse> {
  try {
    const response = await fetch(`${BASE_URL}/prompt-sharing/share-prompt`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        prompt_id: promptId,
        shared_user_ids: sharedUserIds,
        permission_level: permissionLevel,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to share prompt: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error in sharePrompt function:', error);
    throw error;
  }
}