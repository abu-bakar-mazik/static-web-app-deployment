export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const userIds = body.userIds || body.user_ids;
    const startDate = body.startDate || body.start_date;
    const endDate = body.endDate || body.end_date;
    const modelNames = body.modelNames || body.model_names;
    const requestTypes = body.requestTypes || body.request_types;
    const order = body.order;
    const { fileData, contentDisposition } = await LLMLogsExport({
      userIds,
      startDate,
      endDate,
      modelNames,
      requestTypes,
      order
    });
    return new Response(fileData, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': contentDisposition || 'attachment; filename="usage-logs.xlsx"',
      }
    });
  } catch (error) {
    console.error('Export Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
interface ExportParams {
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  modelNames?: string;
  requestTypes?: string;
  offset?: number;
  limit?: number;
  order?: 'newest' | 'oldest';
}
async function LLMLogsExport(params: ExportParams): Promise<{ fileData: ArrayBuffer; contentDisposition: string | null }> {
  const requestBody: any = {};
  if (params.userIds) {
    requestBody.user_ids = params.userIds;
  }
  if (params.startDate) {
    requestBody.start_date = params.startDate;
  }
  if (params.endDate) {
    requestBody.end_date = params.endDate;
  }
  if (params.modelNames) {
    requestBody.model_names = params.modelNames;
  }
  if (params.requestTypes) {
    requestBody.request_types = params.requestTypes;
  }
  if (params.order) {
    requestBody.order = params.order;
  }
  const response = await fetch(`${BASE_URL}/llm-logs/download_usage_csv_file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }
  const xlsxData = await response.arrayBuffer();
  const contentDisposition = response.headers.get('content-disposition');
  return {
    fileData: xlsxData,
    contentDisposition
  };
}