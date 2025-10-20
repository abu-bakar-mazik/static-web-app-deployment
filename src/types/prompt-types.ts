export interface PromptInsertResponse {
  status: string;
  PromptTitle: string;
  Prompt: string[];
  ID: string;
  datetime: string;
}

export interface InsertPromptRequest {
  title: string;
  prompt: string[];
}

export interface UpdatePromptRequest {
  prompt_id: string;
  title: string;
  prompt: string[];
}

export interface PromptUpdateResponse {
  status: string;
  PromptID: string;
  UpdatedTitle: string;
  UpdatedPrompt: string[];
  UpdatedDatetime: string;
}

export interface BulkDeleteRequest {
  status: string;
}

export interface DeleteByIdResponse {
  status: string;
  DeletedPromptId: string;
}

export interface Prompt {
  id: string;
  title: string;
  prompt: string[];
  datetime: string;
  is_owner?: boolean;
  shared_by?: string;
}
export interface ValidationError {
  title?: string;
  prompt?: string[];
}

export interface DeletePromptRequest {
  prompt_id: string;
}

export interface SharedPrompt {
  id: string;
  user_id: string;
  title: string;
  prompts: string[][];
  datetime: string;
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  is_shared: boolean;
  shared_with: string[];
  shared_datetime: string;
  _ts: number;
  shared_by: string;
  permission_level: string;
  is_owner: boolean;
}

export interface GetSharedPromptsResponse {
  shared_prompts: SharedPrompt[];
  total_count: number;
}

export interface DuplicatePromptRequest {
  source_prompt_id: string;
  new_title?: string;
  new_prompts?: string[];
}
export interface DuplicatePromptFrom {
  original_id: string;
  original_owner: string;
  original_title: string;
  original_prompts_count: number;
  duplicated_datetime: string;
  access_type: string;
  customizations: {
    title_customized: boolean;
    prompts_customized: boolean;
    new_prompts_count: number;
  };
}
export interface DuplicatePrompt {
  id: string;
  user_id: string;
  title: string;
  prompts: string[];
  datetime: string;
  visibility: string;
  is_shared: boolean;
  shared_with: string[];
  is_duplicate: boolean;
  original_prompt_id: string;
  original_owner_id: string;
  duplicated_from: DuplicatePromptFrom;
}

export interface DuplicatePromptResponse {
  status: string;
  message: string;
  duplicated_prompt: DuplicatePrompt;
  original_prompt_id: string;
  new_prompt_id: string;
  duplication_metadata: {
    original_title: string;
    new_title: string;
    original_prompts_count: number;
    new_prompts_count: number;
    access_type: string;
    duplicated_datetime: string;
    customizations_applied: {
      title_customized: boolean;
      prompts_customized: boolean;
    };
  };
}

export interface RemoveFromViewRequest {
  prompt_id: string;
  action: 'hide' | 'unhide';
}

export interface RemoveFromViewResponse {
  status: string;
  message: string;
  action: string;
  prompt_id: string;
}