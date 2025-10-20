import React, { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBatchAutomationJobMutation, useDeleteBatchAutomationJobMutation, batchAutomationApi, useCloneBatchMutation, useUpdateBatchAutomationStatusMutation } from '@/redux/slices/batchAutomationSlice';
import { useAppDispatch } from '@/redux/store';
import { BatchAutomationJob, BatchCategories, ProcessType, SelectedCategory, SelectedPrompt } from '@/types/batch-automation-types';
import { ACTIVE_STATUSES, COMPLETED_STATUSES, INACTIVE_STATUSES, TERMINAL_STATUSES } from '@/utils/statusHelper';
interface BatchAutomationContextType {
  activeJobs: BatchAutomationJob[];
  completedJobs: BatchAutomationJob[];
  inActiveJobs: BatchAutomationJob[];
  isProcessing: boolean;
  createBatchJob: (title: string, fileLocation: string, processingType: ProcessType, userId: string, selectedPrompts: SelectedPrompt[], selectedCategories: string[]) => Promise<void>;
  deleteBatchJob: (batchId: string) => Promise<void>;
  cloneBatchJob: (title: string, batch_id: string, process_type: string, selected_prompts: SelectedPrompt[], selected_categories: string[]) => Promise<any>;
  updateBatchStatus: (batchId: string, status: string, currentUserId: string) => Promise<any>;
  registerRefreshCallback: (callback: () => void) => void;
  loadingBatchId: string | null;
}
const BatchAutomationContext = createContext<BatchAutomationContextType | undefined>(undefined);
const LOCALSTORAGE_KEY = 'batch_automation_jobs';
const POLL_INTERVAL = 20000;
const MAX_POLL_ERRORS = 5;
export const BatchAutomationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const dispatch = useAppDispatch();
  const [createBatchAutomationJob] = useCreateBatchAutomationJobMutation();
  const [deleteBatch] = useDeleteBatchAutomationJobMutation();
  const [cloneBatch] = useCloneBatchMutation();
  const [updateBatchAutomationStatus] = useUpdateBatchAutomationStatusMutation();
  const [activeJobs, setActiveJobs] = useState<BatchAutomationJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<BatchAutomationJob[]>([]);
  const [inActiveJobs, setInActiveJobs] = useState<BatchAutomationJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingBatchId, setLoadingBatchId] = useState<string | null>(null);
  const refreshCallbackRef = useRef<(() => void) | null>(null);
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const activeJobsRef = useRef<BatchAutomationJob[]>([]);
  const fetchAllJobsRef = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    activeJobsRef.current = activeJobs;
  }, [activeJobs]);
  useEffect(() => {
    if (activeJobs.length > 0) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(activeJobs));
    } else {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
  }, [activeJobs]);
  const registerRefreshCallback = (callback: () => void) => {
    refreshCallbackRef.current = callback;
  };
  const notifyRefresh = () => {
    refreshCallbackRef.current?.();
  };
  const transformBatchJob = (backendJob: any): BatchAutomationJob => {
    const processedFiles = (backendJob.completed_files || 0) + (backendJob.failed_files || 0);
    const progress = backendJob.total_files > 0 ? Math.min((processedFiles / backendJob.total_files) * 100, 100) : 0;
    return {
      id: backendJob.id,
      batchId: backendJob.id,
      userId: backendJob.user_id,
      fileSharePath: backendJob.folder_path,
      processType: backendJob.process_type,
      status: backendJob.status,
      totalFiles: backendJob.total_files,
      batchTitle: backendJob.title || 'Batch Automation',
      processedFiles,
      successfulFiles: backendJob.completed_files,
      failedFiles: backendJob.error_files,
      progress,
      createdAt: backendJob.created_at,
      updatedAt: backendJob.updated_at,
      errorMessage: backendJob.error_message,
    };
  };
  const fetchJobStatus = useCallback(
    async (batchId: string, currentUserId: string): Promise<any> => {
      try {
        const result = await dispatch(batchAutomationApi.endpoints.getBatchAutomationStatus.initiate({ batchId, userId: currentUserId || '' }, { forceRefetch: true })).unwrap();
        return result;
      } catch (error) {
        console.log('Error fetching job status:', error);
        throw error;
      }
    },
    [dispatch],
  );
  const stopPolling = useCallback((batchId: string) => {
    const interval = pollingIntervalsRef.current.get(batchId);
    if (interval) {
      clearInterval(interval);
      pollingIntervalsRef.current.delete(batchId);
    }
  }, []);
  const fetchAllJobs = useCallback(async () => {
    if (!userId) {
      console.log('⚠️ No userId, skipping fetchAllJobs');
      return;
    }
    try {
      const result = await dispatch(batchAutomationApi.endpoints.listBatchAutomationJobs.initiate({ userId }, { forceRefetch: true })).unwrap();
      const dataArray = Array.isArray(result) ? result : [];
      if (!Array.isArray(dataArray)) {
        console.log('❌ Invalid jobs data format:', result);
        return;
      }
      const transformedJobs = dataArray.map(transformBatchJob);
      const active = transformedJobs.filter((job) => ACTIVE_STATUSES.has(job.status));
      const completed = transformedJobs.filter((job) => COMPLETED_STATUSES.has(job.status));
      const inactive = transformedJobs.filter((job) => INACTIVE_STATUSES.has(job.status));
      setActiveJobs([...active]);
      setCompletedJobs([...completed]);
      setInActiveJobs([...inactive]);
      active.forEach((job) => {
        if (!pollingIntervalsRef.current.has(job.batchId)) {
          startPolling(job.batchId, job.status);
        }
      });
      pollingIntervalsRef.current.forEach((_, batchId) => {
        const isStillActive = active.some((job) => job.batchId === batchId);
        if (!isStillActive) {
          stopPolling(batchId);
        }
      });
    } catch (error) {
      console.log('❌ Error fetching all jobs:', error);
    }
  }, [userId, dispatch]);
  useEffect(() => {
    fetchAllJobsRef.current = fetchAllJobs;
  }, [fetchAllJobs]);
  const startPolling = useCallback(
    (batchId: string, initialStatus: string) => {
      if (pollingIntervalsRef.current.has(batchId)) {
        return;
      }
      let errorCount = 0;
      const pollJob = async () => {
        try {
          const currentJob = activeJobsRef.current.find((j) => j.batchId === batchId);
          if (!currentJob) {
            stopPolling(batchId);
            return;
          }
          const statusData = await fetchJobStatus(batchId, currentJob.userId);
          errorCount = 0;
          const processedFiles = (statusData.completed_files || 0) + (statusData.failed_files || 0);
          const progress = statusData.total_files > 0 ? Math.min((processedFiles / statusData.total_files) * 100, 100) : 0;
          if (TERMINAL_STATUSES.has(statusData.status)) {
            stopPolling(batchId);
            if (statusData.status === 'completed') {
              toaster.create({
                title: 'Batch automation completed',
                description: `Successfully processed ${statusData.completed_files || 0} files`,
                type: 'success',
              });
            } else if (statusData.status === 'failed' || statusData.status === 'error') {
              toaster.create({
                title: 'Batch automation failed',
                description: statusData.error_message || 'Job failed to complete',
                type: 'error',
              });
            }
            if (fetchAllJobsRef.current) {
              await fetchAllJobsRef.current();
            }
            notifyRefresh();
            return;
          }
          setActiveJobs((prevJobs) => {
            const updated = prevJobs.map((job) =>
              job.batchId === batchId
                ? {
                    ...job,
                    status: statusData.status,
                    totalFiles: statusData.total_files || 0,
                    processedFiles,
                    successfulFiles: statusData.completed_files || 0,
                    failedFiles: statusData.failed_files || 0,
                    progress,
                    errorMessage: statusData.error_message,
                    updatedAt: statusData.updated_at || new Date().toISOString(),
                  }
                : job,
            );
            return updated;
          });
        } catch (error) {
          errorCount++;
          console.log(`❌ Error polling job ${batchId} (attempt ${errorCount}/${MAX_POLL_ERRORS}):`, error);
          if (errorCount >= MAX_POLL_ERRORS) {
            console.log(`❌ Max errors reached for job ${batchId}, stopping polling`);
            stopPolling(batchId);
            toaster.create({
              title: 'Polling failed',
              description: `Failed to get updates for batch job after ${MAX_POLL_ERRORS} attempts`,
              type: 'error',
            });
          }
        }
      };
      pollJob();
      const intervalId = setInterval(pollJob, POLL_INTERVAL);
      pollingIntervalsRef.current.set(batchId, intervalId);
    },
    [fetchJobStatus, stopPolling, notifyRefresh],
  );
  useEffect(() => {
    if (userId) {
      fetchAllJobs();
    }
  }, [userId]);
  const createBatchJob = async (title: string, fileLocation: string, processingType: ProcessType, userId: string, selectedPrompts: SelectedPrompt[] = [], selectedCategories: string[] = []) => {
    if (!userId) {
      toaster.create({
        title: 'Authentication required',
        description: 'Please log in to create a batch job',
        type: 'error',
      });
      return;
    }
    setIsProcessing(true);
    try {
      const requestParams = {
        userId,
        title,
        folder_path: fileLocation,
        process_type: processingType,
        selected_prompts: selectedPrompts,
        selected_categories: selectedCategories,
      };
      const response = await createBatchAutomationJob(requestParams).unwrap();
      const batchId = response.id;
      if (batchId) {
        toaster.create({
          title: 'Batch job created',
          description: 'Your batch automation job has been started',
          type: 'success',
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await fetchAllJobs();
        notifyRefresh();
      } else {
        console.log('❌ Batch creation response missing batchId or success flag:', response);
        toaster.create({
          title: 'Batch job status unclear',
          description: 'The batch job may have been created. Please refresh to check.',
          type: 'warning',
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await fetchAllJobs();
        notifyRefresh();
      }
    } catch (error: any) {
      console.log('❌ Error creating batch job:', error);
      toaster.create({
        title: 'Failed to create batch job',
        description: error?.data?.message || 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const deleteBatchJob = async (batchId: string) => {
    try {
      setLoadingBatchId(batchId);
      await deleteBatch({ batchId, userId: userId || '' }).unwrap();
      stopPolling(batchId);
      await fetchAllJobs();
      toaster.create({
        title: 'Batch job deleted',
        type: 'success',
      });
      notifyRefresh();
    } catch (error: any) {
      toaster.create({
        title: 'Failed to delete batch job',
        description: error?.data?.message || 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setLoadingBatchId(null);
    }
  };
  const cloneBatchJob = async (title: string, batch_id: string, process_type: string, selected_prompts: SelectedPrompt[], selected_categories: string[]) => {
    if (!userId) {
      toaster.create({
        title: 'Authentication required',
        description: 'Please log in to clone a batch',
        type: 'error',
      });
      return;
    }
    try {
      setLoadingBatchId(batch_id);
      const result = await cloneBatch({
        title,
        batch_id,
        userId,
        process_type,
        selected_prompts,
        selected_categories,
      }).unwrap();
      await fetchAllJobs();
      toaster.create({
        title: 'Batch cloned successfully',
        description: `Created new batch with ${result.total_files || 0} files`,
        type: 'success',
      });
      notifyRefresh();
      return result;
    } catch (error: any) {
      console.log('❌ Error cloning batch:', error);
      toaster.create({
        title: 'Failed to clone batch',
        description: error?.data?.detail || error?.data?.message || 'An unexpected error occurred',
        type: 'error',
      });
      throw error;
    } finally {
      setLoadingBatchId(null);
    }
  };
  const updateBatchStatus = useCallback(
    async (batchId: string, status: string, currentUserId: string) => {
      if (!userId) {
        toaster.create({
          title: 'Authentication required',
          description: 'Please log in to update batch status',
          type: 'error',
        });
        return;
      }
      try {
        setLoadingBatchId(batchId);
        const result = await updateBatchAutomationStatus({ batchId, status, userId: currentUserId }).unwrap();
        if (status === 'cancel' || status === 'pause') {
          stopPolling(batchId);
        } else if (status === 'queue') {
          startPolling(batchId, status);
        }
        await fetchAllJobs();
        toaster.create({
          title: 'Status updated successfully',
          description: `Batch status changed to ${status}`,
          type: 'success',
        });
        notifyRefresh();
        return result;
      } catch (error: any) {
        console.log('❌ Error updating batch status:', error);
        toaster.create({
          title: 'Failed to update batch status',
          description: error?.data?.detail || error?.data?.message || 'An unexpected error occurred',
          type: 'error',
        });
        throw error;
      } finally {
        setLoadingBatchId(null);
      }
    },
    [userId, updateBatchAutomationStatus, stopPolling, startPolling, fetchAllJobs, notifyRefresh],
  );
  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pollingIntervalsRef.current.clear();
    };
  }, []);
  return (
    <BatchAutomationContext.Provider
      value={{
        activeJobs,
        completedJobs,
        inActiveJobs,
        isProcessing,
        createBatchJob,
        deleteBatchJob,
        cloneBatchJob,
        updateBatchStatus,
        registerRefreshCallback,
        loadingBatchId,
      }}
    >
      {children}
    </BatchAutomationContext.Provider>
  );
};
export const useBatchAutomation = (): BatchAutomationContextType => {
  const context = useContext(BatchAutomationContext);
  if (!context) {
    throw new Error('useBatchAutomation must be used within a BatchAutomationProvider');
  }
  return context;
};
