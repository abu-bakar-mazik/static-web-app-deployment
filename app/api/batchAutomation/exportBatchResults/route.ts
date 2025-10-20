import { NextResponse } from "next/server";
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function GET(req: Request): Promise<Response> {
  try {
    const user_id = req.headers.get('user-id');
    const url = new URL(req.url);
    const batch_id = url.searchParams.get('batch_id');
    console.log('Export request received:', { batch_id, user_id, BASE_URL });
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }
    if (!batch_id) {
      return NextResponse.json(
        { error: 'batch_id is missing' },
        { status: 400 }
      );
    }
    const { fileData, contentDisposition } = await BatchResultExportFunc(batch_id, user_id);
    return new Response(fileData, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': contentDisposition || 'attachment; filename="usage-logs.xlsx"',
      }
    });
  } catch (error) {
    console.error('Export Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
async function BatchResultExportFunc(
  batchId: string,
  userId: string
): Promise<{ fileData: ArrayBuffer; contentDisposition: string | null }> {
  const response = await fetch(
    `${BASE_URL}/batch-automation/export-file/${batchId}`,
    {
      method: 'GET',
      headers: {
        'user-id': userId,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    }
  );
  console.log('Download response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Export API error:', errorText);
    throw new Error(
      `API request failed with status ${response.status}: ${errorText}`
    );
  }
  const xlsxData = await response.arrayBuffer();
  const contentDisposition = response.headers.get('content-disposition');
  console.log('File downloaded successfully:', {
    contentDisposition,
    fileSize: xlsxData.byteLength
  });
  return {
    fileData: xlsxData,
    contentDisposition
  };
}