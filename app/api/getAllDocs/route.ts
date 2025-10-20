import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface File {
  id: string;
  name: string;
  filename: string;
  date: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json({error: 'user_id is missing'}, {status: 400});
    }
    const filesByDate = await getAllDocsByUserId(user_id);
    return NextResponse.json(filesByDate, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        error: 'Error fetching documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
async function getAllDocsByUserId(user_id: string): Promise<{ [date: string]: File[] }> {
  try {
    const response = await fetch(`${BASE_URL}/document/get-user-documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': user_id
      }
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    const rawFilesResponse: File[] = await response.json();
    const filesByDate: { [date: string]: File[] } = {};
    rawFilesResponse.forEach((file) => {
      const date = file.date;
      if (!filesByDate[date]) {
        filesByDate[date] = [];
      }
      filesByDate[date].push(file);
    });
    return filesByDate;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}
