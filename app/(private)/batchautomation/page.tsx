'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Box, Text, Badge, HStack, VStack, Heading, Icon, Spinner, Separator } from '@chakra-ui/react';
import { AlgorithmIcon, CheckmarkCircle01Icon, Delete02Icon, ReloadIcon, AlertCircleIcon, Copy01Icon, FileAttachmentIcon, Cancel01Icon, PauseIcon, PlayIcon, StopIcon, Download01Icon } from 'hugeicons-react';
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useColorModeValue } from '@/components/ui/color-mode';
import { useAuth } from '@/hooks/useAuth';
import BatchAutomationModal from '@/components/BatchAutomationModal';
import { useBatchAutomation } from '@/context/BatchAutomationContext';
import { useExportBatchResultsMutation } from '@/redux/slices/batchAutomationSlice';
import { toaster } from '@/components/ui/toaster';
import { getStatusColor, getStatusLabel } from '@/utils/statusHelper';
import { BatchAutomationJob } from '@/types/batch-automation-types';
interface GroupedBatches {
  [key: string]: any[];
}
const BatchAutomationListView: React.FC = () => {
  const { userId } = useAuth();
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const [isBatchAutomationOpen, setIsBatchAutomationOpen] = useState(false);
  const [cloneBatchData, setCloneBatchData] = useState<BatchAutomationJob | null>(null);
  const { activeJobs, completedJobs, inActiveJobs, isProcessing, deleteBatchJob, updateBatchStatus, registerRefreshCallback, loadingBatchId } = useBatchAutomation();
  const [exportBatchResults, { isLoading, error }] = useExportBatchResultsMutation();
  const [actionType, setActionType] = useState<'cancel' | 'pause' | 'queue' | 'delete' | 'clone' | null>(null);
  useEffect(() => {
    registerRefreshCallback(() => {
    });
  }, [registerRefreshCallback]);
  const handleBatchAutomationClick = (): void => {
    setIsBatchAutomationOpen(true);
  };
  const handleCancelBatch = async (batchId: string, currentUserId: string) => {
    try {
      setActionType('cancel');
      await updateBatchStatus(batchId, 'cancel', currentUserId);
    } catch (error) {
      console.log('Error cancelling batch:', error);
    } finally {
      setActionType(null);
    }
  };
  const handlePauseBatch = async (batchId: string, currentUserId: string) => {
    try {
      setActionType('pause');
      await updateBatchStatus(batchId, 'pause', currentUserId);
    } catch (error) {
      console.log('Error pausing batch:', error);
    } finally {
      setActionType(null);
    }
  };
  const handleResumeBatch = async (batchId: string, currentUserId: string) => {
    try {
      setActionType('queue');
      await updateBatchStatus(batchId, 'queue', currentUserId);
    } catch (error) {
      console.log('Error resuming batch:', error);
    } finally {
      setActionType(null);
    }
  };
  const handleDeleteBatch = async (batchId: string) => {
    try {
      setActionType('delete');
      await deleteBatchJob(batchId);
    } catch (error) {
      console.log('Error deleting batch:', error);
    } finally {
      setActionType(null);
    }
  };
  const handleCloneBatch = (job: BatchAutomationJob) => {
    setCloneBatchData(job);
    setIsBatchAutomationOpen(true);
  };
  const handleDownload = async (batchId: string) => {
    if (!userId) {
      toaster.create({
        title: 'Authentication required',
        description: 'Please log in to download results',
        type: 'error',
      });
      return;
    }
    try {
      // const blob = await exportBatchResults({ batchId, userId }).unwrap();
      const { blob, filename } = await exportBatchResults({ batchId, userId }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toaster.create({
        title: 'File exported successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.log('Export failed:', error);
      toaster.create({
        title: 'Export failed',
        description: error?.message || 'Failed to export results',
        type: 'error',
      });
    }
  };
  const renderBatchActions = (job: any) => {
    const isLoading = loadingBatchId === job.batchId;
    const isPaused = job.status === 'pause';
    const isQueue = job.status === 'queue';
    const isProcessing = job.status === 'processing';
    const isCompleted = job.status === 'completed';
    const isFailed = job.status === 'failed';
    const isCancel = job.status === 'cancel';
    const isErrorS = job.status === 'error';
    // Show actions based on current status
    const canPause = isQueue;
    const canResume = isPaused;
    const canCancel = isQueue || isPaused;
    const canClone = isCompleted || isFailed || isCancel || isErrorS;
    const canDelete = isCompleted || isFailed || isCancel || isErrorS || isQueue || isPaused;
    const canDownload = isCompleted;
    return (
      <HStack gap={0} h={'100%'}>
        {/* Cancel button */}
        {canCancel && (
          <Tooltip content={isLoading && actionType === 'cancel' ? 'Cancelling...' : 'Cancel Batch'}>
            <Button disabled={isLoading} aria-label="Cancel Batch" justifyContent="center" onClick={() => handleCancelBatch(job.batchId, job.userId)} px={2} minW="initial" w={10} h="100%" borderRadius={0} visual={'red'}>
              {isLoading && actionType === 'cancel' ? <Spinner size="sm" /> : <Cancel01Icon style={{ width: 18, height: 18 }} />}
            </Button>
          </Tooltip>
        )}
        {/* Pause button - only shown when status is 'queue' */}
        {canPause && (
          <Tooltip content={isLoading && actionType === 'pause' ? 'Pausing...' : 'Pause Batch'}>
            <Button disabled={isLoading} aria-label="Pause Batch" justifyContent="center" onClick={() => handlePauseBatch(job.batchId, job.userId)} px={2} minW="initial" w={10} h="100%" borderRadius={0} colorPalette="orange">
              {isLoading && actionType === 'pause' ? <Spinner size="sm" /> : <PauseIcon style={{ width: 18, height: 18 }} />}
            </Button>
          </Tooltip>
        )}
        {/* Resume button - only shown when status is 'pause' */}
        {canResume && (
          <Tooltip content={isLoading && actionType === 'queue' ? 'Resuming...' : 'Resume Batch'}>
            <Button disabled={isLoading} aria-label="Resume Batch" justifyContent="center" onClick={() => handleResumeBatch(job.batchId, job.userId)} px={2} minW="initial" w={10} h="100%" borderRadius={0} colorPalette="green">
              {isLoading && actionType === 'queue' ? <Spinner size="sm" /> : <PlayIcon style={{ width: 18, height: 18 }} />}
            </Button>
          </Tooltip>
        )}
        {/* Clone button - shown for completed/failed/cancelled batches */}
        {canClone && (
          <Tooltip content={isLoading && actionType === 'clone' ? 'Cloning...' : 'Clone Batch'}>
            <Button disabled={isLoading} aria-label="Clone Batch" justifyContent="center" onClick={() => handleCloneBatch(job)} px={2} minW="initial" w={10} h="100%" borderRadius={0}>
              {isLoading && actionType === 'clone' ? <Spinner size="sm" /> : <Copy01Icon style={{ width: 18, height: 18 }} />}
            </Button>
          </Tooltip>
        )}
        {/* Delete button - shown for all batches */}
        {canDelete && (
          <Tooltip content={isLoading && actionType === 'delete' ? 'Deleting...' : 'Delete Batch'}>
            <Button disabled={isLoading} aria-label="Delete Batch" justifyContent="center" onClick={() => handleDeleteBatch(job.batchId)} px={2} minW="initial" w={10} h="100%" visual="red" borderRadius={0}>
              {isLoading && actionType === 'delete' ? <Spinner size="sm" /> : <Delete02Icon style={{ width: 18, height: 18 }} />}
            </Button>
          </Tooltip>
        )}
        {/* Download button - only shown for completed batches */}
        {canDownload && (
          <Tooltip content={isLoading ? 'Exporting...' : 'Export Result'}>
            <Button disabled={isLoading} aria-label="Export Result" justifyContent="center" onClick={() => handleDownload(job.batchId)} px={2} minW="initial" w={10} h="100%" borderRadius={0}>
              {isLoading ? <Spinner size="sm" /> : <Download01Icon style={{ width: 18, height: 18 }} />}
            </Button>
          </Tooltip>
        )}
      </HStack>
    );
  };
  const renderBatchItem = (job: any) => {
    const batchTime = new Date(job.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const fileCount = job.totalFiles || 0;
    return (
      <AccordionItem value={job.batchId} key={job.batchId} borderRadius={8} overflow="hidden" border="1px solid" borderColor={borderColor} mb={3}>
        <HStack gap={0} h="48px">
          <AccordionItemTrigger py={3} px={3} h="100%" bg={'rgb(200,209,229,0.3)'}>
            <Box flex="1">
              <HStack gap={4}>
                <Icon className={job.status === 'processing' || job.status === 'queue' ? 'spinning' : ''} color={getStatusColor(job.status)}>
                  {job.status === 'completed' ? <CheckmarkCircle01Icon /> : job.status === 'failed' ? <AlertCircleIcon /> : job.status === 'pause' ? <PauseIcon /> : <ReloadIcon />}
                </Icon>
                <Text fontWeight="600" textAlign="left" display="flex" alignItems="center">
                  {job.batchTitle} - {batchTime}
                </Text>
                <HStack ml="auto" gap={0.25}>
                  <FileAttachmentIcon color="royalblue" fontSize="22px" />
                  <Text fontWeight="600" textAlign="left" ml={1} mr={2}>
                    {fileCount}
                  </Text>
                </HStack>
              </HStack>
            </Box>
          </AccordionItemTrigger>
          {renderBatchActions(job)}
        </HStack>
        <AccordionItemContent p={3} bg={'rgba(255,255,255,0.25)'}>
          <VStack align="start" gap={2}>
            <HStack gap={2} flexWrap="wrap">
              <Badge colorPalette={getStatusColor(job.status)} size="sm">
                {getStatusLabel(job.status)}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {job.processType.replace(/_/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase())}
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600" >
              <strong>File Location:</strong> <Text as={'span'} fontSize={'13px'} fontStyle={'italic'}>/{job.fileSharePath}</Text>
            </Text>
            {job.totalFiles > 0 && (
              <Box w="100%">
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Progress: {job.successfulFiles + job.failedFiles} / {job.totalFiles} files
                  <Text as={'span'} ml={2} color={'blue.600'}>{`(${job.successfulFiles} successful${job.failedFiles > 0 ? `, ${job.failedFiles} failed` : ''})`}</Text>
                </Text>
                <Box w="100%" h={2} bg="gray.200" borderRadius="full">
                  <Box w={`${job.progress || 0}%`} h="100%" bg={job.failedFiles > 0 && job.failedFiles === job.processedFiles ? 'red.500' : getStatusColor(job.status)} borderRadius="full" transition="width 0.3s" />
                </Box>
              </Box>
            )}
            {job.errorMessage && (
              <Text fontSize="sm" color="red.500">
                <strong>Error:</strong> {job.errorMessage}
              </Text>
            )}
          </VStack>
        </AccordionItemContent>
      </AccordionItem>
    );
  };
  const groupedCompletedBatches = useMemo<GroupedBatches>(() => {
    return completedJobs.reduce<GroupedBatches>((acc, batch) => {
      const date = new Date(batch.createdAt);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const dateStr = isToday
        ? 'Today'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(batch);
      return acc;
    }, {});
  }, [completedJobs]);
  const groupedInActiveBatches = useMemo<GroupedBatches>(() => {
    return inActiveJobs.reduce<GroupedBatches>((acc, batch) => {
      const date = new Date(batch.createdAt);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const dateStr = isToday
        ? 'Today'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(batch);
      return acc;
    }, {});
  }, [inActiveJobs]);
  const renderCompletedBatches = () => {
    return Object.entries(groupedCompletedBatches)
      .sort(([dateA], [dateB]) => {
        if (dateA === 'Today') return -1;
        if (dateB === 'Today') return 1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .map(([date, batches]) => (
        <Box key={date} w="full" mb={6}>
          <Heading as="h3" size="sm" mb={4} color="gray.400" fontWeight="normal" fontSize="sm">
            {date} ({batches.length} {batches.length === 1 ? 'batch' : 'batches'})
          </Heading>
          <AccordionRoot collapsible w="100%">
            {batches.map((batch) => renderBatchItem(batch))}
          </AccordionRoot>
        </Box>
      ));
  };
  const renderInActiveBatches = () => {
    return Object.entries(groupedInActiveBatches)
      .sort(([dateA], [dateB]) => {
        if (dateA === 'Today') return -1;
        if (dateB === 'Today') return 1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .map(([date, batches]) => (
        <Box key={date} w="full" mb={6}>
          <Heading as="h3" size="sm" mb={4} color="gray.400" fontWeight="normal" fontSize="sm">
            {date} ({batches.length} {batches.length === 1 ? 'batch' : 'batches'})
          </Heading>
          <AccordionRoot collapsible w="100%">
            {batches.map((batch) => renderBatchItem(batch))}
          </AccordionRoot>
        </Box>
      ));
  };
  return (
    <Box pb={3} h="100%" w="100%">
      <Box display="flex" flexDir="column" borderRadius="8px" height="100%" overflow="hidden">
        <HStack py={{ base: 2, lg: 3 }} minH={{ base: '66px', sm: '66px' }} px={4} flexDirection={{ base: 'column', sm: 'row' }}>
          <Heading as="h1" fontSize="18px" fontWeight="bold" mb={{ base: '0.5rem', sm: 0 }}>
            Batch Automation
          </Heading>
          <HStack ml="auto">
            <Button className="submitP" py={1} px={2} fontSize={{ base: 'xs', md: 'sm' }} onClick={handleBatchAutomationClick} color="gray.600" bg="transparent" _hover={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} _focus={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} h="auto">
              <AlgorithmIcon size={18} />
              <Text fontSize="12px">Batch Automation</Text>
            </Button>
          </HStack>
        </HStack>
        <Separator my={0} borderColor={'#fdfdfd'} />
        <VStack gap={4} w="full" py={4} overflowY="auto" h="calc(100% - 66px)" px={4} borderTop="1px solid" borderTopColor="#e1e5ec">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <AccordionRoot w="100%" defaultValue={activeJobs.length > 0 ? [activeJobs[0].batchId] : []}>
              {activeJobs.map((job) => renderBatchItem(job))}
            </AccordionRoot>
          )}
          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <Box w="100%" mt={activeJobs.length > 0 ? 6 : 0}>
              <Heading as="h2" size="md" mb={4}>
                Successful Batches
              </Heading>
              {renderCompletedBatches()}
            </Box>
          )}
          {inActiveJobs.length > 0 && (
            <Box w="100%" mt={inActiveJobs.length > 0 ? 2 : 0}>
              <Heading as="h2" size="md" mb={4}>
                InActive Batches
              </Heading>
              {renderInActiveBatches()}
            </Box>
          )}
          {/* Empty State */}
          {!isProcessing && activeJobs.length === 0 && completedJobs.length === 0 && (
            <Box w="100%" textAlign="center" py={12}>
              <Icon fontSize="4xl" color="gray.400" mb={4}>
                <AlgorithmIcon />
              </Icon>
              <Heading size="md" color="gray.600" mb={2}>
                No Automation Jobs Yet
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Create your first batch automation job to get started
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
      <BatchAutomationModal
        isOpen={isBatchAutomationOpen}
        onClose={() => {
          setIsBatchAutomationOpen(false);
          setCloneBatchData(null);
        }}
        cloneBatchData={cloneBatchData}
        setCloneBatchData={setCloneBatchData}
      />
      <style jsx global>{`
        .spinning {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
};
export default BatchAutomationListView;
