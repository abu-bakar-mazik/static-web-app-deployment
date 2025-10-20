import { ListBatchAutomationJobsResponse } from '@/types/batch-automation-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const response = await getListOfBatchAutomationJobs(user_id);
    return NextResponse.json(
      response,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in GET /getFileShareFolders:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error fetching file share folders',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
async function getListOfBatchAutomationJobs(userId: string): Promise<ListBatchAutomationJobsResponse> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/batch-automation/batches`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'user-id': userId,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch list of batch automation jobs: ${response.status} ${response.statusText}`);
    }
    const data: ListBatchAutomationJobsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in listBatchAutomationJobs:', error);
    throw error;
  }
}