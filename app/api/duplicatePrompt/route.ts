import { DuplicatePromptRequest, DuplicatePromptResponse } from '@/types/prompt-types';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    if (!user_id) {
      return NextResponse.json(
        {
          error: 'Missing required header: user-id',
          status: 'error'
        },
        { status: 400 }
      );
    }
    let requestBody: DuplicatePromptRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          status: 'error'
        },
        { status: 400 }
      );
    }
    const { source_prompt_id, new_title, new_prompts } = requestBody;
    // Validate required fields
    if (!source_prompt_id || !source_prompt_id.trim()) {
      return NextResponse.json(
        {
          error: 'Missing required field: source_prompt_id',
          status: 'error'
        },
        { status: 400 }
      );
    }
    // Validate new_title if provided
    if (new_title !== undefined && new_title !== null && typeof new_title !== 'string') {
      return NextResponse.json(
        {
          error: 'new_title must be a string',
          status: 'error'
        },
        { status: 400 }
      );
    }
    // Validate new_prompts if provided
    if (new_prompts !== undefined && new_prompts !== null) {
      if (!Array.isArray(new_prompts)) {
        return NextResponse.json(
          {
            error: 'new_prompts must be an array of strings',
            status: 'error'
          },
          { status: 400 }
        );
      }
      // Check if all prompts are strings
      const invalidPrompts = new_prompts.filter(p => typeof p !== 'string');
      if (invalidPrompts.length > 0) {
        return NextResponse.json(
          {
            error: 'All prompts in new_prompts must be strings',
            status: 'error'
          },
          { status: 400 }
        );
      }
      // Check for non-empty prompts after trimming
      const validPrompts = new_prompts.filter(p => p && p.trim());
      if (validPrompts.length === 0) {
        return NextResponse.json(
          {
            error: 'new_prompts must contain at least one non-empty string',
            status: 'error'
          },
          { status: 400 }
        );
      }
    }
    // Call the external API
    const response = await duplicatePrompt(user_id, {
      source_prompt_id,
      new_title,
      new_prompts
    });
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error duplicating prompt:', error);
    // Handle different error types
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      // Access denied or permission errors
      if (errorMessage.includes('access denied') ||
        errorMessage.includes('permission') ||
        errorMessage.includes('forbidden')) {
        return NextResponse.json(
          {
            error: 'Access denied: You don\'t have permission to duplicate this prompt',
            status: 'error'
          },
          { status: 403 }
        );
      }
      // Not found errors
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        return NextResponse.json(
          {
            error: 'Source prompt not found',
            status: 'error'
          },
          { status: 404 }
        );
      }
      // Rate limit errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded. Please try again later.',
            status: 'error'
          },
          { status: 429 }
        );
      }
      // Server errors
      if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
        return NextResponse.json(
          {
            error: 'Internal server error. Please try again later.',
            status: 'error'
          },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      {
        error: 'Error duplicating prompt',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
async function duplicatePrompt(
  user_id: string,
  duplicateRequest: DuplicatePromptRequest
): Promise<DuplicatePromptResponse> {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined in environment variables.');
  }
  try {
    const response = await fetch(`${BASE_URL}/prompt-sharing/duplicate-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'user-id': user_id,
      },
      body: JSON.stringify(duplicateRequest),
    });
    // Handle different HTTP status codes
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = '';
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorJson.message || errorMessage;
            errorDetails = errorJson.error || '';
          } catch {
            errorMessage = errorText;
          }
        }
      } catch (textError) {
        console.error('Error reading response text:', textError);
      }
      // Throw error with status code information
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API server');
    }
    console.error('Error in duplicatePrompt function:', error);
    throw error;
  }
}