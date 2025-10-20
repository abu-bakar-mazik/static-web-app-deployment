import { Category, NewCategory } from '@/types/category-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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
    const categoryData: NewCategory = await req.json();
    if (!categoryData.category_name || !categoryData.rules) {
      return NextResponse.json(
        { error: 'Missing required fields: category_name and rules are required' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const createdCategory = await createCategory(user_id, categoryData);
    return NextResponse.json(
      createdCategory,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in POST /createCategory:', error);
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        if (error.message.includes('Category name')) {
          const categoryNameMatch = error.message.match(/Category name '([^']+)' already exists/);
          const categoryName = categoryNameMatch ? categoryNameMatch[1] : 'this name';
          return NextResponse.json(
            {
              error: 'DUPLICATE_CATEGORY_NAME',
              message: `A category with the name "${categoryName}" already exists.`,
              details: {
                field: 'category_name',
                value: categoryName,
                suggestion: 'Please choose a different category name.'
              }
            },
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (error.message.includes('Category with the same rules already exists')) {
          return NextResponse.json(
            {
              error: 'DUPLICATE_CATEGORY_RULES',
              message: 'A category with identical rules already exists.',
              details: {
                field: 'rules',
                suggestion: 'Please modify the rules to make them unique, or use the existing category.'
              }
            },
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'CREATION_FAILED',
        message: 'Failed to create category',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
async function createCategory(userId: string, categoryData: NewCategory): Promise<Category> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/category/create-category`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to create category: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as Category;
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
}