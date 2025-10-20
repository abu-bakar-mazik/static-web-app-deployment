import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface BulkCategorizeDocumentRequest {
  file_ids: string[];
  category_ids: string[];
  categorization_mode?: string;
}

async function bulkCategorizeDocuments(userId: string, requestData: BulkCategorizeDocumentRequest) {
  if (!BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  try {
    const response = await fetch(`${BASE_URL}/doc-category/bulk-categorize-documents`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        file_ids: requestData.file_ids,
        category_ids: requestData.category_ids,
        categorization_mode: requestData.categorization_mode || 'manual',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to bulk categorize documents: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in bulkCategorizeDocuments:', error);
    throw error;
  }
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

    const requestData: BulkCategorizeDocumentRequest = await req.json();
    
    if (!requestData.file_ids || !Array.isArray(requestData.file_ids) || requestData.file_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: file_ids must be a non-empty array' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (!requestData.category_ids || !Array.isArray(requestData.category_ids)) {
      return NextResponse.json(
        { error: 'Missing required field: category_ids must be an array' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await bulkCategorizeDocuments(user_id, requestData);

    return NextResponse.json(result, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in bulk categorize documents API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
