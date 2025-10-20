import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CategorizeDocumentRequest {
  file_id: string;
  category_ids: string[];
  categorization_mode?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
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

    const requestData: CategorizeDocumentRequest = await req.json();
    
    if (!requestData.file_id || !requestData.category_ids) {
      return NextResponse.json(
        { error: 'Missing required fields: file_id and category_ids are required' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await categorizeDocument(user_id, requestData);
    return NextResponse.json(
      result,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in POST /categorizeDocument:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error categorizing document',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

async function categorizeDocument(userId: string, requestData: CategorizeDocumentRequest): Promise<any> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }

  try {
    const response = await fetch(`${BASE_URL}/doc-category/categorize-document`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        file_id: requestData.file_id,
        category_ids: requestData.category_ids,
        categorization_mode: requestData.categorization_mode || 'manual',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to categorize document: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in categorizeDocument:', error);
    throw error;
  }
}

