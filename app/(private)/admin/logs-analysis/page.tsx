'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, ListCollection, Separator } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useColorModeValue } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { createListCollection } from '@chakra-ui/react';
import { useFetchUsageLogsMutation, useExportLogsCSVMutation, useFetchUsersQuery, useDeleteLogsMutation, setLogs, setAllSelectedUsers, setStartDate, setEndDate, setIsLoading, setTableHeaders, setCurrentPage, setTotalRecords, setSelectedModelName, setSelectedRequestType, resetPagination, setAvailableRecords, useFetchAllUsersQuery, setAllUsers, setTokenSummary } from '@/redux/slices/adminSlice';
import { ApiUser, LogEntry, SearchUsersResponse } from '@/redux/types';
import { LogsHeader } from '@/components/llmLogs/LogsHeader';
import { FiltersSection } from '@/components/llmLogs/FiltersSection';
import { SummaryStats } from '@/components/llmLogs/SummaryStats';
import { PaginationControls } from '@/components/llmLogs/PaginationControls';
import { LogsTable } from '@/components/llmLogs/LogsTable';
import { REQUEST_TYPES, REQUEST_TYPE_CONFIG, MODEL_TYPES, getAllModels, getModelOptions, generateTableHeaders, formatDateForAPI } from '@/utils/logUtils';
interface ApiUserOptions extends ApiUser {
  label: string;
  value: string;
}
const AnalyzeLogsPage: React.FC = () => {
  const { userId, isAuthLoading: SessionLoading } = useAuth();
  const dispatch = useDispatch();
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const { tokenSummary, logs, allUsers, allSelectedUsers, startDate, endDate, tableHeaders, isLoading, currentPage, totalRecords, limit, selectedModelName, selectedRequestType, availableRecords } = useSelector((state: any) => state.admin);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [allAvailableModels, setAllAvailableModels] = useState<string[]>([]);
  const hasInitialized = useRef<boolean>(false);
  const [fetchUsageLogs] = useFetchUsageLogsMutation();
  const [exportLogsCSV] = useExportLogsCSVMutation();
  const [deleteLogs] = useDeleteLogsMutation();
  const { data: usersData, isLoading: isLoadingUsers } = useFetchAllUsersQuery(userId!, {
    skip: !userId,
  }) as {
    data: SearchUsersResponse | undefined;
    isLoading: boolean;
  };
  const extractAvailableModels = (logs: LogEntry[]) => {
    const uniqueModels = [...new Set(logs.map((log: LogEntry) => log.model_name).filter(Boolean))];
    const predefinedModels = getAllModels();
    const newModels = uniqueModels.filter((model) => !predefinedModels.includes(model));
    return [...predefinedModels, ...newModels];
  };
  const userOptions = useMemo(() => {
    return createListCollection({
      items: allUsers.map((user: ApiUser) => ({
        user_id: user.userid,
        email: user.email,
        username: user.username,
        label: user.username || user.email || user.userid,
        value: user.userid,
      })),
    });
  }, [allUsers]);
  const modelOptions = useMemo(() => {
    return createListCollection({
      items: getModelOptions(),
    });
  }, []);
  const requestTypeOptions = useMemo(() => {
    return createListCollection({
      items: Object.values(REQUEST_TYPES).map((type) => ({
        label: REQUEST_TYPE_CONFIG[type]?.label || type,
        value: type,
      })),
    });
  }, []);
  useEffect(() => {
    if (userId && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchInitialData();
    }
  }, [userId]);
  useEffect(() => {
    if (usersData?.users) {
      dispatch(setAllUsers(usersData.users));
    }
  }, [usersData, dispatch]);
  useEffect(() => {
    setSelectedLogIds(new Set());
    setIsAllSelected(false);
  }, [logs]);
  const sortLogsByNewest = (logs: LogEntry[]) => {
    return [...logs].sort((a, b) => {
      const getLogDate = (log: LogEntry) => {
        return log.request_time;
      };
      const dateA = new Date(getLogDate(a) || 0);
      const dateB = new Date(getLogDate(b) || 0);
      return dateB.getTime() - dateA.getTime();
    });
  };
  const fetchInitialData = async () => {
    try {
      dispatch(setIsLoading(true));
      dispatch(resetPagination());
      const response = await fetchUsageLogs({
        offset: 0,
        limit: limit,
        order: 'newest'
      }).unwrap();
      const sortedLogs = sortLogsByNewest(response.records);
      dispatch(setLogs(sortedLogs));
      dispatch(setTotalRecords(response.total_returned));
      dispatch(setAvailableRecords(response.total_available));
      dispatch(setTokenSummary(response.tokens_summary));
      const models = extractAvailableModels(response.records);
      setAllAvailableModels(models);
      const headers = generateTableHeaders(response.records);
      dispatch(setTableHeaders(headers));
      toaster.create({
        title: 'Data loaded successfully',
        description: `Found ${response.total_available} log entries`,
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Failed to load data',
        description: 'Please try again',
        type: 'error',
      });
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const fetchUsageData = useCallback(
    async (pageOffset?: number) => {
      try {
        dispatch(setIsLoading(true));
        const currentOffset = pageOffset !== undefined ? pageOffset : 0;
        if (pageOffset === undefined) {
          dispatch(resetPagination());
        }
        const requestParams: any = {
          offset: currentOffset,
          limit: limit,
          order: 'newest'
        };
        if (allSelectedUsers.length > 0) {
          requestParams.user_ids = allSelectedUsers;
        }
        if (startDate) {
          requestParams.start_date = formatDateForAPI(startDate, false);
        }
        if (endDate) {
          requestParams.end_date = formatDateForAPI(endDate, true);
        }
        if (selectedModelName.length > 0) {
          requestParams.model_names = selectedModelName;
        }
        if (selectedRequestType.length > 0) {
          requestParams.request_types = selectedRequestType;
        }
        const response = await fetchUsageLogs(requestParams).unwrap();
        const sortedLogs = sortLogsByNewest(response.records);
        dispatch(setLogs(sortedLogs));
        dispatch(setTotalRecords(response.total_returned));
        dispatch(setAvailableRecords(response.total_available));
        dispatch(setTokenSummary(response.tokens_summary));
        if (pageOffset === undefined) {
          const models = extractAvailableModels(response.records);
          setAllAvailableModels(models);
        }
        if (tableHeaders.length === 0 || pageOffset === undefined) {
          const headers = generateTableHeaders(response.records);
          dispatch(setTableHeaders(headers));
        }
        const newPage = Math.floor(currentOffset / limit) + 1;
        dispatch(setCurrentPage(newPage));
        const filterCount = Object.keys(requestParams).filter((key) => key !== 'offset' && key !== 'limit' && requestParams[key]).length;
        toaster.create({
          title: 'Data loaded successfully',
          description: `Found ${response.total_available} log entries${filterCount > 0 ? ' with filters applied' : ''}`,
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'Failed to fetch usage data',
          description: 'Please try again',
          type: 'error',
        });
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [allSelectedUsers, startDate, endDate, selectedModelName, selectedRequestType, limit, fetchUsageLogs, dispatch, tableHeaders.length],
  );
  const handleUserSelect = (details: { value: string[] }) => {
    dispatch(setAllSelectedUsers(details.value));
  };
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setStartDate(e.target.value));
  };
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setEndDate(e.target.value));
  };
  const handleModelSelect = (details: { value: string[] }) => {
    dispatch(setSelectedModelName(details.value));
  };
  const handleRequestTypeSelect = (details: { value: string[] }) => {
    dispatch(setSelectedRequestType(details.value));
  };
  const clearFilters = () => {
    dispatch(setAllSelectedUsers([]));
    dispatch(setStartDate(''));
    dispatch(setEndDate(''));
    dispatch(setSelectedModelName([]));
    dispatch(setSelectedRequestType([]));
    fetchInitialData();
  };
  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    fetchUsageData(newOffset);
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<string>(
        logs
          .map((log: LogEntry) => {
            const id = log.id || log.request_id;
            return typeof id === 'string' ? id : String(id);
          })
          .filter((id: string): id is string => Boolean(id)),
      );
      setSelectedLogIds(allIds);
      setIsAllSelected(true);
    } else {
      setSelectedLogIds(new Set());
      setIsAllSelected(false);
    }
  };
  const handleSelectLog = (logId: string, checked: boolean) => {
    const newSelected = new Set(selectedLogIds);
    if (checked) {
      newSelected.add(logId);
    } else {
      newSelected.delete(logId);
    }
    setSelectedLogIds(newSelected);
    setIsAllSelected(newSelected.size === logs.length && logs.length > 0);
  };
  const handleDeleteSelected = async () => {
    if (selectedLogIds.size === 0) {
      toaster.create({
        title: 'No records selected',
        description: 'Please select records to delete',
        type: 'warning',
      });
      return;
    }
    try {
      setIsDeleting(true);
      const recordObjects = Array.from(selectedLogIds)
        .map((logId) => {
          const log = logs.find((l: LogEntry) => (l.id || l.request_id) === logId);
          return {
            record_id: logId,
            user_id: log?.user_id || '',
          };
        })
        .filter((obj) => obj.user_id);
      if (recordObjects.length === 0) {
        toaster.create({
          title: 'Cannot delete records',
          description: 'Selected records are missing required user information',
          type: 'error',
        });
        return;
      }
      const response = await deleteLogs({
        record_objects: recordObjects,
      }).unwrap();
      setSelectedLogIds(new Set());
      setIsAllSelected(false);
      await fetchUsageData();
      toaster.create({
        title: 'Delete operation completed',
        description: `${response.deleted} - ${response.failed}`,
        type: response.failed.includes('0') ? 'success' : 'warning',
      });
    } catch (error) {
      toaster.create({
        title: 'Delete failed',
        description: 'Please try again',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const exportToCSV = async () => {
    try {
      dispatch(setIsLoading(true));
      const requestParams: any = {
        offset: 0,
        limit: 10000,
      };
      if (allSelectedUsers.length > 0) {
        requestParams.user_ids = allSelectedUsers;
      }
      if (startDate) {
        requestParams.start_date = formatDateForAPI(startDate, false);
      }
      if (endDate) {
        requestParams.end_date = formatDateForAPI(endDate, true);
      }
      if (selectedModelName.length > 0) {
        requestParams.model_names = selectedModelName;
      }
      if (selectedRequestType.length > 0) {
        requestParams.request_types = selectedRequestType;
      }
      requestParams.order = 'newest';
      const { blob, filename } = await exportLogsCSV(requestParams).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      const filterCount = Object.keys(requestParams).filter((key) => key !== 'offset' && key !== 'limit' && requestParams[key]).length;
      toaster.create({
        title: 'CSV exported successfully',
        description: `Downloaded usage data${filterCount > 0 ? ' with filters applied' : ' (all records)'}`,
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Export failed',
        description: 'Please try again',
        type: 'error',
      });
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const totalPages = Math.ceil(availableRecords / limit);
  return (
    <Box h="100%" w="100%">
      <Box display="flex" flexDir="column" height="100%">
        {/* Header */}
        <LogsHeader onExportCSV={exportToCSV} isLoading={isLoading} />
        <Separator my={0} borderColor={'#fdfdfd'} />
        {/* Filters */}
        <FiltersSection userOptions={userOptions as ListCollection<ApiUserOptions>} modelOptions={modelOptions} requestTypeOptions={requestTypeOptions} allSelectedUsers={allSelectedUsers} selectedModelName={selectedModelName} selectedRequestType={selectedRequestType} startDate={startDate} endDate={endDate} isLoading={isLoading} isLoadingUsers={isLoadingUsers} onUserSelect={handleUserSelect} onModelSelect={handleModelSelect} onRequestTypeSelect={handleRequestTypeSelect} onStartDateChange={handleStartDateChange} onEndDateChange={handleEndDateChange} onApplyFilters={() => fetchUsageData()} onClearFilters={clearFilters} />
        {/* Summary Stats */}
        <SummaryStats tokenSummary={tokenSummary} />
        {/* Pagination */}
        {logs.length > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} availableRecords={availableRecords} totalRecords={totalRecords} limit={limit} selectedLogIds={selectedLogIds} isLoading={isLoading} isDeleting={isDeleting} onPageChange={handlePageChange} onDeleteSelected={handleDeleteSelected} />}
        {/* Table */}
        <Box flex="1" py={4}>
          <LogsTable logs={logs} tableHeaders={tableHeaders} selectedLogIds={selectedLogIds} isAllSelected={isAllSelected} isLoading={isLoading} isDeleting={isDeleting} borderColor={borderColor} hasInitialized={hasInitialized.current} onSelectAll={handleSelectAll} onSelectLog={handleSelectLog} />
        </Box>
      </Box>
    </Box>
  );
};
export default AnalyzeLogsPage;
