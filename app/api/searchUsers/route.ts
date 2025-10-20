import { SearchUsersResponse } from '@/types/sharing-types';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const url = new URL(req.url);
    const search_query = url.searchParams.get('search_query');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    if (!user_id || !search_query) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id or search_query' },
        { status: 400 }
      );
    }

    if (search_query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const response = await searchUsers(user_id, search_query, limit);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      {
        error: 'Error searching users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function searchUsers(
  user_id: string, 
  search_query: string, 
  limit: number
): Promise<SearchUsersResponse> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/prompt-sharing/search-users?search_query=${encodeURIComponent(search_query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'user-id': user_id,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search users: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in searchUsers:', error);
    throw error;
  }
}
