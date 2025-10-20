import { SelectedCategories } from "@/redux/types";

export interface Document {
  file_id: string;
  name?: string;
  status: 'uploading' | 'pending' | 'processing' | 'Success' | 'error' | 'Duplicate';
  progress?: number;
  server_file_id?: string;
  error?: string;
  file_path?: string;
  datetime?: string;
}

export interface FileStatusUploadResponse {
  file_metadata: Array<{
    status: string;
    file_metadata: any;
    datetime: string;
    file_id: string;
    file_path: string;
    name: string;
  }>;
  message?: string;
}

export interface UploadResponse {
  status?: string;
  name?: string;
  file_id?: string;
  file_path?: string;
  datetime?: string;
}

export interface QueueItem {
  status: string;
  error: string;
  metadata: {
    file_id: string;
    datetime: string;
    name: string;
    file_path: string;
  };
}

export interface QueueResponse {
  current_queue: QueueItem[];
}

export interface DeleteResponse {
  message: string;
}
export type FetchDocument = {
  id: string;
  name: string;
  filename: string;
  date: string;
  category: string;
  category_id: string;
  file_url: string;
  user_id: string;
};
export type   DocumentCategoryPayload = {
  file_ids: string[];
  categorization_mode: string;
  category_id: string;
  selected_categories?: SelectedCategories[];
}