export const runtime = 'edge';
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface BatchQueueRequest {
  user_id: string;
  file_ids: string[];
  prompt_list: string[];
}
interface BatchQueueResponse {
  message: string;
}
export async function POST(req: Request): Promise<Response> {
  try {
    const { user_id, file_ids, prompt_list } = (await req.json()) as BatchQueueRequest;
    if (!file_ids || !user_id || !prompt_list) {
      return new Response(
        JSON.stringify({ error: 'file_ids, user_id, or prompt_list is missing' }),
        { status: 400 }
      );
    }
    const response = await addToBatchQueue(user_id, file_ids, prompt_list);
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in POST:', error);
    return new Response(
      JSON.stringify({
        error: 'Error processing batch queue request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}
async function addToBatchQueue(
  userID: string,
  file_ids: string[],
  promptList: string[]
): Promise<BatchQueueResponse> {
  try {
    const response = await fetch(`${baseURL}/document/add-to-batch-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: userID,
        file_ids: file_ids,
        prompt_list: promptList,
      }),
    });
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error response from document:', errorDetails);
      throw new Error(`Failed to add to batch queue with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse: BatchQueueResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error adding to batch queue:', error);
    throw error;
  }
}