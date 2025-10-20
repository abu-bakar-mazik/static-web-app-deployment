const STATUS_CONFIG = {
  queue: { label: 'Queued', color: 'blue' },
  processing: { label: 'Processing', color: 'orange' },
  pause: { label: 'Paused', color: 'yellow' },
  cancel: { label: 'Cancelled', color: 'gray' },
  completed: { label: 'Completed', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
  error: { label: 'Error', color: 'red' },
} as const;

export const getStatusLabel = (status: string): string => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label 
    || status.toUpperCase().replace('_', ' ');
};

export const getStatusColor = (status: string): string => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'gray';
};
// Define status categories
export const ACTIVE_STATUSES = new Set(['queue', 'processing']);
export const COMPLETED_STATUSES = new Set(['completed']);
export const INACTIVE_STATUSES = new Set(['failed', 'cancel', 'pause', 'error']);
export const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancel', 'error', 'pause']);