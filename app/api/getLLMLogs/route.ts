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
    const offset = body.offset || 0;
    const limit = body.limit || 50;
    const order = body.order;
    const response = await LLMUsageAnalysis({
      userIds,
      startDate,
      endDate,
      modelNames,
      requestTypes,
      offset,
      limit,
      order
    });
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
interface LLMUsageParams {
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  modelNames?: string;
  requestTypes?: string;
  offset?: number;
  limit?: number;
  order?: 'newest' | 'oldest';
}
async function LLMUsageAnalysis(params: LLMUsageParams): Promise<any> {
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
    requestBody.model_names = Array.isArray(params.modelNames)
      ? params.modelNames
      : [params.modelNames];
  }
  if (params.requestTypes) {
    requestBody.request_types = Array.isArray(params.requestTypes)
      ? params.requestTypes
      : [params.requestTypes];
  }
  if (params.offset !== undefined) {
    requestBody.offset = params.offset;
  }
  if (params.limit !== undefined) {
    requestBody.limit = params.limit;
  }
  if (params.order !== undefined) {
    requestBody.order = params.order;
  }
  const response = await fetch(`${BASE_URL}/llm-logs/get_usage_records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }
  const jsonResponse = await response.json();
  console.log('API Response:', jsonResponse);
  return jsonResponse;
}