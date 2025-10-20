import { BatchCategoriesResponse } from '@/types/batch-automation-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const url = new URL(req.url);
    const batch_id = url.searchParams.get('batch_id');
    if (!batch_id) {
      return NextResponse.json(
        { error: 'Missing required field: batch_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const response = await getCategoriesByBatchId(batch_id, user_id);
    return NextResponse.json(
      response,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in GET /getCategoriesByBatchId:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error fetching categories',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
async function getCategoriesByBatchId(batch_id: string, userId: string): Promise<BatchCategoriesResponse> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/batch-automation/getBatchCategories/${batch_id}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'user-id': userId,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as BatchCategoriesResponse;
  } catch (error) {
    console.error('Error in getCategoriesByBatchId:', error);
    throw error;
  }
}
