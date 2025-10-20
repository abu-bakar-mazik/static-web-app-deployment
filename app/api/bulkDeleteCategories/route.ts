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

    const result = await bulkDeleteCategories(user_id);
    return NextResponse.json(
      result,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in DELETE /bulkDeleteCategories:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error deleting all categories',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

async function bulkDeleteCategories(userId: string): Promise<{ status: string }> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }

  try {
    const response = await fetch(`${BASE_URL}/category/bulk-delete-categories`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to delete all categories: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in bulkDeleteCategories:', error);
    throw error;
  }
}
