export interface ResponseItem {
  question: string;
  answer: string;
  explanation: string;
}
export interface BatchResponse {
  prompt: string;
  response: ResponseItem;
  filename: string;
}
export interface QueueItem {
  status: 'success' | 'processing' | 'error';
  error: string;
  user_id: string;
  file_ids: string[];
  prompt_list: string[];
  id: string;
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
  timestamp: string;
  batch_response: {
    [key: string]: BatchResponse[];
  };
}
export interface QueueResponse {
  current_queue: QueueItem[];
  batch_history: QueueItem[];
}
export interface BatchQARequest {
  id: string;
  formattedPrompts: string[];
  fileIds: string[];
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  response?: BatchResponse[];
  chat_id?: string | null;
}