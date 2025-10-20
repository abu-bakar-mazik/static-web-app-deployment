import { BatchAutomationJobRequest, ListBatchAutomationJobsResponse, SelectedPrompt } from '@/types/batch-automation-types';
import { NextResponse } from 'next/server';
import { title } from 'process';
export const runtime = 'edge';
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id');
    const { title, folder_path, process_type, selected_prompts, selected_categories } = (await req.json()) as BatchAutomationJobRequest;
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    if (!folder_path || !process_type || !selected_prompts || !selected_categories) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing folder_path or process_type or selected_prompts or selected_categories',
        },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const response = await addToBatchQueue(user_id, title, folder_path, process_type, selected_prompts, selected_categories);
    return NextResponse.json(response, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST /api/batchAutomation/createBatchAutomationJob:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error processing batch automation job request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
async function addToBatchQueue(user_id: string, title: string, folder_path: string, process_type: string, selected_prompts: SelectedPrompt[], selected_categories: string[]): Promise<ListBatchAutomationJobsResponse> {
  try {
    const response = await fetch(`${baseURL}/batch-automation/create-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'user-id': user_id
      },
      body: JSON.stringify({
        title,
        folder_path,
        process_type,
        selected_prompts,
        selected_categories,
      }),
    });
    console.log(response);
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error response from backend:', errorDetails);
      throw new Error(`Backend returned status ${response.status}: ${response.statusText}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error calling backend createBatchAutomationJob:', error);
    throw error;
  }
}
