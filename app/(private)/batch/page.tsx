'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Box, Text, Badge, HStack, VStack, Heading, Icon, Flex, IconButton, Spinner, Separator, Progress } from '@chakra-ui/react';
import { useGetAllPromptsQuery, selectFilteredPrompts, selectSelectedPrompts, selectSelectedPromptIdentifiers, togglePrompt, selectSearchQuery, setSearchQuery, clearSearchQuery, validateSelectedPrompts } from '@/redux/slices/promptsSlice';
import { useSelectedDocs } from '@/hooks/SelectedDocs';
import BatchProcessingStatus from '@/components/batchProcessing';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { useBatchQA } from '@/context/BatchContext';
import { BatchResponse } from '@/types/batch-types';
import { useBatchExport } from '@/hooks/useJsonToCSV';
import { AlertCircleIcon, Attachment01Icon, AlgorithmIcon, BrowserIcon, CheckmarkCircle01Icon, Csv01Icon, Delete02Icon, Download01Icon, DownloadSquare01Icon, FileAttachmentIcon, FileDownloadIcon, ReloadIcon, SentIcon, SquareArrowExpand01Icon, Share08Icon } from 'hugeicons-react';
import { SearchDoc } from '@/components/docUpload/searchDoc/SearchDoc';
import _ from 'lodash';
import { useColorModeValue } from '@/components/ui/color-mode';
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion';
import { Tooltip } from '@/components/ui/tooltip';
import { TableBody, TableCell, TableColumnHeader, TableHeader, TableRoot, TableRow } from '@/components/ui/table';
import { CardRoot } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AppDispatch } from '@/redux/store';
import { useEscapeKey } from '@/hooks/handleEscape';
import { CloseButton } from '@/components/ui/close-button';
import { Prompt } from '@/types/prompt-types';
import BatchAutomationModal from '@/components/BatchAutomationModal';
interface GroupedBatches {
  [key: string]: Array<{
    id: string;
    _ts?: number;
    file_ids: string[];
    batch_response?: Record<string, any>;
  }>;
}
const BatchQAListView: React.FC = () => {
  const promptPanelRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuth();
  const skipQuery = !userId;
  const { data: promptsData, isLoading: promptsLoading } = useGetAllPromptsQuery(userId || '', {
    skip: skipQuery,
  });
  const prompts = promptsData || [];
  const { requests, processBatchQA, isProcessing, completedBatches, updateCompletedBatches, handleDeleteBatch, loadingBatchId } = useBatchQA();
  const { selectedDocs } = useSelectedDocs();
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const selectedPrompts = useSelector(selectSelectedPrompts);
  const selectedPromptIdentifiers = useSelector(selectSelectedPromptIdentifiers);
  const { isExporting, handleBatchExport } = useBatchExport();
  const searchQuery = useSelector(selectSearchQuery);
  const [isBrowsePrompt, setIsBrowsePrompt] = useState(prompts?.length > 0 ? true : false);
  const [promptExpand, setPromptExpand] = useState<boolean>(false);
  const [isBatchAutomationOpen, setIsBatchAutomationOpen] = useState(false); // Batch automation modal state
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'processing':
        return 'orange';
      default:
        return 'gray';
    }
  };
  useEffect(() => {
    if (userId) {
      // Validate that all selected prompts still exist when the component mounts
      dispatch(validateSelectedPrompts());
    }
  }, [userId, dispatch]);
  useEffect(() => {
    let isSubscribed = true;
    if (userId) {
      updateCompletedBatches();
    }
    return () => {
      isSubscribed = false;
    };
  }, [userId]);
  const handlePromptClick = async (): Promise<void> => {
    const selectedDocsData = selectedDocs.map((doc) => doc.id);
    if (selectedDocsData) {
      const validPrompts = await dispatch(validateSelectedPrompts()).unwrap();
      if (validPrompts.length === 0) {
        // Notify user if no valid prompts are selected
        // You can use whatever notification system you have (toast, alert, etc.)
        // For example:
        // toaster.create({
        //   title: 'No valid prompts selected.',
        //   type: 'warning',
        // });
        return;
      }
      await processBatchQA(selectedPrompts, selectedDocsData);
      setPromptExpand(false);
    }
  };
  // Helper to check if a specific prompt in a group is selected
  const isSpecificPromptSelected = (promptId: string, promptIndex: number): boolean => {
    return selectedPromptIdentifiers.some((item) => item.promptId === promptId && item.promptIndex === promptIndex);
  };
  // Get state for parent checkbox (prompt group)
  const getPromptState = (prompt: Prompt) => {
    const validPrompts = prompt.prompt.filter((p) => p && p.trim());
    // Count how many prompts from this group are selected
    const selectedCount = validPrompts.reduce((count, _, index) => {
      return count + (isSpecificPromptSelected(prompt.id, index) ? 1 : 0);
    }, 0);
    return {
      isSelected: selectedCount === validPrompts.length && validPrompts.length > 0,
      isIndeterminate: selectedCount > 0 && selectedCount < validPrompts.length,
    };
  };
  const handleTogglePrompt = (prompt: Prompt, isParent: boolean = false, childIndex?: number): void => {
    if (isParent) {
      // Parent checkbox - toggle all prompts in the group
      const { isSelected } = getPromptState(prompt);
      dispatch(
        togglePrompt({
          id: prompt.id,
          title: prompt.title,
          prompt: prompt.prompt,
          datetime: prompt.datetime,
          isParent: true,
          isSelected: !isSelected,
        }),
      );
    } else if (childIndex !== undefined) {
      // Child checkbox - toggle only the specific prompt
      const childPrompt = prompt.prompt[childIndex];
      const isSelected = isSpecificPromptSelected(prompt.id, childIndex);
      dispatch(
        togglePrompt({
          id: prompt.id,
          title: prompt.title,
          prompt: [childPrompt],
          promptIndices: [childIndex],
          datetime: prompt.datetime,
          isParent: false,
          isSelected: !isSelected,
        }),
      );
    }
  };
  const handleParentToggle = (e: React.MouseEvent, prompt: Prompt) => {
    e.preventDefault();
    e.stopPropagation();
    handleTogglePrompt(prompt, true);
  };
  const handleChildToggle = (e: React.MouseEvent, prompt: Prompt, childIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleTogglePrompt(prompt, false, childIndex);
  };
  const handleBrowseClick = (): void => {
    setIsBrowsePrompt(!isBrowsePrompt);
  };

  const handleBatchAutomationClick = (): void => {
    setIsBatchAutomationOpen(true);
  };
  // Create a debounced version of the search handler
  const debouncedSearchHandler = useCallback(
    _.debounce((value: string) => {
      dispatch(setSearchQuery(value));
    }, 300),
    [dispatch],
  );
  // Update the search handler to use the debounced function
  const handleSearchChange = (value: string) => {
    debouncedSearchHandler(value);
  };
  // Ensure isBrowsePrompt state is properly managed
  useEffect(() => {
    if (prompts?.length > 0 && selectedDocs.length > 0) {
      setIsBrowsePrompt(true);
    }
  }, [prompts?.length, selectedDocs.length]);
  useEffect(() => {
    return () => {
      dispatch(clearSearchQuery());
    };
  }, [dispatch]);
  useEffect(() => {
    if (promptExpand) {
      const handleClickOutside = (event: MouseEvent) => {
        if (promptPanelRef.current && !promptPanelRef.current.contains(event.target as Node)) {
          const expandButton = document.querySelector('button[class*="submitP"]');
          if (!expandButton || !expandButton.contains(event.target as Node)) {
            setPromptExpand(false);
          }
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [promptExpand]);
  useEscapeKey(() => {
    if (promptExpand) {
      setPromptExpand(false);
    }
  }, [promptExpand]);
  const handlePromptExpand = useCallback(() => {
    setPromptExpand((prev) => !prev);
  }, []);
  const renderResponseContent = (responses: BatchResponse[] | undefined): React.ReactNode => {
    if (!responses || responses.length === 0) return null;
    const allQuestionsAndAnswers = responses.map((response) => ({
      question: response.response.question,
      answer: response.response.answer,
    }));
    return (
      <CardRoot variant="outline" css={{ marginBottom: 4, '&:last-child': { marginBottom: 0 } }}>
        <TableRoot visual="simple">
          <TableHeader bg="gray.700">
            <TableRow>
              <TableColumnHeader color="white" py={4} fontSize={'13px'}>
                Question
              </TableColumnHeader>
              <TableColumnHeader color="white" py={4} fontSize={'13px'}>
                Answer
              </TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody verticalAlign="middle">
            {allQuestionsAndAnswers.map((qa, findex) => (
              <TableRow key={findex}>
                <TableCell maxW={'40%'} w={'40%'} py={2} css={{ textWrap: 'auto', borderCollapse: 'collapse' }} fontSize="sm" borderBottomWidth={findex !== allQuestionsAndAnswers.length - 1 ? '1px' : '0'} borderColor={borderColor}>
                  {qa.question}
                </TableCell>
                <TableCell fontSize="sm" py={2} css={{ textWrap: 'auto', borderLeft: '1px solid', borderCollapse: 'collapse', borderColor: 'gray.200' }} borderBottomWidth={findex !== allQuestionsAndAnswers.length - 1 ? '1px' : '0'} borderColor={borderColor}>
                  {qa.answer}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </CardRoot>
    );
  };
  const renderFileAccordions = (responses: BatchResponse[] | undefined): React.ReactNode => {
    if (!responses || !Array.isArray(responses)) return null;
    const groupedResponses = responses.reduce<{ [key: string]: BatchResponse[] }>((acc, item) => {
      if (!acc[item.filename]) {
        acc[item.filename] = [];
      }
      acc[item.filename].push(item);
      return acc;
    }, {});
    return Object.entries(groupedResponses).map(([filename, fileResponses], FRindex) => (
      <AccordionItem value={filename} borderRadius={8} overflow="hidden" key={filename} border="1px solid" borderColor={borderColor} mb={Object.entries(groupedResponses).length > 0 && FRindex !== Object.entries(groupedResponses).length - 1 ? 2 : 0}>
        <>
          <AccordionItemTrigger py={3} px={4} h="100%" bg={'rgb(200,209,229,0.3)'}>
            <Box flex="1" textAlign="left">
              <Text fontSize="sm" fontWeight="semibold" display="-webkit-box" overflow="hidden" lineClamp="2" boxOrient="vertical">
                {filename}
              </Text>
            </Box>
          </AccordionItemTrigger>
          <AccordionItemContent borderTop="1px solid" borderColor={'#dddddd'} p={3} bg={'rgba(255,255,255,0.25)'}>
            {renderResponseContent(fileResponses)}
          </AccordionItemContent>
        </>
      </AccordionItem>
    ));
  };
  const groupedByDate = useMemo<GroupedBatches>(() => {
    return completedBatches.reduce<GroupedBatches>((acc, batch) => {
      const date = new Date((batch._ts ?? 0) * 1000);
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
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
  }, [completedBatches]);
  const renderDateGroups = () => {
    return Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, batches], index) => (
        <Box key={date} w="full" mb={6}>
          <Heading as="h3" size="sm" mb={4} color="gray.400" fontWeight="normal" fontSize="sm">
            {date} ({batches.length} {batches.length === 1 ? 'batch' : 'batches'})
          </Heading>
          <AccordionRoot collapsible w="100%" defaultValue={index === 0 ? [batches[0]?.id].filter(Boolean) : undefined}>
            {batches.map((batch, index) => {
              const batchTime = new Date((batch._ts ?? 0) * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const firstFilename = batch.batch_response ? Object.values(batch.batch_response)[0]?.[0]?.filename : undefined;
              return (
                <AccordionItem value={batch.id} key={batch.id} borderRadius={8} overflow="hidden" border="1px solid" borderColor={borderColor} mb={3}>
                  <HStack gap={0} h="48px">
                    <Tooltip interactive content={isExporting ? 'Downloading...' : 'Download CSV'}>
                      <Button disabled={isExporting} aria-label="Download CSV" justifyContent="center" onClick={() => handleBatchExport(batch)} px={2} minW="initial" w={10} h="100%" borderRadius={0}>
                        <DownloadSquare01Icon style={{ width: 24, height: 24 }} />
                      </Button>
                    </Tooltip>
                    <AccordionItemTrigger py={3} px={3} bg={'rgb(200,209,229,0.3)'}>
                      <Box flex="1">
                        <HStack gap={4}>
                          <Icon color={getStatusColor('success')}>
                            <CheckmarkCircle01Icon />
                          </Icon>
                          <Text fontWeight="600" textAlign="left" display="flex" alignItems="center">
                            Batch - {batchTime}
                          </Text>
                          <HStack ml="auto" gap={0.25}>
                            <FileAttachmentIcon color="royalblue" fontSize="22px" />
                            <Text fontWeight="600" textAlign="left" ml={1} mr={2}>
                              {batch.file_ids.length}
                            </Text>
                          </HStack>
                        </HStack>
                      </Box>
                    </AccordionItemTrigger>
                    <Tooltip interactive content={'Delete Batch'}>
                      <Button disabled={loadingBatchId === batch.id} aria-label="Export to CSV" justifyContent="center" onClick={() => handleDeleteBatch(batch.id)} px={2} minW="initial" w={10} h="100%" visual="red" borderRadius={0} colorPalette="red">
                        {loadingBatchId === batch.id ? <Spinner size="sm" /> : <Delete02Icon style={{ width: 18, height: 18 }} />}
                      </Button>
                    </Tooltip>
                  </HStack>
                  <AccordionItemContent p={3} bg={'rgba(255,255,255,0.25)'}>
                    <AccordionRoot collapsible defaultValue={[firstFilename]}>
                      {renderFileAccordions(Object.values(batch.batch_response || {}).flat())}
                    </AccordionRoot>
                  </AccordionItemContent>
                </AccordionItem>
              );
            })}
          </AccordionRoot>
        </Box>
      ));
  };
  return (
    <Box pb={3} h="100%" w="100%">
      <Box display="flex" flexDir="column" borderRadius="8px" height="100%" overflow="hidden">
        <HStack py={{ base: 2, lg: 3 }} minH={{ base: '66px', sm: '66px' }} px={4} flexDirection={{ base: 'column', sm: 'row' }}>
          <Heading as="h1" fontSize="18px" fontWeight="bold" mb={{ base: '0.5rem', sm: 0 }}>
            Batch Processing
          </Heading>
          <HStack ml="auto">
            {selectedDocs.length > 0 && (
              <Button as="label" visual="ghost" me={{ sm: '5px' }} _hover={{ bg: 'transparent' }} w="max-content" h="auto" display="flex" alignItems="center" justifyContent="center" px={0} cursor="auto">
                <Icon color="gray.700">
                  <Attachment01Icon size={24} />
                </Icon>
                <Text color="gray.700" fontSize="14px">
                  {selectedDocs.length}
                </Text>
              </Button>
            )}
            <Button className="submitP" py={1} px={2} fontSize={{ base: 'xs', md: 'sm' }} onClick={handleBrowseClick} color="gray.600" bg="transparent" _hover={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} _focus={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} h="auto" disabled={promptExpand}>
              <BrowserIcon size={18} />
              <Text fontSize="12px">Browse Prompts</Text>
            </Button>
            {/* <Button className="submitP" py={1} px={2} fontSize={{ base: 'xs', md: 'sm' }} onClick={handleBatchAutomationClick} color="gray.600" bg="transparent" _hover={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} _focus={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} h="auto">
              <AlgorithmIcon size={18} />
              <Text fontSize="12px">Batch Automation</Text>
            </Button> */}
          </HStack>
        </HStack>
        <Separator my={0} borderColor={'#fdfdfd'} />
        <HStack h="calc(100% - 66px)" w="100%" alignItems="flex-start">
          <VStack gap={4} w="full" py={4} overflowY="auto" h="100%" px={4} borderTop="1px solid" borderTopColor="#e1e5ec" filter={{ base: isBrowsePrompt ? 'blur(10px)' : 'blur(0)', md: promptExpand ? 'blur(10px)' : 'blur(0)' }} pointerEvents={{ base: isBrowsePrompt ? 'none' : 'auto', md: promptExpand ? 'none' : 'auto' }}>
            {/* Active Requests Accordion */}
            {requests.length > 0 && (
              <AccordionRoot w="100%" defaultValue={requests.length > 0 ? [requests[0].id] : []}>
                {requests.map((request) => (
                  <AccordionItem value={request.id} key={request.id} border="1px solid" borderColor={'#dbe0e3'} mb={4} bg={'rgba(255,255,255,0.25)'} borderRadius="8px" overflow="hidden">
                    <AccordionItemTrigger py={3} px={3} bg={request.status === 'completed' ? 'rgb(200,209,229,0.3)' : 'gray.100'}>
                      <Box flex="1">
                        <HStack gap={4}>
                          <Box className={request.status === 'processing' ? 'spinning' : ''} color={getStatusColor(request.status)}>
                            {request.status === 'completed' ? <CheckmarkCircle01Icon /> : request.status === 'failed' ? <AlertCircleIcon /> : <ReloadIcon />}
                          </Box>
                          <Text fontWeight="medium" textAlign="left" lineClamp="2" display="-webkit-box" boxOrient="vertical" overflow="hidden">
                            Batch - {request.id} - {Array.isArray(request.formattedPrompts) ? request.formattedPrompts.join(', ') : request.formattedPrompts}
                          </Text>
                          <Badge colorPalette={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
                          {request.status === 'processing' && (
                            <Text fontSize="sm" color="gray.600">
                              {Math.floor(request.progress / (100 / request.fileIds.length))} of {request.fileIds.length} files completed
                            </Text>
                          )}
                        </HStack>
                      </Box>
                    </AccordionItemTrigger>
                    <AccordionItemContent pb={4} px={3}>
                      {request.status === 'processing' && <BatchProcessingStatus status={request.status} progress={request.progress} />}
                      {request.status === 'completed' && request.response && <Text>Analysis Completed.</Text>}
                      {request.status === 'failed' && <Text color="red.500">Analysis failed. Please try again.</Text>}
                    </AccordionItemContent>
                  </AccordionItem>
                ))}
              </AccordionRoot>
            )}
            {/* Completed Batches List View */}
            {completedBatches.length > 0 && (
              <Box w="100%" mt={6}>
                <Heading as="h2" size="md" mb={4}>
                  Successful Batches
                </Heading>
                {renderDateGroups()}
              </Box>
            )}
          </VStack>
          {selectedDocs.length > 0 && (
            <Flex ref={promptPanelRef} direction="column" w={{ base: selectedDocs.length > 0 ? (isBrowsePrompt ? '75%' : 0) : isBrowsePrompt ? '75%' : 0, md: selectedDocs.length > 0 ? (isBrowsePrompt ? (promptExpand ? '75%' : '300px') : 0) : isBrowsePrompt ? (promptExpand ? '75%' : '300px') : 0 }} pos={{ base: 'absolute', md: promptExpand ? 'absolute' : 'relative' }} right={{ base: selectedDocs.length > 0 ? (isBrowsePrompt ? 0 : '-75%') : isBrowsePrompt ? 0 : '-75%', md: selectedDocs.length > 0 ? (isBrowsePrompt ? 0 : promptExpand ? '-75%' : '-300px') : isBrowsePrompt ? 0 : promptExpand ? '-75%' : '-300px' }} display="flex" borderLeft="1px solid" borderColor="gray.200" transition="all 0.2s" mx={0} tabIndex={isBrowsePrompt ? 0 : -1} clip={{ base: 'inherit', md: promptExpand ? 'inherit' : 'rect(0, 0, 0, 0)' }} aria-hidden={!isBrowsePrompt} visibility={isBrowsePrompt ? 'visible' : 'hidden'} zIndex={{ base: '23', md: '1' }} h={'100%'}>
              <Heading as="h6" fontSize="md" borderBottom="1px solid" borderBottomColor="#dbe0e3" w="100%" textAlign="center" px={2} py={3} bg="rgb(200,209,229,0.3)" display="flex" alignItems={'center'}>
                Prompts
                <CloseButton size={{ base: 'md', md: 'md' }} display={{ base: 'inline-flex', md: 'none' }} visual={'ghost'} w="max-content" px={2} minW={'initial'} h={'100%'} ml="auto" onClick={() => setIsBrowsePrompt(false)} />
                <Button className="submitP" px={{ base: '8px', md: '10px' }} display={{ base: 'none', md: 'flex' }} fontSize={{ base: 'xs', md: 'sm' }} borderRadius="45px" ms="auto" w={{ base: '38px', sm: '45px' }} h={{ base: '21px', md: '21px' }} mr={{ base: '0px', sm: '0px' }} onClick={handlePromptExpand} order={3} transition="order 0.3s ease" bg="transparent" color="#1c9cf4" _hover={{ bg: 'transparent' }} _focus={{ bg: 'transparent' }}>
                  <SquareArrowExpand01Icon size={22} />
                </Button>
              </Heading>
              <SearchDoc placeholder="Search Prompts" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} w="100%" css={{ '& .custom-input': { borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, bg: 'rgba(255, 255, 255, 0.25)' } }} />
              <VStack w="100%" gap={2} p={3} overflowY="auto" height="calc(100% - 44px)" bg={promptExpand ? "rgba(233,238,248,0.95)" : "rgba(233,238,248,0.5)"} borderTop="1px solid" borderTopColor="#f3f8ff">
                {prompts.map((prt: Prompt, index) => {
                  const validPrompts = prt.prompt.filter((prompt) => prompt && prompt.trim().length > 0);
                  const { isSelected, isIndeterminate } = getPromptState(prt);
                  return (
                    <AccordionRoot key={`prompt-group-${prt.id}-${index}`} w="100%" collapsible defaultValue={index === 0 ? [prt.title] : undefined}>
                      <AccordionItem value={prt.title} pos="relative" border="none" w="100%" css={{ '& .chakra-collapse': { width: '100%' } }}>
                        <HStack
                          borderRadius="8px"
                          bg="rgb(200,209,229,0.3)"
                          px={2}
                          h="40px"
                          zIndex={1}
                          right="0"
                          pos="relative"
                          alignItems="center"
                          css={{
                            '& [data-state="open"]': {
                              _before: {
                                content: "''",
                                pos: 'absolute',
                                left: '5px',
                                w: '1px',
                                height: '32px',
                                top: '37px',
                                background: '#dbe0e3',
                              },
                            },
                          }}
                        >
                          <Flex onClick={(e) => handleParentToggle(e, prt)} flex="1" maxW={'calc(100% - 28px)'}>
                            <Checkbox checked={isSelected} indeterminate={isIndeterminate} overflow="hidden" pl={1} maxW={'100%'}>
                              <HStack w="100%" alignItems="center" gap={2}>
                                {prt.is_owner === false && (
                                  <Tooltip content={`Shared by ${prt.shared_by || 'another user'}`}>
                                    <Icon as={Share08Icon} w={4} h={4} color="blue.500" flexShrink={0} />
                                  </Tooltip>
                                )}
                                <Text fontSize="sm" color="gray.600" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" flex="1" textAlign="left">
                                  {prt.title}
                                </Text>
                              </HStack>
                            </Checkbox>
                          </Flex>
                          <AccordionItemTrigger h="40px" flex="1" w={'20px'} maxW={'20px'} gap={0} justifyContent={'flex-end'} />
                        </HStack>
                        <AccordionItemContent w="100%" p="0" mt={2}>
                          {validPrompts && (
                            <>
                              {prt.prompt.map((pmt, pind) => {
                                if (!pmt.trim()) return null;
                                const isLastIndex = pind === prt.prompt.filter((p) => p.trim()).length - 1;
                                return (
                                  <Tooltip content={pmt} key={`${prt.id}-prompt-${pind}-${pmt.substring(0, 10)}`}>
                                    <Box
                                      _before={{
                                        content: "''",
                                        pos: 'absolute',
                                        left: '-12px',
                                        width: '12px',
                                        height: '1px',
                                        background: '#dbe0e3',
                                      }}
                                      _after={{
                                        content: "''",
                                        pos: 'absolute',
                                        left: '-12px',
                                        height: '24px',
                                        width: '1px',
                                        bottom: !isLastIndex ? '-5px' : undefined,
                                        top: isLastIndex ? '-5px' : undefined,
                                        background: '#dbe0e3',
                                      }}
                                      _focusVisible={{ outline: 'none' }}
                                      _focus={{ bg: 'blue.50', borderColor: 'blue.100' }}
                                      _hover={{ bg: 'blue.50', borderColor: 'blue.100' }}
                                      fontWeight="medium"
                                      bg="rgba(255,255,255,0.25)"
                                      ml={4}
                                      p={2}
                                      borderRadius="8px"
                                      border="1px solid"
                                      borderColor="gray.200"
                                      justifyContent="flex-start"
                                      w="calc(100% - 16px)"
                                      mb={!isLastIndex ? 2 : 0}
                                      pos="relative"
                                      height="40px"
                                      display="inline-flex"
                                      alignItems="center"
                                    >
                                      <Box onClick={(e) => handleChildToggle(e, prt, pind)} overflow="hidden">
                                        <Checkbox checked={isSpecificPromptSelected(prt.id, pind)} colorScheme="blue" pl={1}>
                                          <Text fontSize="sm" color="gray.600" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" maxW="100%">
                                            {pmt}
                                          </Text>
                                        </Checkbox>
                                      </Box>
                                    </Box>
                                  </Tooltip>
                                );
                              })}
                            </>
                          )}
                        </AccordionItemContent>
                      </AccordionItem>
                    </AccordionRoot>
                  );
                })}
              </VStack>
            </Flex>
          )}
        </HStack>
        {selectedPrompts.length > 0 && (
          <Button aria-label="Send Prompt" justifyContent="center" pos="fixed" zIndex="101" right={4} top={6} borderRadius="full" onClick={handlePromptClick} px={4} minW="initial" h={10}>
            <SentIcon size={18} />
            <Text pl={2} fontSize={12}>
              Run Batch
            </Text>
          </Button>
        )}
      </Box>

      {/* Batch Automation Modal */}
      {/* <BatchAutomationModal
        isOpen={isBatchAutomationOpen}
        onClose={() => setIsBatchAutomationOpen(false)}
      /> */}

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
export default BatchQAListView;
