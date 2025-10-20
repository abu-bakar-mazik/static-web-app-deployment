import { NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${BASE_URL}/config/get-models`, {
      headers: {
        'accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return NextResponse.json(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw new Error('Invalid API response structure');
  } catch (error) {
    console.error('Get Models Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}