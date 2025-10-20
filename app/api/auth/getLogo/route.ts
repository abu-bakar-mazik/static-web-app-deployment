import { NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(): Promise<NextResponse> {
  try {
    const logo_url = await getLogoUrl();
    if (!logo_url) {
      return NextResponse.json({ error: 'Failed to retrieve Logo Url' }, { status: 500 });
    }
    return NextResponse.json(logo_url, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function getLogoUrl(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/config/get-logo`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    const logo_url = await response.text();
    console.log('logo_url', logo_url);
    return logo_url || null;
  } catch (error) {
    console.error('Error fetching File URL:', error);
    return null;
  }
}
