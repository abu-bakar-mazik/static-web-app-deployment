import { ListBatchAutomationJobsResponse, SelectedCategory, SelectedPrompt } from "@/types/batch-automation-types";
import { NextResponse } from "next/server";
export const runtime = 'edge';
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const user_id = req.headers.get('user-id') as string;
    const { title, batch_id, process_type, selected_prompts, selected_categories } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: `Missing required field: user_id` }, { status: 400 });
    }
    if (!batch_id) {
      return NextResponse.json({ error: `Missing required field: batch_id` }, { status: 400 });
    }
    if (!process_type || !selected_prompts || !selected_categories) {
      return NextResponse.json({ error: `Missing required field: process_type or selected_prompts or selected_categories` }, { status: 400 });
    }
    const response = await cloneBatchFunc(user_id, title, batch_id, process_type, selected_prompts, selected_categories);
    return NextResponse.json(
      response,
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      {
        error: 'Error processing batch clone request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
async function cloneBatchFunc(
  user_id: string,
  title: string,
  batch_id: string,
  process_type: string,
  selected_prompts: SelectedPrompt[],
  selected_categories: string[]
): Promise<ListBatchAutomationJobsResponse> {
  try {
    const response = await fetch(`${baseURL}/batch-automation/batch-clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'user-id': user_id
      },
      body: JSON.stringify({
        title,
        process_type,
        batch_id: batch_id,
        selected_prompts: selected_prompts,
        selected_categories: selected_categories
      }),
    });
    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({ detail: 'Unknown error' }));
      if (errorDetails.detail?.includes('already uses process type')) {
        throw new Error(errorDetails.detail);
      }
      throw new Error(`Failed to clone batch with status ${response.status}: ${errorDetails.detail || response.statusText}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.error('Error cloning batch:', error);
    throw error;
  }
}