import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!BASE_URL) {
  throw new Error("Environment variable NEXT_PUBLIC_API_BASE_URL is not defined");
}
export interface DeleteCategoryResponse {
  success: boolean;
  data: {
    response: {
      success: boolean;
      message: string;
    }
  };
}
export interface DeleteCategoryError {
  status: string;
  category_id: string;
  associated_documents_count: number;
  bool: boolean;
}
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const body = await req.json();
    const category_id = body.category_id;
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is missing' },
        { status: 400 }
      );
    }
    if (!category_id) {
      return NextResponse.json(
        { error: 'category_id is missing' },
        { status: 400 }
      );
    }
    const response = await deleteCategory(user_id, category_id);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('DELETE Error:', error);
    if (error instanceof Error && error.message.includes('Failed to delete category: 400')) {
      try {
        const errorMatch = error.message.match(/400 - (.+)$/);
        if (errorMatch) {
          const errorDetails = JSON.parse(errorMatch[1]);
          if (errorDetails.detail && errorDetails.detail.associated_documents_count !== undefined) {
            const { status, category_id, associated_documents_count } = errorDetails.detail;
            return NextResponse.json(
              {
                error: 'CATEGORY_HAS_DOCUMENTS',
                message: `Cannot delete category. It has ${associated_documents_count} associated document${associated_documents_count !== 1 ? 's' : ''}.`,
                details: {
                  category_id,
                  associated_documents_count,
                  suggestion: associated_documents_count === 1
                    ? 'Please move or delete the associated document before deleting this category.'
                    : 'Please move or delete the associated documents before deleting this category.'
                }
              },
              { status: 400 }
            );
          }
        }
      } catch (parseError) {
        console.error('Error parsing category deletion error:', parseError);
      }
    }
    return NextResponse.json(
      {
        error: 'DELETION_FAILED',
        message: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<DeleteCategoryResponse> {
  const response = await fetch(
    `${BASE_URL}/category/delete-category/${categoryId}`,
    {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'user-id': userId,
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete category: ${response.status} - ${errorText}`);
  }
  return await response.json();
}