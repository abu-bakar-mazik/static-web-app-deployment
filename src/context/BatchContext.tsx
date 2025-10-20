import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { BatchQARequest, QueueItem, QueueResponse } from '@/types/batch-types';
import { useDeleteBatchByIdMutation } from '@/redux/slices/batchSlice';
interface BatchQAContextType {
  requests: BatchQARequest[];
  completedBatches: QueueItem[];
  isProcessing: boolean;
  processBatchQA: (message: string[], fileIds: string[]) => Promise<void>;
  registerRefreshCallback: (callback: () => void) => void;
  checkQueueStatus: (requestId: string) => Promise<QueueItem | null>;
  updateCompletedBatches: () => void;
  handleDeleteBatch: (batchId: string) => void;
  loadingBatchId: string | null;
}
const BatchQAContext = createContext<BatchQAContextType | undefined>(undefined);
const LOCALSTORAGE_KEY = 'batch_qa_requests';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const BatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deleteBatch] = useDeleteBatchByIdMutation();
  const { userId } = useAuth();
  const [requests, setRequests] = useState<BatchQARequest[]>([]);
  const [completedBatches, setCompletedBatches] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const refreshCallbackRef = useRef<(() => void) | null>(null);
  const processInProgressRef = useRef(false);
  const clearRequestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestsRef = useRef<BatchQARequest[]>([]);
  const [loadingBatchId, setLoadingBatchId] = useState<string | null>(null);
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);
  useEffect(() => {
    const savedRequests = localStorage.getItem(LOCALSTORAGE_KEY);
    if (savedRequests) {
      const parsedRequests: BatchQARequest[] = JSON.parse(savedRequests);
      const validRequests = parsedRequests.filter((request) => request.status === 'processing');
      setRequests((prevRequests) => [...validRequests, ...prevRequests]);
      if (validRequests.length > 0) {
        resumeRequestProcessing(validRequests);
      }
    }
    if (userId) {
      updateCompletedBatches();
    }
  }, []);
  useEffect(() => {
    const requestsToSave = requests.filter((request) => request.status === 'processing');
    if (requestsToSave.length > 0) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(requestsToSave));
    } else {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
  }, [requests]);
  const registerRefreshCallback = (callback: () => void) => {
    refreshCallbackRef.current = callback;
  };
  const notifyRefresh = () => {
    if (refreshCallbackRef.current) {
      refreshCallbackRef.current();
    }
  };
  const checkQueueStatus = async (requestId: string): Promise<QueueItem | null> => {
    const response = await fetch('/api/batchQAStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: userId,
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Status fetch failed: ${response.status} - ${errorData}`);
    }
    const queueData: QueueResponse = await response.json();
    const successfulCurrentItems = queueData.current_queue.filter((item) => item.status === 'success');
    const historyItems = queueData.batch_history ? Object.values(queueData.batch_history) : [];
    const allSuccessfulBatches = [...successfulCurrentItems, ...historyItems];
    const sortedBatches = allSuccessfulBatches.sort((a, b) => {
      const timeA = a._ts ? a._ts : new Date(a.timestamp).getTime() / 1000;
      const timeB = b._ts ? b._ts : new Date(b.timestamp).getTime() / 1000;
      return timeB - timeA;
    });
    setCompletedBatches(sortedBatches);
    if (!requestId) {
      return null;
    }
    const currentRequest = requestsRef.current.find((r) => r.id === requestId);
    if (!currentRequest) {
      return null;
    }
    const matchingItems = queueData.current_queue.filter((item) => item.file_ids.join(',') === currentRequest.fileIds.join(',') && JSON.stringify(item.prompt_list) === JSON.stringify(currentRequest.formattedPrompts));
    // If we have multiple matching items, get the most recent one based on timestamp
    if (matchingItems.length > 0) {
      // Sort by timestamp, newest first
      matchingItems.sort((a, b) => {
        const timeA = a._ts ? a._ts : new Date(a.timestamp).getTime() / 1000;
        const timeB = b._ts ? b._ts : new Date(b.timestamp).getTime() / 1000;
        return timeB - timeA;
      });
      // If the current request already has a chat_id assigned, prioritize that match
      if (currentRequest.chat_id) {
        const exactMatch = matchingItems.find((item) => item.id === currentRequest.chat_id);
        if (exactMatch) {
          return exactMatch;
        }
      }
      // Otherwise use the most recent matching item
      return matchingItems[0];
    }
    return null;
  };
  const updateCompletedBatches = async () => {
    try {
      await checkQueueStatus('');
    } catch (error) {
      console.error('Error updating completed batches:', error);
    }
  };
  const resumeRequestProcessing = async (requestsToResume: BatchQARequest[]) => {
    if (processInProgressRef.current) return;
    processInProgressRef.current = true;
    setIsProcessing(true);
    try {
      for (const request of requestsToResume) {
        await pollStatus(request.id);
      }
    } catch (error) {
      console.error('Error resuming request processing:', error);
    } finally {
      processInProgressRef.current = false;
      setIsProcessing(false);
    }
  };
  const scheduleClearRequests = () => {
    if (clearRequestTimeoutRef.current) {
      clearTimeout(clearRequestTimeoutRef.current);
    }
    clearRequestTimeoutRef.current = setTimeout(() => {
      setRequests((prevRequests) => {
        const remainingProcessingRequests = prevRequests.filter((request) => request.status === 'processing');
        if (remainingProcessingRequests.length === 0) {
          localStorage.removeItem(LOCALSTORAGE_KEY);
        }
        return remainingProcessingRequests;
      });
    }, 4000);
  };
  const pollStatus = async (requestId: string): Promise<void> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 3000;
    let retryCount = 0;
    return new Promise(async (resolve, reject) => {
      let lastCompletedFiles = 0;
      const processingProgressInterval = setInterval(() => {
        setRequests((prevRequests) =>
          prevRequests.map((r) => {
            if (r.id === requestId && r.status === 'processing') {
              const fileProgressStep = 100 / r.fileIds.length;
              const completedFilesProgress = lastCompletedFiles * fileProgressStep;
              if (completedFilesProgress < 100) {
                const currentFileProgress = Math.min(2, fileProgressStep / 10);
                const maxProgress = Math.min((lastCompletedFiles + 1) * fileProgressStep, 100);
                const newProgress = Math.min(r.progress + currentFileProgress, maxProgress);
                return { ...r, progress: newProgress };
              }
            }
            return r;
          }),
        );
      }, 500);
      const poll = async (): Promise<void> => {
        try {
          const queueItem = await checkQueueStatus(requestId);
          if (!queueItem) {
            throw new Error('Request not found in queue');
          }
          const completedFiles = Object.keys(queueItem.batch_response || {}).length;
          const totalFiles = queueItem.file_ids.length;
          if (completedFiles > lastCompletedFiles) {
            lastCompletedFiles = completedFiles;
            const exactProgress = Math.min((completedFiles / totalFiles) * 100, 100);
            setRequests((prevRequests) =>
              prevRequests.map((r) =>
                r.id === requestId
                  ? {
                      ...r,
                      progress: exactProgress,
                      completedFiles,
                      totalFiles,
                    }
                  : r,
              ),
            );
          }
          if (queueItem.status === 'success') {
            clearInterval(processingProgressInterval);
            handleCompletedStatus(queueItem, requestId);
            resolve();
            return;
          }
          if (queueItem.status === 'error') {
            clearInterval(processingProgressInterval);
            handleFailedStatus(requestId, new Error(queueItem.error));
            resolve();
            return;
          }
          retryCount = 0;
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return poll();
        } catch (error: any) {
          console.error('Poll error:', error);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * retryCount));
            return poll();
          } else {
            clearInterval(processingProgressInterval);
            handleFailedStatus(requestId, error);
            reject(error);
          }
        }
      };
      return poll();
    });
  };
  const processBatchQA = async (prompts: string[], fileIds: string[]) => {
    if (!userId || fileIds.length === 0) {
      toaster.create({
        title: 'Invalid request',
        description: 'User ID and file IDs are required',
        type: 'error',
      });
      return;
    }
    setIsProcessing(true);
    const requestId = crypto.randomUUID();
    const newRequest: BatchQARequest = {
      id: requestId,
      formattedPrompts: prompts,
      fileIds,
      status: 'processing',
      progress: 0,
    };
    setRequests((prev) => [...prev, newRequest]);
    try {
      const response = await fetch('/api/batchQA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          file_ids: fileIds,
          prompt_list: prompts,
        }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to start batch QA: ${errorData}`);
      }
      // Capture the response which might contain the server-side batch ID
      const responseData = await response.json();
      // Store the server-side batch ID if available
      if (responseData.batch_id) {
        setRequests((prevRequests) => prevRequests.map((r) => (r.id === requestId ? { ...r, chat_id: responseData.batch_id } : r)));
      }
      await pollStatus(requestId);
    } catch (error) {
      console.error('Error processing batch QA:', error);
      setRequests((prevRequests) => prevRequests.map((r) => (r.id === requestId ? { ...r, status: 'failed', progress: 0 } : r)));
      toaster.create({
        title: 'Error processing request',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleCompletedStatus = (queueItem: QueueItem, requestId: string) => {
    notifyRefresh();
    setRequests((prevRequests) =>
      prevRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'completed',
              progress: 100,
              response: Object.values(queueItem.batch_response).flat(),
              chat_id: queueItem.id,
            }
          : r,
      ),
    );
    toaster.create({
      title: 'Analysis completed successfully',
      type: 'success',
    });
    scheduleClearRequests();
  };
  const handleFailedStatus = (requestId: string, error: Error) => {
    setRequests((prevRequests) =>
      prevRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'failed',
              progress: 0,
            }
          : r,
      ),
    );
    toaster.create({
      title: 'Error processing request',
      description: error.message,
      type: 'error',
    });
    scheduleClearRequests();
  };
  const handleDeleteBatch = async (batchId: string) => {
    try {
      setLoadingBatchId(batchId);
      const response = await deleteBatch({ userId, batchId }).unwrap();
      toaster.create({
        title: response.message,
        type: 'success',
        duration: 3000,
      });
      await checkQueueStatus('');
    } catch (error: any) {
      toaster.create({
        title: 'Error deleting batch',
        description: error.data?.details || 'An unexpected error occurred',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoadingBatchId(null);
    }
  };
  return (
    <BatchQAContext.Provider
      value={{
        requests,
        completedBatches,
        isProcessing,
        processBatchQA,
        registerRefreshCallback,
        checkQueueStatus,
        updateCompletedBatches,
        handleDeleteBatch,
        loadingBatchId,
      }}
    >
      {children}
    </BatchQAContext.Provider>
  );
};
export const useBatchQA = (): BatchQAContextType => {
  const context = useContext(BatchQAContext);
  if (!context) {
    throw new Error('useBatchQA must be used within a BatchQAProvider');
  }
  return context;
};
