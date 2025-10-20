'use client';
import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setIsUploading, updateFileProgress, setError, setDuplicateFiles } from '@/redux/slices/fileUploadSlice';
import { debounce } from 'lodash';
import { toaster } from '@/components/ui/toaster';
import { type CreateToasterReturn } from '@chakra-ui/react';
import { SelectedCategories } from '@/redux/types';
interface UploadResult {
  success: boolean | null;
  fileId: string;
  fileName: string;
  serverFileId?: string;
  error?: string;
}
interface FileToCategorize {
  fileId: string;
  fileName: string;
  serverFileId?: string;
}
const CHUNK_SIZE = 20;
const PROGRESS_INTERVAL = 250;
const MAX_PROGRESS = 90;
const BATCH_SIZE = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const useFileUploadHandler = (
  uploadFile: (args: {
    file: File;
    userId: string;
    categorization_mode: 'manual' | 'auto' | 'skip';
    categorization_id?: string;
    selected_categories?: SelectedCategories[];
  }) => Promise<any>,
  userId: string | undefined,
  toast: CreateToasterReturn,
  setTotalCount: React.Dispatch<React.SetStateAction<number>>,
  onFilesReadyForCategorization?: (files: FileToCategorize[]) => void
) => {
  const dispatch = useDispatch();
  const uploadsRef = useRef<Array<{
    file: File;
    fileId: string;
    progress: number;
    lastUpdate: number;
  }>>([]);
  const updateProgressBatch = useCallback(
    debounce((updates: { file_id: string; progress: number }[]) => {
      dispatch(updateFileProgress(updates));
    }, 100),
    [dispatch]
  );
  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toaster.create({
          title: 'File too large',
          description: `${file.name} exceeds 50MB limit`,
          type: 'error',
        });
        return false;
      }
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (fileExtension !== 'pdf') {
        toaster.create({
          title: 'Invalid file format',
          description: `${file.name} is not a PDF file. Only PDF files are allowed.`,
          type: 'error',
        });
        return false;
      }
      return true;
    });
  };
  const uploadChunk = async (
    files: File[],
    categorization?: {
      selectedCategories: string[];
      categorizeMode: 'manual' | 'auto' | 'skip';
      autoCategories?: SelectedCategories[];
    }
  ): Promise<UploadResult[]> => {
    uploadsRef.current = files.map(file => ({
      file,
      fileId: `temp-${file.name}-${Date.now()}`,
      progress: 0,
      lastUpdate: Date.now()
    }));
    let animationFrameId: number | null = null;
    const updateProgress = () => {
      const now = Date.now();
      const updates: { file_id: string; progress: number }[] = [];
      uploadsRef.current
        .filter(upload => upload.progress < MAX_PROGRESS && now - upload.lastUpdate >= PROGRESS_INTERVAL)
        .slice(0, BATCH_SIZE)
        .forEach(upload => {
          const newProgress = Math.min(upload.progress + 10, MAX_PROGRESS);
          upload.progress = newProgress;
          upload.lastUpdate = now;
          updates.push({ file_id: upload.fileId, progress: newProgress });
        });
      if (updates.length > 0) {
        updateProgressBatch(updates);
      }
      if (uploadsRef.current.some(upload => upload.progress < MAX_PROGRESS)) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };
    try {
      animationFrameId = requestAnimationFrame(updateProgress);
      const results = await Promise.all(
        uploadsRef.current.map(async ({ file, fileId }) => {
          try {
            const uploadParams: any = {
              file,
              userId: userId || ''
            };
            if (categorization) {
              uploadParams.categorization_mode = categorization.categorizeMode;
              if (categorization.categorizeMode === 'manual' && categorization.selectedCategories.length > 0) {
                uploadParams.categorization_id = categorization.selectedCategories[0];
              }
              else if (categorization.categorizeMode === 'auto' && categorization.autoCategories && categorization.autoCategories.length > 0) {
                uploadParams.selected_categories = categorization.autoCategories;
              }
            }
            const response = await uploadFile(uploadParams);
            if (response?.data === null) {
              return { success: null, fileId, fileName: file.name };
            }
            dispatch(updateFileProgress({ file_id: fileId, progress: 100 }));
            return {
              success: true,
              fileId,
              fileName: file.name,
              serverFileId: response?.data?.file_id
            };
          } catch (error: any) {
            const errorMessage = error.data?.message || 'Upload failed';
            dispatch(setError('Upload Failed'));
            return { success: false, fileId, fileName: file.name, error: errorMessage };
          }
        })
      );
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      return results;
    } catch (error) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      throw error;
    }
  };
  const handleFileUpload = useCallback(
    async (
      selectedFiles: File[],
      categorization?: {
        selectedCategories: string[];
        categorizeMode: 'manual' | 'auto' | 'skip';
        autoCategories?: SelectedCategories[];
      }
    ) => {
      if (!userId || selectedFiles.length === 0) return;
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length === 0) return;
      dispatch(setIsUploading(true));
      const files = [...validFiles];
      const results = { successful: 0, failed: 0, duplicate: 0 };
      const successfulFiles: FileToCategorize[] = [];
      try {
        while (files.length > 0) {
          const chunk = files.splice(0, CHUNK_SIZE);
          const chunkResults = await uploadChunk(chunk, categorization);
          results.duplicate += chunkResults.filter(r => r.success === null).length;
          results.successful += chunkResults.filter(r => r.success && r.success !== null).length;
          results.failed += chunkResults.filter(r => !r.success && r.success !== null).length;
          dispatch(setDuplicateFiles(results.duplicate));
          chunkResults
            .filter(r => r.success && r.success !== null)
            .forEach(r => {
              successfulFiles.push({
                fileId: r.fileId,
                fileName: r.fileName,
                serverFileId: r.serverFileId
              });
            });
          if (files.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        if (successfulFiles.length > 0 && onFilesReadyForCategorization && !categorization) {
          onFilesReadyForCategorization(successfulFiles);
        }
      } catch (err: any) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setIsUploading(false));
      }
    },
    [userId, dispatch, uploadFile, toast, onFilesReadyForCategorization]
  );
  return handleFileUpload;
};