import { ListBatchAutomationJobsResponse } from '@/types/batch-automation-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const url = new URL(req.url);
    const batch_id = url.searchParams.get('batch_id');
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    if (!batch_id) {
      return NextResponse.json(
        { error: 'Missing required field: batch_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const data = await getBatchAutomationStatusFunc(batch_id, user_id);
    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in GET /getBatchAutomationStatus:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error fetching fetch status of batch automation jobs',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
async function getBatchAutomationStatusFunc(batchId: string, userId: string): Promise<ListBatchAutomationJobsResponse> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/batch-automation/batch?batch_id=${batchId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'user-id': userId,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch status of batch automation jobs: ${response.status} ${response.statusText}`);
    }
    const data: ListBatchAutomationJobsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getBatchAutomationStatus:', error);
    throw error;
  }
}