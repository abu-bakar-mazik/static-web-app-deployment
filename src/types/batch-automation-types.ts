// Enums as const objects
export const BATCH_STATUS = {
  QUEUE: 'queue',
  PROCESSING: 'processing',
  PAUSE: 'pause',
  CANCEL: 'cancel',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ERROR: 'error'
} as const;
export const PROCESS_TYPE = {
  CATEGORIZATION: 'automation-categorization',
  FULL_ANALYSIS: 'automation-fullanalysis',
  CATEGORIZATION_AND_FULL_ANALYSIS: 'automation-categorization-fullanalysis'
} as const;
export const QUEUE_MESSAGE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;
// Types
export type BatchStatus = typeof BATCH_STATUS[keyof typeof BATCH_STATUS];
export type ProcessType = typeof PROCESS_TYPE[keyof typeof PROCESS_TYPE];
export type QueueMessageStatus = typeof QUEUE_MESSAGE_STATUS[keyof typeof QUEUE_MESSAGE_STATUS];
// Labels - simplified using computed property names
export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  queue: 'Queued',
  processing: 'Processing',
  pause: 'Paused',
  cancel: 'Cancelled',
  completed: 'Completed',
  failed: 'Failed',
  error: 'Error'
};
export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  'automation-categorization': 'Categorization',
  'automation-fullanalysis': 'Full Analysis',
  'automation-categorization-fullanalysis': 'Categorization & Full Analysis'
};
// Interfaces
export interface SelectedPrompt {
  prompt_id: string;
  prompt_index: number;
  prompt_text: string;
  prompt_name: string;
}
export interface SelectedCategory {
  id: string;
  category_name: string;
  rules: string;
}
export interface BatchCategories {
  id: string;
  category_name: string;
  file_count: number;
}
export interface BatchCategoriesResponse {
  success: boolean;
  message: string;
  batch_id: string;
  batch_status: BatchStatus;
  total_completed_files: number;
  categories: BatchCategories[];
  can_clone: boolean;
  error: string | null;
}
export interface BatchAutomationJobRequest {
  title: string;
  folder_path: string;
  process_type: ProcessType;
  selected_prompts: SelectedPrompt[];
  selected_categories: string[];
}
export interface BatchAutomationJobResponse {
  success: boolean;
  batchId?: string;
  id: string;
  message: string;
  totalFiles?: number;
  error?: string;
}
export interface BatchAutomationJob {
  id: string;
  batchId: string;
  userId: string;
  fileSharePath: string;
  processType: ProcessType;
  status: BatchStatus;
  totalFiles: number;
  batchTitle: string;
  processedFiles: number;
  successfulFiles: number;
  failedFiles: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
}
export interface BatchAutomationFile {
  id: string;
  batchId: string;
  userId: string;
  fileName: string;
  fileLocation: string;
  fileSize: number;
  status: BatchStatus;
  category?: string;
  results?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
}
export interface BatchAutomationQueueMessage {
  id: string;
  automationQueue: string;
  status: QueueMessageStatus;
  fileId: string;
  batchId: string;
  userId: string;
  filePath: string;
  processType: ProcessType;
  createdAt: string;
  updatedAt: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  error?: string;
}
export interface LogicAppTriggerPayload {
  message: string;
  folderPath: string;
  user_id: string;
  process_type: ProcessType;
  batch_id: string;
}
export interface LogicAppResponse {
  timestamp: string;
  status: string;
  fileShare: string;
  storageAccount: string;
  folderPath: string;
  totalFiles: number;
  files: Array<{
    fileName: string;
    filePath: string;
    fileSize: number;
  }>;
  message: string;
}
export interface ListBatchAutomationJobsResponse {
  completed_files: number;
  created_at: string;
  error_files: number;
  folder_path: string;
  id: string;
  parent_batch_id: string | null;
  process_type: ProcessType;
  selected_categories: SelectedCategory[];
  selected_prompts: SelectedPrompt[];
  status: BatchStatus;
  title?: string;
  total_files: number;
  user_id: string;
  _attachments?: string;
  _etag?: string;
  _rid?: string;
  _self?: string;
  _ts: number;
}
// Utility functions - simplified
export const getBatchStatusLabel = (status: BatchStatus) => BATCH_STATUS_LABELS[status] || status;
export const getProcessTypeLabel = (type: ProcessType) => PROCESS_TYPE_LABELS[type] || type;
const TERMINAL_STATUSES = new Set<BatchStatus>([
  BATCH_STATUS.COMPLETED,
  BATCH_STATUS.FAILED,
  BATCH_STATUS.ERROR,
  BATCH_STATUS.CANCEL
]);
const ACTIVE_STATUSES = new Set<BatchStatus>([
  BATCH_STATUS.QUEUE,
  BATCH_STATUS.PROCESSING
]);
export const isTerminalStatus = (status: BatchStatus) => TERMINAL_STATUSES.has(status);
export const isActiveStatus = (status: BatchStatus) => ACTIVE_STATUSES.has(status);