import { Category, UpdateCategory } from '@/types/category-types';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req: NextRequest): Promise<NextResponse> {
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

    const categoryData: UpdateCategory = await req.json();
    
    if (!categoryData.category_id) {
      return NextResponse.json(
        { error: 'Missing required field: category_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const updatedCategory = await updateCategory(user_id, categoryData);
    return NextResponse.json(
      updatedCategory,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in PUT /updateCategory:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error updating category',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

async function updateCategory(userId: string, categoryData: UpdateCategory): Promise<Category> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }

  try {
    const response = await fetch(`${BASE_URL}/category/update-category`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to update category: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as Category;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
}
