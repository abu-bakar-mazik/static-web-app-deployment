import { ChatBody } from '@/types/types';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: Request): Promise<Response> {
  try {
    const { inputCode, chat_id, user_id, file_id, file_ids, token, model } = (await req.json()) as ChatBody;
    if (!user_id) {
      throw new Error('user_id is missing');
    }
    console.log('File ids', file_ids);
    const { response, history } = await AzureOpenAIStream(inputCode, user_id, chat_id, file_id, file_ids, token, model);
    const fullResponse = {
      response,
      history,
    };
    return new Response(JSON.stringify(fullResponse), { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return new Response('Error', { status: 500 });
  }
}
async function AzureOpenAIStream(inputCode: string, user_id: string, chat_id?: string, file_id?: string, file_ids?: Array<string>, token?: { input: number; output: number; total: number }, model?: string | null): Promise<{ response: string; history: Array<{ content: string; role: string }> }> {
  const finalChatId = chat_id ?? '';
  if (file_id) {
    const response = await fetch(`${BASE_URL}/document/ConversationonRAG`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        file_id: file_id,
        message: inputCode,
        chat_id: chat_id,
        token: token,
        model: model,
      }),
    });
    if (!response.ok) {
      throw new Error(`Azure OpenAI API request failed with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log('jsonResponse', jsonResponse);
    return {
      response: jsonResponse.response,
      history: jsonResponse.history,
    };
  } else if (file_ids) {
    const response = await fetch(`${BASE_URL}/document/ConversationonRAG`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        file_ids: file_ids,
        chat_id: finalChatId,
        message: inputCode,
        token: token,
        model: model,
      }),
    });
    if (!response.ok) {
      throw new Error(`Azure OpenAI API request failed with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log('jsonResponse', jsonResponse);
    return {
      response: jsonResponse.response,
      history: jsonResponse.history,
    };
  } else {
    const response = await fetch(`${BASE_URL}/document/ConversationonRAG`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        chat_id: finalChatId,
        message: inputCode,
        token: token,
        model: model,
      }),
    });
    if (!response.ok) {
      throw new Error(`Azure OpenAI API request failed with status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    console.log('jsonResponse', jsonResponse);
    return {
      response: jsonResponse.response,
      history: jsonResponse.history,
    };
  }
}
