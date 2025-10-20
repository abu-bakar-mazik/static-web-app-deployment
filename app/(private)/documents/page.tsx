'use client';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Box, Heading, HStack, VStack, Spinner, Text, Flex, Separator, List } from '@chakra-ui/react';
import CheckBoxField from '@/components/form/CheckBoxField';
import { SearchDoc } from '@/components/docUpload/searchDoc/SearchDoc';
import { useSelectedDocs } from '@/hooks/SelectedDocs';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { clearSearchTerm, resetPagination, setAvailableRecords, setCurrentPage, setIsUploading, setLimit, setOffset, setSearchTerm, setTotalRecords, useFetchAllDocumentsMutation, useDeleteDocumentsMutation, useDeleteMultiDocMutation, usePollDocumentStatusQuery } from '@/redux/slices/fileUploadSlice';
import DocumentUploadView from '@/components/docUpload/docUpload';
import { Delete02Icon, Doc02Icon, DocumentAttachmentIcon, FilterIcon, Pdf02Icon, Tag02Icon } from 'hugeicons-react';
import { ConfirmationDialog } from '@/components/confirmationDialog';
import { useColorModeValue } from '@/components/ui/color-mode';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import { Tag } from '@/components/ui/tag';
import { Tooltip } from '@/components/ui/tooltip';
import { Avatar } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { BadgeRoot } from '@/components/ui/badge';
import { useGetAllCategoriesQuery } from '@/redux/slices/categoriesSlice';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';
import UnifiedCategorization from '@/components/docUpload/UnifiedFileCategorization';
import { PaginationControls } from '@/components/llmLogs/PaginationControls';
import _ from 'lodash';
type OrderType = 'newest' | 'oldest';
function DocumentView() {
  const isFetchingRef = useRef(false);
  const prevIsFetchingRef = useRef(false);
  const pollCountRef = useRef(0);
  const id = useId();
  const dispatch = useDispatch();
  const { selectedDocs, addDoc, removeDoc, clearDocs } = useSelectedDocs();
  const { searchTerm, currentPage, limit, availableRecords, totalRecords, offset, hasMoreData } = useSelector((state: RootState) => state.doc);
  const borderColor = useColorModeValue('rgb(243 248 255)', 'whiteAlpha.200');
  const { userAccount, userId } = useAuth();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderType>('newest');
  const [currentDeleteId, setCurrentDeleteId] = useState<string | string[] | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkCategorizeOpen, setIsBulkCategorizeOpen] = useState(false);
  const [selectedSingleDoc, setSelectedSingleDoc] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const MAX_POLLS = 5;
  const [fetchAllDocuments, { isLoading: getDocLoading }] = useFetchAllDocumentsMutation();
  const [deleteDocuments, { isLoading: delDocLoading }] = useDeleteDocumentsMutation();
  const [deleteMultiDoc, { isLoading: delMultiLoading }] = useDeleteMultiDocMutation();
  const { data: categories = [] } = useGetAllCategoriesQuery(userId || '', { skip: !userId });
  const hasProcessingDocuments = useMemo(() => {
    return documentsData.some((doc) => doc.category === 'processing');
  }, [documentsData]);
  const shouldSkip = !hasProcessingDocuments || !userId || !pollingEnabled;
  const { data: polledData, isFetching } = usePollDocumentStatusQuery(
    {
      user_id: userId || '',
      offset,
      limit,
      order: orderFilter,
      ...(selectedCategoryIds.length > 0 && {
        category_ids: selectedCategoryIds.includes('uncategorized') ? ['', ...selectedCategoryIds] : selectedCategoryIds,
      }),
    },
    {
      skip: shouldSkip,
      pollingInterval: pollingEnabled ? 10000 : 0,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: false,
    },
  );
  useEffect(() => {
    // Count when a fetch completes
    if (prevIsFetchingRef.current && !isFetching) {
      pollCountRef.current += 1;
      console.log('Poll count:', pollCountRef.current);

      if (pollCountRef.current >= MAX_POLLS) {
        setPollingEnabled(false);
        console.log('Max polls reached, stopping');
      }
    }
    prevIsFetchingRef.current = isFetching;
  }, [isFetching]);
  useEffect(() => {
    if (polledData?.records) {
      const transformedData = polledData.records.map((record: any) => ({
        id: record.file_id,
        name: record.file_name,
        filename: record.file_name,
        date: record.datetime,
        category: record.category_name,
        category_id: record.category_id,
        file_url: record.file_url,
        user_id: record.user_id,
      }));
      setDocumentsData(transformedData);
      dispatch(setTotalRecords(polledData.total_returned));
      dispatch(setAvailableRecords(polledData.total_available));
    }
  }, [polledData, dispatch]);
  const fetchDocuments = useCallback(
    async (pageOffset?: number, showToast = true) => {
      if (!userId || isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        dispatch(setIsUploading(true));
        const currentOffset = pageOffset !== undefined ? pageOffset : offset;
        if (pageOffset === undefined) {
          dispatch(resetPagination());
        }
        const response = await fetchAllDocuments({
          user_id: userId,
          offset: currentOffset,
          limit,
          order: orderFilter,
          ...(selectedCategoryIds.length > 0 && {
            category_ids: selectedCategoryIds.includes('uncategorized') ? ['', ...selectedCategoryIds] : selectedCategoryIds,
          }),
        }).unwrap();
        const transformedData = response.records.map((record: any) => ({
          id: record.file_id,
          name: record.file_name,
          filename: record.file_name,
          date: record.datetime,
          category: record.category_name,
          category_id: record.category_id,
          file_url: record.file_url,
          user_id: record.user_id,
        }));
        setDocumentsData(transformedData);
        dispatch(setTotalRecords(response.total_returned));
        dispatch(setAvailableRecords(response.total_available));
        const newPage = Math.floor(currentOffset / limit) + 1;
        dispatch(setCurrentPage(newPage));
        const fetchedDocIds = new Set(response.records.map((record) => record.file_id));
        selectedDocs.forEach((doc) => {
          if (!fetchedDocIds.has(doc.id)) {
            removeDoc(doc.id);
          }
        });
        if (showToast) {
          const filterCount = selectedCategoryIds.length + (orderFilter !== 'newest' ? 1 : 0);
          toaster.create({
            title: 'Documents loaded successfully',
            description: `Found ${response.total_available} documents${filterCount > 0 ? ' with filters applied' : ''}`,
            type: 'success',
          });
        }
      } catch (error) {
        console.log('Error fetching documents:', error);
        toaster.create({
          title: 'Failed to fetch documents',
          description: 'Please try again',
          type: 'error',
        });
      } finally {
        dispatch(setIsUploading(false));
        isFetchingRef.current = false;
      }
    },
    [userId, offset, limit, selectedCategoryIds, orderFilter, fetchAllDocuments, dispatch],
  );
  const debouncedFetchDocuments = useMemo(
    () =>
      _.debounce(() => {
        if (userId) {
          fetchDocuments();
        }
      }, 1000),
    [userId, fetchDocuments],
  );
  useEffect(() => {
    return () => {
      debouncedFetchDocuments.cancel();
    };
  }, [debouncedFetchDocuments]);
  useEffect(() => {
    debouncedFetchDocuments();
  }, [selectedCategoryIds, orderFilter, debouncedFetchDocuments]);
  useEffect(() => {
    const handleDocumentChange = () => {
      fetchDocuments(offset, false);
    };
    window.addEventListener('documents-updated', handleDocumentChange);
    return () => {
      window.removeEventListener('documents-updated', handleDocumentChange);
    };
  }, [userId, offset]);
  const orderOptions = useMemo(() => {
    const options = [
      { label: 'Newest First', value: 'newest', id: 'newest' },
      { label: 'Oldest First', value: 'oldest', id: 'oldest' },
    ];
    return createListCollection({ items: options });
  }, []);
  const categoryOptions = useMemo(() => {
    const options = [
      { label: 'Uncategorized', value: '', id: '' },
      ...categories.map((category: any) => ({
        id: category.id,
        label: category.category_name,
        value: category.id,
      })),
    ];
    return createListCollection({ items: options });
  }, [categories]);
  const handleMultipleDelete = async (fileIds: string[]) => {
    if (currentDeleteId || !userId) return;
    try {
      setCurrentDeleteId(fileIds);
      await deleteMultiDoc({ userId, fileIds }).unwrap();
      fileIds.forEach((fileId) => removeDoc(fileId));
      toaster.create({
        title: 'Files deleted successfully',
        type: 'success',
      });
      await fetchDocuments(offset, false);
    } catch (error) {
      console.log('Delete error:', error);
      toaster.create({
        title: 'An error occurred',
        description: 'Unable to delete the files due to a server error',
        type: 'error',
      });
    } finally {
      setCurrentDeleteId(null);
      setIsDeleteOpen(false);
    }
  };
  const handleDeleteFile = async (fileId: string) => {
    if (currentDeleteId || !userId) return;
    try {
      setCurrentDeleteId(fileId);
      await deleteDocuments({ userId, fileId }).unwrap();
      removeDoc(fileId);
      toaster.create({
        title: 'File deleted successfully',
        type: 'success',
      });
      await fetchDocuments(offset, false);
    } catch (error) {
      console.log('Delete error:', error);
      toaster.create({
        title: 'An error occurred',
        description: 'Unable to delete the file due to a server error',
        type: 'error',
      });
    } finally {
      setCurrentDeleteId(null);
    }
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value.toLowerCase()));
  };
  const filteredDocuments = useMemo(() => {
    return documentsData.filter((doc) => doc.name.toLowerCase().includes(searchTerm));
  }, [documentsData, searchTerm]);
  const { isAllSelected, isIndeterminate } = useMemo(() => {
    if (filteredDocuments.length === 0) {
      return { isAllSelected: false, isIndeterminate: false };
    }
    const selectedCount = filteredDocuments.filter((doc) => selectedDocs.some((selected) => selected.id === doc.id)).length;
    return {
      isAllSelected: selectedCount === filteredDocuments.length,
      isIndeterminate: selectedCount > 0 && selectedCount < filteredDocuments.length,
    };
  }, [filteredDocuments, selectedDocs]);
  const toggleSelectAll = useCallback(() => {
    if (!isAllSelected) {
      filteredDocuments.forEach((doc) => {
        if (!selectedDocs.some((selected) => selected.id === doc.id)) {
          addDoc(doc);
        }
      });
    } else {
      filteredDocuments.forEach((doc) => removeDoc(doc.id));
    }
  }, [filteredDocuments, isAllSelected, selectedDocs, addDoc, removeDoc]);
  const formatDate = (dateString: string): string => {
    const inputDate = new Date(dateString);
    return inputDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  const handleCategoryFilterChange = (details: any) => {
    setSelectedCategoryIds(details.value);
    dispatch(setOffset(0));
    dispatch(setCurrentPage(1));
  };
  const handleOrderFilterChange = (details: any) => {
    setOrderFilter(details.value[0] || 'newest');
    dispatch(setOffset(0));
    dispatch(setCurrentPage(1));
  };
  const clearAllFilters = () => {
    setSelectedCategoryIds([]);
    setOrderFilter('newest');
    dispatch(setOffset(0));
    dispatch(setCurrentPage(1));
  };
  const renderCategoryStatus = (doc: any) => {
    const { category, category_id } = doc;
    if (category && category.length > 0) {
      return (
        <HStack gap={1} justify="center" flexWrap="wrap">
          {category_id && category !== 'uncategorized' ? (
            <BadgeRoot colorPalette="blue" size="sm" textTransform="capitalize">
              <Text as="span" maxW={{ base: '120px', md: '180px' }} truncate>
                {category}
              </Text>
            </BadgeRoot>
          ) : category === 'processing' ? (
            <BadgeRoot colorPalette="orange" size="sm" textTransform="capitalize">
              {category}
            </BadgeRoot>
          ) : category === 'error' ? (
            <BadgeRoot colorPalette="red" size="sm" textTransform="capitalize">
              {category}
            </BadgeRoot>
          ) : (
            <BadgeRoot colorPalette="gray" size="sm" textTransform="capitalize">
              {category}
            </BadgeRoot>
          )}
        </HStack>
      );
    }
    return (
      <BadgeRoot colorPalette="gray" size="sm" textTransform="capitalize">
        Uncategorized
      </BadgeRoot>
    );
  };
  const selectedCategoryLabels = useMemo(() => {
    return selectedCategoryIds.map((id) => {
      if (id === '') return 'Uncategorized';
      const category = categories.find((cat: any) => cat.id === id);
      return category?.category_name || id;
    });
  }, [selectedCategoryIds, categories]);
  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    dispatch(setOffset(newOffset));
    fetchDocuments(newOffset);
  };
  const handleLoadMore = () => {
    dispatch(setLimit(limit + 50));
  };
  useEffect(() => {
    return () => {
      dispatch(clearSearchTerm());
    };
  }, [dispatch]);
  const totalPages = Math.ceil(availableRecords / limit);
  return (
    <Box h="100%" w="100%">
      <Box display="flex" borderTop="1px solid" borderColor="#e1e5ec" flexDir="column" height="100%" overflow="hidden">
        {/* Header */}
        <HStack py={{ base: 2, lg: 3 }} px={4} flexDirection={{ base: 'column', sm: 'row' }} alignItems="center">
          <Heading as="h1" display="flex" alignItems="center" fontSize={{ base: '16px', lg: '18px' }} fontWeight="700" mb={{ base: '0.5rem', sm: 0 }}>
            <DocumentAttachmentIcon size={24} style={{ marginRight: 8 }} color="inherit" /> Documents
          </Heading>
          <HStack ml="auto" gap={3} wrap={{ base: 'wrap', lg: 'nowrap' }}>
            <SelectRoot collection={orderOptions} value={[orderFilter]} onValueChange={handleOrderFilterChange} positioning={{ sameWidth: false }}>
              <SelectTrigger minW="150px" h="50px">
                <SelectValueText placeholder="Order" />
              </SelectTrigger>
              <SelectContent portalled={false}>
                {orderOptions.items.map((item) => (
                  <SelectItem key={item.id} item={item} w="150px">
                    <Text truncate>{item.label}</Text>
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SelectRoot collection={categoryOptions} value={selectedCategoryIds} onValueChange={handleCategoryFilterChange} multiple positioning={{ sameWidth: false }}>
              <SelectTrigger minW="200px" h="50px">
                <FilterIcon size={16} style={{ marginRight: 4 }} />
                <SelectValueText placeholder="Filter Categories">
                  {() => {
                    if (selectedCategoryIds.length === 0) return 'All Categories';
                    if (selectedCategoryIds.length === 1) return selectedCategoryLabels[0];
                    return `${selectedCategoryIds.length} categories selected`;
                  }}
                </SelectValueText>
              </SelectTrigger>
              <SelectContent portalled={false}>
                {categoryOptions.items.map((item) => (
                  <SelectItem key={item.id} item={item} w="200px">
                    <Text truncate>{item.label}</Text>
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <SearchDoc placeholder="Search Documents" minWidth="300px" value={searchTerm} onChange={handleSearchChange} borderRadius="30px" />
          </HStack>
        </HStack>
        <Separator my={0} borderColor={borderColor} />
        {/* Main Content */}
        <Box p={3} pb={0} h={{ base: 'calc(100% - 61px)', lg: 'calc(100% - 77px)' }} overflowY="auto" borderTop="1px solid" borderTopColor="#e1e5ec">
          <HStack display={{ base: 'flex', lg: 'none' }} mb={{ base: 3, sm: 0 }}>
            <DocumentUploadView />
          </HStack>
          {(selectedCategoryIds.length > 0 || orderFilter !== 'newest') && (
            <Box mb="3" p={2} bg="rgba(200,209,229,0.2)" borderRadius="md">
              <HStack gap={2} flexWrap="wrap">
                <Text fontSize="sm" color="gray.600">
                  Active filters:
                </Text>
                {orderFilter !== 'newest' && (
                  <Tag variant="outline" size="sm">
                    Order: {orderFilter === 'oldest' ? 'Oldest First' : 'Newest First'}
                  </Tag>
                )}
                {selectedCategoryIds.length > 0 && (
                  <Tag variant="outline" size="sm">
                    Categories: {selectedCategoryLabels.join(', ')}
                  </Tag>
                )}
                <Button size="xs" variant="ghost" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </HStack>
            </Box>
          )}
          {!delMultiLoading && selectedDocs.length > 0 && (
            <Box mb="3" bg="rgba(200,209,229,0.3)" p={3} borderRadius="md">
              <VStack gap={3} align="stretch">
                <HStack gap={2} justify="flex-start">
                  <Button visual="primary" size="sm" onClick={() => setIsBulkCategorizeOpen(true)}>
                    <Tag02Icon size={16} style={{ marginRight: 4 }} />
                    Categorize Selected ({selectedDocs.length})
                  </Button>
                  <Button visual="outlineRed" onClick={() => setIsDeleteOpen(true)} disabled={delMultiLoading}>
                    <Delete02Icon style={{ width: 18, height: 18 }} />
                    Delete Selected ({selectedDocs.length})
                  </Button>
                </HStack>
                <Box maxH="73px" overflowY="auto">
                  <HStack gap="2" flexWrap="wrap">
                    {selectedDocs.map((doc) => (
                      <Tag closable onClose={() => removeDoc(doc.id)} key={doc.id} variant="outline" borderRadius="full" px={3} py="6px" color="gray.700" bg="rgba(255,255,255,0.25)" boxShadow="inset 0 0 0px 1px #d5d8dd">
                        {doc.name}
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </Box>
          )}
          <VStack border="1px solid" borderColor="rgba(255,255,255,0.3)" overflow="hidden" borderRadius="8px" gap={0} h={selectedDocs.length > 0 ? 'calc(100% - 89px)' : '100%'} overflowY="auto">
            <Flex fontWeight="bold" borderBottom="1px solid" borderColor="rgba(255,255,255,0.5)" bg="rgb(200,209,229,0.3)" p={3} w="100%" display="grid" gridTemplateColumns="2fr 1fr 1fr 0.8fr 0.6fr" alignItems="center" gap={2}>
              <HStack>
                <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} indeterminate={isIndeterminate} />
                <Text fontSize={{ base: 'xs', lg: 'sm' }}>File Name</Text>
              </HStack>
              <Text textAlign="center" fontSize={{ base: 'xs', lg: 'sm' }}>
                Date Uploaded
              </Text>
              <Text textAlign="center" fontSize={{ base: 'xs', lg: 'sm' }}>
                Category
              </Text>
              <Text textAlign="center" fontSize={{ base: 'xs', lg: 'sm' }}>
                Uploader
              </Text>
              <Text textAlign="end" fontSize={{ base: 'xs', lg: 'sm' }}>
                Actions
              </Text>
            </Flex>
            {getDocLoading || delMultiLoading ? (
              <VStack alignItems="center" justifyContent="center" h="200px">
                <Spinner />
              </VStack>
            ) : filteredDocuments.length === 0 ? (
              <VStack alignItems="center" justifyContent="center" h="200px">
                <Text color="gray.500">No documents found</Text>
              </VStack>
            ) : (
              <List.Root gap={0} w="100%" overflowY="auto">
                {filteredDocuments.map((doc) => {
                  const isSelected = selectedDocs.some((selectedDoc) => selectedDoc.id === doc.id);
                  const docExtension = doc.filename.split('.').pop()?.toLowerCase();
                  const isDeleting = currentDeleteId === doc.id;
                  return (
                    <List.Item key={doc.id} px={3} py="8px" borderBottom="1px solid" borderBottomColor={borderColor} borderTop="1px solid" borderTopColor="rgba(211,217,225,0.3)" bg="#eef1f7" display="grid" gridTemplateColumns="2fr 1fr 1fr 0.8fr 0.6fr" alignItems="center" gap={2}>
                      <HStack overflow="hidden">
                        <CheckBoxField width="100%" order="0" label={doc.name} id={doc.id} checked={isSelected} onChange={() => (isSelected ? removeDoc(doc.id) : addDoc(doc))} icon={docExtension === 'pdf' ? <Pdf02Icon style={{ color: 'red' }} /> : docExtension === 'docx' || docExtension === 'doc' ? <Doc02Icon style={{ color: 'blue' }} /> : null} labelSize={{ base: '12px', lg: '13px' }} />
                      </HStack>
                      <Text fontSize={{ base: '12px', lg: '13px' }} textAlign="center">
                        {formatDate(doc.date)}
                      </Text>
                      <Box display="flex" justifyContent="center" alignItems="center" minH="40px">
                        {renderCategoryStatus(doc)}
                      </Box>
                      <Flex justify="center">
                        <Tooltip ids={{ trigger: `${id}-${doc.id}` }} content={userAccount?.name || 'User'}>
                          <Avatar ids={{ root: `${id}-${doc.id}` }} bg="gradients.primary" w="35px" h="35px" maxW="35px" size="xs" name={userAccount?.name || 'User'} variant="solid" />
                        </Tooltip>
                      </Flex>
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Tooltip content="Update Category">
                          <Button
                            visual="ghost"
                            bg="transparent"
                            color="gray.400"
                            _hover={{ bg: 'transparent', color: 'blue.600' }}
                            _focus={{ bg: 'transparent', color: 'blue.600' }}
                            aria-label="Categorize"
                            disabled={isDeleting || delDocLoading}
                            onClick={() => {
                              setSelectedSingleDoc(doc);
                              setIsBulkCategorizeOpen(true);
                            }}
                            w="24px"
                            h="24px"
                            minWidth="initial"
                          >
                            <Tag02Icon size={16} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete Document">
                          <Button visual="ghost" bg="transparent" color="gray.400" _hover={{ bg: 'transparent', color: 'red.600' }} _focus={{ bg: 'transparent', color: 'red.600' }} aria-label="Delete" disabled={isDeleting || delDocLoading} onClick={() => handleDeleteFile(doc.id)} w="24px" h="24px" minWidth="initial">
                            <Delete02Icon size={20} />
                          </Button>
                        </Tooltip>
                      </Box>
                    </List.Item>
                  );
                })}
              </List.Root>
            )}
            <Box marginTop={'auto'} w={'100%'}>
              {filteredDocuments.length > 1 && totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} availableRecords={availableRecords} totalRecords={totalRecords} limit={limit} isLoading={getDocLoading} onPageChange={handlePageChange} />}
            </Box>
          </VStack>
        </Box>
        <HStack w="100%" py={2} px={4} justifyContent="space-between">
          <HStack gap={2}>
            <Text fontSize="xs">
              {totalRecords} of {availableRecords} documents
            </Text>
            {hasMoreData && (
              <Button size="xs" variant="outline" onClick={handleLoadMore} disabled={getDocLoading}>
                Load more
              </Button>
            )}
          </HStack>
          <HStack gap={2}>
            <Text fontSize="xs">{filteredDocuments.length} displayed</Text>
            <Text fontSize="xs">{selectedDocs.length} selected</Text>
          </HStack>
        </HStack>
      </Box>
      <ConfirmationDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => handleMultipleDelete(selectedDocs.map((doc) => doc.id))} title="Delete Documents" description={`Are you sure you want to delete ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}? This action cannot be undone.`} confirmText="Delete" variant="destructive" />
      <UnifiedCategorization
        isOpen={isBulkCategorizeOpen}
        onClose={() => {
          setIsBulkCategorizeOpen(false);
          setSelectedSingleDoc(null);
        }}
        documents={selectedSingleDoc ? [selectedSingleDoc] : selectedDocs}
        mode="update"
        onCategorizeComplete={() => {
          fetchDocuments(offset, false);
          clearDocs();
          setSelectedSingleDoc(null);
        }}
      />
    </Box>
  );
}
export default React.memo(DocumentView);
