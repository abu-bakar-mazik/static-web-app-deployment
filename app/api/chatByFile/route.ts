import { ChatBody } from '@/types/types';

export const runtime = 'edge';


export async function POST(req: Request): Promise<Response> {
  try {
    const { inputCode, chat_id, user_id } = (await req.json()) as ChatBody;

    if (!user_id) {
      throw new Error('user_id is missing');
    }
    const { response, history } = await AzureOpenAIStream(inputCode, user_id, chat_id);

    // Combine response and history in the final output
    const fullResponse = {
      response,
      history
    };

    return new Response(JSON.stringify(fullResponse), { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return new Response('Error', { status: 500 });
  }
}

async function AzureOpenAIStream(inputCode: string,  user_id: string, chat_id?: string): Promise<{ response: string; history: Array<{ content: string; role: string }> }> {

  const finalChatId = chat_id ?? "";
  const response = await fetch(`https://secure-gpt.azurewebsites.net/api/SimpleChat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: user_id,
      chat_id: finalChatId,
      message: inputCode,
    })
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI API request failed with status ${response.status}: ${response.statusText}`);
  }

  // Parse the JSON response
  const jsonResponse = await response.json();

  console.log("jsonResponse", jsonResponse);

  // Return an object with 'response' and 'history' fields
  return {
    response: jsonResponse.response,
    history: jsonResponse.history
  };
}

