import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function DELETE(req: NextRequest): Promise<NextResponse> {
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

    const { category_ids } = await req.json();
    
    if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: category_ids (must be a non-empty array)' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await deleteSelectedCategories(user_id, category_ids);
    return NextResponse.json(
      result,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in DELETE /deleteSelectedCategories:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error deleting selected categories',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

async function deleteSelectedCategories(userId: string, categoryIds: string[]): Promise<{ status: string }> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }

  try {
    const response = await fetch(`${BASE_URL}/category/delete-selected-categories`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ category_ids: categoryIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to delete selected categories: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in deleteSelectedCategories:', error);
    throw error;
  }
}
