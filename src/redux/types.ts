import { FetchDocument } from "@/types/doc-types";

export interface LogEntry {
  id: string;
  user_id: string;
  user_name: string;
  request_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  model_name: string;
  request_id: string;
  parent_id: string;
  request_time: string;
}
export interface User {
  id: string;
  name: string;
}
export interface UsageLogsRequest {
  user_ids?: string[];
  start_date?: string;
  end_date?: string;
  model_names?: string;
  request_types?: string;
  offset?: number;
  limit?: number;
}
export interface FetchLogsRequest {
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  modelName?: string;
  requestType?: string;
  offset?: number;
  limit?: number;
  order?: 'newest' | 'oldest';
}
export interface LogoResponse {
  url: string;
}
export interface CustomError {
  status: 'TIMEOUT_ERROR' | 'FETCH_ERROR';
  error: string;
}
export interface RetrieverStatusResponse {
  message: string;
  status: string;
}
export interface ChunkSizeResponse {
  message: string;
  chunk_size: string;
  overlap_size: string;
}
export type Model = string;
export type ModelsResponse = Model[];
export interface FormErrors {
  chunkSize?: string;
  overlapSize?: string;
}
export interface ApiUser {
  userid: string;
  email: string;
  username: string;
}
export interface EnhancedUser extends User {
  isSelected?: boolean;
}
export interface SearchUsersResponse {
  users: ApiUser[];
  total_count: number;
  filtered_count: number;
  message: string;
}
export interface RecordObject {
  record_id: string;
  user_id: string;
}
export interface DeleteLogsParams {
  record_objects: RecordObject[];
}
export interface DeleteLogsResponse {
  message: string;
  deleted: string;
  failed: string;
}
export interface LogsTokenSummary {
  model_name: string,
  total_input_tokens: number,
  total_output_tokens: number,
  total_tokens: number
}
export interface LogsResponse {
  records: LogEntry[];
  total_returned: number;
  total_available: number;
  tokens_summary: LogsTokenSummary[]
}
export interface AdminState {
  logs: LogEntry[];
  allUsers: ApiUser[];
  allSelectedUsers: string[];
  users: ApiUser[];
  selectedUsers: string[];
  startDate: string;
  endDate: string;
  tableHeaders: string[];
  isLoading: boolean;
  isLoadingUsers: boolean;
  error: string | null;
  formErrors: FormErrors;
  currentPage: number,
  totalRecords: number,
  availableRecords: number,
  limit: number,
  offset: number,
  hasMoreData: boolean,
  selectedModelName: string[],
  selectedRequestType: string[]
  tokenSummary: LogsTokenSummary[]
}


/* file upload state */
export interface GetAllDocumentsRequest {
  user_id: string;
  offset: number;
  limit: number;
  order: 'newest' | 'oldest';
  category_ids?: string[];
}
export interface FileRecord {
  user_id: string;
  file_id: string;
  file_name: string;
  category_id: string;
  category_name: string;
  file_url: string;
  datetime: string;
}
export interface CategorySummary {
  category_id: string;
  category_name: string;
  document_count: number;
}
export interface GetAllDocumentsResponse {
  records: FileRecord[];
  total_returned: number;
  total_available: number;
  summary: CategorySummary[];
}
export interface SelectedCategories {
    id: string,
    user_id: string,
    category_name: string,
    rules: string
}
/* file share slice */
export interface FolderInfo {
  path: string;
  name: string;
  fileCount: number;
  hasSubfolders: boolean;
}
export interface FileShareFoldersResponse {
  success: boolean;
  folders: FolderInfo[];
  message: string;
  totalFolders: number;
}