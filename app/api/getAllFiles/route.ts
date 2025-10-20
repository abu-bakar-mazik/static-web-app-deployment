import { GetAllDocumentsRequest, GetAllDocumentsResponse } from '@/redux/types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const body = (await req.json()) as GetAllDocumentsRequest;
    const { offset = 0, limit = 100, order = 'newest', category_ids } = body;
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is missing' }, { status: 400 });
    }
    const filesResponse = await getAllFilesByUserId({
      user_id,
      offset,
      limit,
      order,
      category_ids
    });
    return NextResponse.json(filesResponse, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
async function getAllFilesByUserId({
  user_id,
  offset,
  limit,
  order,
  category_ids
}: {
  user_id: string;
  offset: number;
  limit: number;
  order: 'newest' | 'oldest';
  category_ids?: string[];
}): Promise<GetAllDocumentsResponse> {
  try {
    const url = new URL(`${BASE_URL}/document/GetDocByUserId`);
    const requestBody: any = {
      offset,
      limit,
      order
    };
    if (category_ids && category_ids.length > 0) {
      requestBody.category_ids = category_ids;
    }
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'user-id': user_id,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    const responseData: GetAllDocumentsResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}