import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface RemoveModelRequest {
  models: string[];
}
interface RemoveModelResponse {
  message: string;
  models: string[];
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { models } = (await req.json()) as RemoveModelRequest;
    if (!models || !Array.isArray(models) || models.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Models array is required and must not be empty',
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    const removeResponse = await removeModels(models);
    return NextResponse.json(removeResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Remove Models Error:', error);
    return NextResponse.json(
      {
        error: 'Error removing models',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
async function removeModels(models: string[]): Promise<RemoveModelResponse> {
  const API_URL = `${BASE_URL}/config/remove-model`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(models),
  });
  if (!response.ok) {
    throw new Error(`Failed to remove models: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.message || !Array.isArray(data.models)) {
    throw new Error('Invalid API response structure');
  }
  return data;
}
