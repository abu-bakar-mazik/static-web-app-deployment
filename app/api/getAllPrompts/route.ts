import { Prompt } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req: NextRequest): Promise<NextResponse> {
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
    const prompts = await getPrompts(user_id);
    return NextResponse.json(
      { prompts },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in GET /getAllPrompts:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        error: 'Error fetching prompts',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
async function getPrompts(userId: string): Promise<Prompt[]> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/prompt/get-accessible-prompts`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'user-id': userId,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch prompts: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid API response: Expected an array of prompts.');
    }
    return data as Prompt[];
  } catch (error) {
    console.error('Error in getPrompts:', error);
    throw error;
  }
}