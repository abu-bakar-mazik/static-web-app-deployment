import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface ResponseItem {
  question: string;
  answer: string;
  explanation: string;
}
interface BatchResponse {
  prompt: string;
  response: ResponseItem[];
  filename: string;
}
interface QueueItem {
  status: 'success' | 'processing' | 'error';
  error: string;
  user_id: string;
  file_ids: string[];
  prompt_list: string[];
  id: string;
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  batch_response: {
    [key: string]: BatchResponse[];
  };
  _ts: number;
}
interface QueueResponse {
  current_queue: QueueItem[];
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = await req.text();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    const response = await fetch(`${BASE_URL}/document/batch-queue-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(user_id)
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch queue status' }, 
        { status: response.status }
      );
    }
    const data: QueueResponse = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}