import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FileMetadata {
  file_id: string;
  datetime: string;
  name: string;
  file_path: string;
}
interface QueueItem {
  status: 'error' | 'pending' | 'processing' | 'Success';
  error?: string;
  file_url?: string;
  user_id: string;
  metadata: FileMetadata;
  id: string;
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
}
interface QueueResponse {
  current_queue: QueueItem[];
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Safely parse the request body
    let userId: string;
    try {
      const body = await req.json();
      // Handle both string and object formats
      userId = typeof body === 'string' ? body : body.userId;
      if (!userId || typeof userId !== 'string') {
        return NextResponse.json(
          { error: 'Invalid or missing user ID in request' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    // Make the API request
    const response = await fetch(`${BASE_URL}/document/upload-queue-status`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userId),
    });
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }
    // Safely parse the response
    let data: QueueResponse;
    try {
      const text = await response.text();
      // Guard against empty responses
      if (!text.trim()) {
        return NextResponse.json(
          { error: 'Empty response from API' },
          { status: 502 }
        );
      }
      // Parse the response text
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('JSON Parse Error:', error, 'Response text:', text);
        return NextResponse.json(
          { error: 'Invalid JSON response from API' },
          { status: 502 }
        );
      }
      // Validate response structure
      if (!data || !Array.isArray(data.current_queue)) {
        console.error('Invalid response structure:', data);
        return NextResponse.json(
          { error: 'Invalid response format from API' },
          { status: 502 }
        );
      }
      // Validate queue items
      const validStatuses = ['error', 'pending', 'processing', 'Success'];
      for (const item of data.current_queue) {
        if (!validStatuses.includes(item.status)) {
          console.error('Invalid status in queue item:', item);
          return NextResponse.json(
            { error: `Invalid status value in queue: ${item.status}` },
            { status: 502 }
          );
        }
        if (item.status === 'error' && item.error) {
          console.warn('Queue item error:', {
            itemId: item.id,
            error: item.error,
            userId: item.user_id
          });
        }
      }
      return NextResponse.json(data);
    } catch (error) {
      console.error('Response processing error:', error);
      return NextResponse.json(
        { error: 'Error processing API response' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}