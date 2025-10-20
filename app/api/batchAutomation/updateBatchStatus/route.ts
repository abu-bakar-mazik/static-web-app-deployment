import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const url = new URL(req.url);
    const batch_id = url.searchParams.get('batch_id');
    const status = url.searchParams.get('status');
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    if (!batch_id || !status) {
      return NextResponse.json(
        { error: 'Missing required field: batch_id or status' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const data = await updateBatchStatusFunc(batch_id, status, user_id);
    return NextResponse.json(
      data,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in PATCH /updateBatchStatus:', error);
    const isDev = process.env.NODE_ENV === 'development';
    let errorMessage = 'Error updating batch automation status';
    let statusCode = 500;
    if (error instanceof Error) {
      const match = error.message.match(/(\d{3})/);
      if (match) {
        statusCode = parseInt(match[1]);
      }
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        error: errorMessage,
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      },
    );
  }
}
async function updateBatchStatusFunc(
  batchId: string,
  status: string,
  userId: string
): Promise<any> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(
      `${BASE_URL}/batch-automation/batch-status?batch_id=${batchId}&status=${status}`,
      {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'user-id': userId,
        },
      }
    );
    if (!response.ok) {
      let errorMessage = `Failed to update batch status: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updateBatchStatusFunc:', error);
    throw error;
  }
}