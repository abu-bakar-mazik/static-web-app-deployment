import { DeleteLogsParams, DeleteLogsResponse } from "@/redux/types";

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function DELETE(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const recordObjects = body.record_objects || body.recordObjects;
    if (!recordObjects || !Array.isArray(recordObjects)) {
      return new Response(JSON.stringify({ error: 'record_objects is required and must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const response = await DeleteRecords({
      record_objects: recordObjects
    });
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
async function DeleteRecords(params: DeleteLogsParams): Promise<DeleteLogsResponse> {
  const response = await fetch(`${BASE_URL}/llm-logs/delete_usage_record`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }
  const jsonResponse = await response.json();
  console.log('Delete API Response:', jsonResponse);
  return jsonResponse;
}