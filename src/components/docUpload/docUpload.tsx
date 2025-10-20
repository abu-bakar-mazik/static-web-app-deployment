'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Text, VStack, HStack, Icon, List, Progress } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { useUploadFileMutation, useCheckQueueStatusQuery, setIsUploading, addFile, syncQueueStatus, clearCompleted, setDuplicateFiles, setTotalFileCount } from '@/redux/slices/fileUploadSlice';
import { RootState } from '@/redux/store';
import { useFileUploadHandler } from '@/hooks/FileUpload';
import { FileUploadIcon } from 'hugeicons-react';
import { toaster } from '../ui/toaster';
import { BadgeRoot } from '../ui/badge';
import UnifiedCategorization from './UnifiedFileCategorization';
import { SelectedCategories } from '@/redux/types';
interface SelectedFile {
  file: File;
  id: string;
}
const FileUploadView = () => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const { files, isUploading, duplicateFiles, totalFileCount } = useSelector((state: RootState) => state.doc);
  const [uploadFile] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [showCategorizationModal, setShowCategorizationModal] = useState(false);
  const inProgressCount = useMemo(() => files.filter((file) => file.status === 'processing').length, [files]);
  const completedCount = useMemo(() => files.filter((file) => file.status === 'Success').length, [files]);
  const hasProcessingFiles = useMemo(() => {
    return files.some((file) => file.status === 'pending' || file.status === 'processing' || file.status === 'uploading');
  }, [files]);
  const { data: queueData } = useCheckQueueStatusQuery(userId || '', {
    skip: !userId || !hasProcessingFiles,
    pollingInterval: 3000,
  });
  useEffect(() => {
    if (queueData?.current_queue) {
      dispatch(syncQueueStatus(queueData.current_queue));
    }
  }, [queueData, dispatch]);
  useEffect(() => {
    const allFilesComplete = files.length > 0 && files.every((file) => file.status === 'Success' || file.status === 'error' || file.status === 'Duplicate');
    const queueComplete = !hasProcessingFiles;
    if (allFilesComplete && queueComplete && files.length > 0) {
      const successCount = files.filter((f) => f.status === 'Success').length;
      const duplicateCount = files.filter((f) => f.status === 'Duplicate').length;
      const errorCount = files.filter((f) => f.status === 'error').length;
      const timeoutId = setTimeout(() => {
        if (successCount > 0) {
          toaster.create({
            title: 'Processing Complete',
            description: `${successCount} file${successCount !== 1 ? 's' : ''} processed successfully${duplicateCount > 0 ? `, ${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''}` : ''}${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
            type: successCount > 0 ? 'success' : 'warning',
          });
          window.dispatchEvent(new CustomEvent('documents-updated'));
        }
        dispatch(setDuplicateFiles(0));
        dispatch(setTotalFileCount(0));
        dispatch(clearCompleted());
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [files, dispatch, hasProcessingFiles]);
  const handleFileUpload = useFileUploadHandler(uploadFile, userId || '', toaster, (count) => dispatch(setTotalFileCount(typeof count === 'function' ? count(totalFileCount) : count)));
  const handleFileUploadWithCategorization = useCallback(
    async (
      selectedFiles: File[],
      categorization: {
        selectedCategories: string[];
        categorizeMode: 'manual' | 'auto' | 'skip';
        autoCategories?: SelectedCategories[];
      },
    ) => {
      await handleFileUpload(selectedFiles, categorization);
      setSelectedFiles([]);
    },
    [handleFileUpload],
  );
  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList || !userId) return;
      const selectedFiles = Array.from(fileList);
      const invalidFiles = selectedFiles.filter((file) => !file.name.toLowerCase().endsWith('.pdf'));
      if (invalidFiles.length > 0) {
        toaster.create({
          title: 'Invalid File Type',
          description: 'Only PDF files are allowed',
          type: 'error',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      const filesWithIds = selectedFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }));
      setSelectedFiles(filesWithIds);
      dispatch(setTotalFileCount(selectedFiles.length));
      setShowCategorizationModal(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [userId, dispatch],
  );
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (!files || files.length === 0 || !userId) return;
      const fileArray = Array.from(files);
      const invalidFiles = fileArray.filter((file) => !file.name.toLowerCase().endsWith('.pdf'));
      if (invalidFiles.length > 0) {
        toaster.create({
          title: 'Invalid File Type',
          description: 'Only PDF files are allowed',
          type: 'error',
        });
        return;
      }
      const filesWithIds = fileArray.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }));
      setSelectedFiles(filesWithIds);
      dispatch(setTotalFileCount(fileArray.length));
      setShowCategorizationModal(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [userId, dispatch],
  );
  const handleCategorizeFiles = useCallback(
    async (categorization: { selectedCategories: string[]; categorizeMode: 'manual' | 'auto' | 'skip'; autoCategories?: SelectedCategories[] }) => {
      await handleFileUploadWithCategorization(
        selectedFiles.map((sf) => sf.file),
        categorization,
      );
      setSelectedFiles([]);
    },
    [selectedFiles, handleFileUploadWithCategorization],
  );
  const handleCloseCategorizationModal = () => {
    setShowCategorizationModal(false);
    setSelectedFiles([]);
    dispatch(setTotalFileCount(0));
  };
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'uploading':
        return 'Uploading';
      case 'pending':
        return 'Pending';
      case 'Duplicate':
        return 'Duplicate';
      case 'processing':
        return 'Processing';
      case 'Success':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'uploading':
      case 'pending':
        return 'blue';
      case 'Duplicate':
        return 'orange';
      case 'processing':
        return 'yellow';
      case 'Success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };
  return (
    <>
      <Box py={4} h="100%" overflowY="auto" w={{ base: '100%', lg: 'calc(100% - 15px)' }}>
        <Box
          as="label"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          h="32"
          border="1px solid"
          borderColor="#d6ebf7"
          borderRadius="lg"
          cursor="pointer"
          transition="all 0.2s"
          mb={{ base: 2, lg: 4 }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          backdropFilter="blur(10px)"
          background="rgba(200,209,229,0.1)"
          _hover={{
            borderColor: 'blue.200',
            background: 'rgba(200,209,229,0.2)',
            '& svg': { color: 'blue.400' },
            '& p': { color: 'blue.400' },
          }}
        >
          <VStack justify="center" align="center" h="100%">
            <Icon w={6} h={6} color="gray.500">
              <FileUploadIcon />
            </Icon>
            <Text fontSize="xs" color="gray.500">
              Upload Doc/PDF Files or Drag and Drop
            </Text>
            <Text fontSize="2xs" color="gray.400">
              Multiple files supported
            </Text>
          </VStack>
          <input type="file" ref={fileInputRef} multiple onChange={handleUpload} disabled={isUploading} accept=".doc, .docx, .pdf" style={{ display: 'none' }} />
        </Box>
        {files.length > 0 && (
          <HStack justify="flex-start" mb={4} flexWrap="wrap" gap={2}>
            {totalFileCount > 0 && <BadgeRoot colorPalette="blue">Total: {totalFileCount}</BadgeRoot>}
            {inProgressCount > 0 && <BadgeRoot colorPalette="yellow">Processing: {inProgressCount}</BadgeRoot>}
            {completedCount > 0 && <BadgeRoot colorPalette="green">Completed: {completedCount}</BadgeRoot>}
            {duplicateFiles > 0 && (
              <BadgeRoot colorPalette="orange">
                Duplicate{duplicateFiles !== 1 ? 's' : ''}: {duplicateFiles}
              </BadgeRoot>
            )}
          </HStack>
        )}
        {files.length > 0 && (
          <List.Root gap={3}>
            {files.map((file) => {
              const queueItem = queueData?.current_queue?.find((item) => item?.metadata?.file_id === file.server_file_id);
              const currentStatus = queueItem?.status ?? file.status;
              return (
                <List.Item
                  key={file.file_id}
                  py={2}
                  px={3}
                  bg="#eef1f7"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="#f3f8ff"
                  style={{
                    transition: 'opacity 0.5s ease-out',
                    opacity: currentStatus === 'Success' ? 0.7 : 1,
                  }}
                >
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <Text fontSize="xs" fontWeight="medium" truncate maxW="70%">
                        {file.name}
                      </Text>
                      <BadgeRoot colorPalette={getStatusColor(currentStatus)} fontSize="10px" px={2}>
                        {getStatusIcon(currentStatus)}
                      </BadgeRoot>
                    </HStack>
                    {(currentStatus === 'uploading' || currentStatus === 'pending') && (
                      <HStack gap={2}>
                        <Progress.Root w="100%" size="xs" value={file.progress || 0} colorPalette="blue" borderRadius="full" h={1}>
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                        <Text fontSize="xs" minW="35px" textAlign="right">
                          {Math.round(file.progress || 0)}%
                        </Text>
                      </HStack>
                    )}
                    {file.error && (
                      <Text fontSize="xs" color="red.500">
                        {file.error}
                      </Text>
                    )}
                  </VStack>
                </List.Item>
              );
            })}
          </List.Root>
        )}
        {files.length === 0 && (
          <VStack py={8} color="gray.400">
            <Text fontSize="sm">No files uploading</Text>
            <Text fontSize="xs">Upload files to see progress here</Text>
          </VStack>
        )}
      </Box>
      <UnifiedCategorization
        isOpen={showCategorizationModal}
        onClose={handleCloseCategorizationModal}
        files={selectedFiles.map((sf) => ({
          fileId: sf.id,
          fileName: sf.file.name,
        }))}
        mode="upload"
        onCategorize={handleCategorizeFiles}
      />
    </>
  );
};
export default FileUploadView;
