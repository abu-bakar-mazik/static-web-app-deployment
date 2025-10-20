export const runtime = 'edge';
const BASE_URL = process.env.BASE_URL;

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const { inputCode, model, apiKey } = (await req.json()) as ChatBody;

//     const apiKeyFinal = apiKey ?? process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY as string;

//     if (!apiKeyFinal) {
//       throw new Error('API key is missing');
//     }

//     const stream = await AzureOpenAIStream(inputCode, model, apiKeyFinal);

//     return new Response(stream);
//   } catch (error) {
//     logError('GET', error);
//     return new Response('Error', { status: 500 });
//   }
// }

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the request body to extract the code
    const { code } = await req.json();

    // Check if code is provided
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing code in request body' }),
        { status: 400 }
      );
    }

    // Fetch user ID using the code (error handling inside this function)
    const userId = await getUserIdFromMicrosoftCode(code);

    // If no user ID was retrieved, return an error response
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve user ID' }),
        { status: 500 }
      );
    }

    // Prepare full response with user ID
    const fullResponse = {
      userId: userId,
      message: 'User ID successfully retrieved',
    };

    // Return the success response with user ID
    return new Response(JSON.stringify(fullResponse), { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('POST Error:', error);

    // Return a generic error response
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
}


// Example function to fetch user ID from Microsoft using the provided code
async function getUserIdFromMicrosoftCode(code: string): Promise<string | null> {
  try {
    // Assume you're making an API call to retrieve the user ID
    const response = await fetch(`https://gpt-func.azurewebsites.net/api/GetUserId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // Parse the response to extract the user ID
    const data = await response.json();
    return data || null;
  } catch (error) {
    // Log the error and return null in case of failure
    console.error('Error fetching user ID:', error);
    return null;
  }
}

function logError(method: string, error: unknown) {
  console.error(`[${method}] Error:`, error);
}
