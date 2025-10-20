import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface ApiResponse {
  status: string;
  message: string;
}
interface RetrieverStatusResponse {
  status: string;
  message: string;
}
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    if (!status) {
      return NextResponse.json(
        {
          error: 'Missing required parameter',
          details: 'The "status" query parameter is required.',
        },
        { status: 400 },
      );
    }
    const updateResponse = await setRetrieverStatus(status);
    const transformedResponse: RetrieverStatusResponse = {
      status: updateResponse.status,
      message: updateResponse.message,
    };
    return NextResponse.json(transformedResponse, {
      status: 200
    });
  } catch (error) {
    console.error('Set Retriever Status Error:', error);
    return NextResponse.json(
      {
        error: 'Error setting retriever status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      },
    );
  }
}
async function setRetrieverStatus(status: string): Promise<ApiResponse> {
  const API_URL = `${BASE_URL}/config/set-retriever-status?status=${encodeURIComponent(status)}`;
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to set retriever status: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.status || !data.message) {
    throw new Error('Invalid API response structure');
  }
  return data;
}