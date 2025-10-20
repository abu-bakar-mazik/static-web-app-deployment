'use client';
import React, { useState, useEffect, memo } from 'react';
import { Box, Text, VStack, HStack, createListCollection, Spinner, Icon } from '@chakra-ui/react';
import { DrawerRoot, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerCloseTrigger, DrawerBackdrop } from '@/components/ui/drawer';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '@/components/ui/select';
import { AccordionRoot, AccordionItem, AccordionItemTrigger, AccordionItemContent } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { FieldRoot } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { useColorModeValue } from '@/components/ui/color-mode';
import { AlgorithmIcon, FoldersIcon, Share08Icon, LayersLogoIcon, Copy01Icon, Cancel01Icon, Copy02Icon } from 'hugeicons-react';
import { useAuth } from '@/hooks/useAuth';
import { useGetFileShareFoldersQuery } from '@/redux/slices/fileShareFoldersSlice';
import { useGetAllPromptsQuery } from '@/redux/slices/promptsSlice';
import type { BatchAutomationJob, BatchCategories, ProcessType, SelectedPrompt } from '@/types/batch-automation-types';
import type { Prompt } from '@/types/prompt-types';
import { useGetAllCategoriesQuery } from '@/redux/slices/categoriesSlice';
import HierarchicalFolderBrowser from '@/components/HierarchicalFolderBrowse';
import { useBatchAutomation } from '@/context/BatchAutomationContext';
import { InputRoot } from './ui/input';
import { InputWithLocalState } from './MemoizedInput';
interface BatchAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloneBatchData?: any | null;
  setCloneBatchData: (data: any | null) => void;
}
interface PromptIdentifier {
  promptId: string;
  promptIndex: number;
  promptText: string;
  promptName: string;
}
const BatchAutomationModal: React.FC<BatchAutomationModalProps> = ({ isOpen, onClose, cloneBatchData, setCloneBatchData }) => {
  const { userId } = useAuth();
  const isCloneMode = !!cloneBatchData;
  const [jobTitle, setJobTitle] = useState<string>('');
  const [selectedFolderPath, setSelectedFolderPath] = useState<string[]>(['']);
  const [processingType, setProcessingType] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPromptIdentifiers, setSelectedPromptIdentifiers] = useState<PromptIdentifier[]>([]);
  const MemoizedFolderBrowser = memo(HierarchicalFolderBrowser);
  // const [recurringBatchSize, setRecurringBatchSize] = useState<number>(30);
  // const [batchCategories, setBatchCategories] = useState<BatchCategories[]>([]);
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const { createBatchJob, cloneBatchJob, isProcessing, loadingBatchId } = useBatchAutomation();
  const isCloning = isCloneMode && loadingBatchId === cloneBatchData?.batchId;
  const { data: categories = [] } = useGetAllCategoriesQuery(userId || '', { skip: !userId });
  const { data: foldersData, isLoading: isFoldersLoading } = useGetFileShareFoldersQuery({ userId: userId || '' }, { skip: !userId || !isOpen || isCloneMode });
  const { data: promptsData, isLoading: isPromptsLoading } = useGetAllPromptsQuery(userId || '', { skip: !userId });
  const processingTypeOptions = createListCollection({
    items: [
      { value: 'automation-categorization', label: 'Categorization Only', icon: LayersLogoIcon },
      { value: 'automation-fullanalysis', label: 'Full Analysis Only', icon: AlgorithmIcon },
      { value: 'automation-categorization-fullanalysis', label: 'Categorization & Full Analysis', icon: AlgorithmIcon },
    ],
  });
  const availableCategories = categories.filter((cat) => !selectedCategories.includes(cat.id));
  const categoriesCollection = createListCollection({
    items: availableCategories.map((cat) => ({
      value: cat.id,
      label: cat.category_name,
      rules: cat.rules,
    })),
  });
  // const batchCategoriesCollection = createListCollection({
  //   items: batchCategories.map((cat) => ({
  //     value: cat.id,
  //     label: `${cat.category_name}`,
  //   })),
  // });
  const prompts: Prompt[] =
    promptsData?.map((sharedPrompt: any) => ({
      id: sharedPrompt.id,
      title: sharedPrompt.title,
      prompt: Array.isArray(sharedPrompt.prompts?.[0]) ? sharedPrompt.prompts[0] : sharedPrompt.prompts || sharedPrompt.prompt || [],
      datetime: sharedPrompt.datetime || new Date().toISOString(),
      is_owner: sharedPrompt.is_owner,
      shared_by: sharedPrompt.shared_by,
    })) || [];
  const shouldShowCategories = processingType.length > 0 && (processingType[0] === 'automation-categorization' || processingType[0] === 'automation-categorization-fullanalysis');
  const shouldShowPrompts = processingType.length > 0 && (processingType[0] === 'automation-fullanalysis' || processingType[0] === 'automation-categorization-fullanalysis');
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderPath([cloneBatchData?.fileSharePath || '']);
      setProcessingType([]);
      setSelectedCategories([]);
      setSelectedPromptIdentifiers([]);
      setJobTitle('');
    }
  }, [isOpen, cloneBatchData]);
  useEffect(() => {
    if (!shouldShowPrompts) {
      setSelectedPromptIdentifiers([]);
    }
    if (!shouldShowCategories) {
      setSelectedCategories([]);
    }
  }, [shouldShowPrompts, shouldShowCategories]);
  const isSpecificPromptSelected = (promptId: string, promptIndex: number): boolean => {
    return selectedPromptIdentifiers.some((item) => item.promptId === promptId && item.promptIndex === promptIndex);
  };
  const handleCategorySelection = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    }
  };
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };
  const getPromptState = (prompt: Prompt) => {
    const validPrompts = prompt.prompt.filter((p) => p && p.trim());
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
      const { isSelected } = getPromptState(prompt);
      const validPrompts = prompt.prompt.filter((p) => p && p.trim());
      if (!isSelected) {
        const newIdentifiers = validPrompts.map((promptText, index) => ({
          promptId: prompt.id,
          promptIndex: index,
          promptText: promptText,
          promptName: prompt.title,
        }));
        setSelectedPromptIdentifiers((prev) => [...prev.filter((item) => item.promptId !== prompt.id), ...newIdentifiers]);
      } else {
        setSelectedPromptIdentifiers((prev) => prev.filter((item) => item.promptId !== prompt.id));
      }
    } else if (childIndex !== undefined) {
      const childPrompt = prompt.prompt[childIndex];
      const isSelected = isSpecificPromptSelected(prompt.id, childIndex);
      if (!isSelected) {
        setSelectedPromptIdentifiers((prev) => [
          ...prev,
          {
            promptId: prompt.id,
            promptIndex: childIndex,
            promptText: childPrompt,
            promptName: prompt.title,
          },
        ]);
      } else {
        setSelectedPromptIdentifiers((prev) => prev.filter((item) => !(item.promptId === prompt.id && item.promptIndex === childIndex)));
      }
    }
  };
  const handleCreateJob = async () => {
    const selectedPromptIds = shouldShowPrompts ? Array.from(new Set(selectedPromptIdentifiers.map((id) => id.promptId))) : [];
    const selectedCategoriesIds = shouldShowCategories ? selectedCategories : [];
    const showError = (description: string) => {
      toaster.create({
        title: 'Validation Error',
        description,
        type: 'error',
      });
    };
    if (!selectedFolderPath?.length || !selectedFolderPath[0]) {
      return showError('Please select a File location');
    }
    if (!jobTitle?.trim()) {
      return showError('Please enter a Job title');
    }
    if (processingType.length === 0) {
      return showError('Please select a Processing type');
    }
    const apiProcessingType = processingType[0] as ProcessType;
    const needsPrompts = apiProcessingType === 'automation-fullanalysis';
    if (needsPrompts && selectedPromptIds.length === 0) {
      return showError('Please select a prompt');
    }
    if (!userId) {
      return toaster.create({
        title: 'Authentication Required',
        description: 'Please log in and try again.',
        type: 'error',
      });
    }
    if (!apiProcessingType) {
      return toaster.create({
        title: 'Invalid Selection',
        description: 'Please select a valid processing type.',
        type: 'error',
      });
    }
    const selectedPrompts = shouldShowPrompts
      ? selectedPromptIdentifiers.map((identifier) => ({
          prompt_id: identifier.promptId,
          prompt_index: identifier.promptIndex,
          prompt_text: identifier.promptText,
          prompt_name: identifier.promptName,
        }))
      : [];
    const title = jobTitle;
    // Create job
    try {
      const fileLocation = selectedFolderPath[0];
      await createBatchJob(title, fileLocation, apiProcessingType, userId, selectedPrompts, selectedCategoriesIds);
      handleCancel();
    } catch (error) {
      console.error('Error creating batch automation job:', error);
      toaster.create({
        title: 'Error',
        description: `Error creating batch automation job: ${error}`,
        type: 'error',
      });
    }
  };
  const handleCloneJob = async () => {
    if (!cloneBatchData) return;
    const selectedPrompts = shouldShowPrompts
      ? selectedPromptIdentifiers.map((identifier) => ({
          prompt_id: identifier.promptId,
          prompt_index: identifier.promptIndex,
          prompt_text: identifier.promptText,
          prompt_name: identifier.promptName,
        }))
      : [];
    // const selectedCategoriesData = shouldShowCategories
    //   ? categories
    //       .filter((cat) => selectedCategories.includes(cat.id))
    //       .map((cat) => ({
    //         id: cat.id,
    //         category_name: cat.category_name,
    //         rules: cat.rules,
    //       }))
    //   : [];
    // const selectedPromptIds = shouldShowPrompts ? Array.from(new Set(selectedPromptIdentifiers.map((identifier) => identifier.promptId))) : [];
    const selectedCategoriesIds = shouldShowCategories ? selectedCategories : [];
    const title = jobTitle || cloneBatchData.batchTitle;
    console.log(title);
    const showError = (description: string) => {
      toaster.create({
        title: 'Validation Error',
        description,
        type: 'error',
      });
    };
    if (!title?.trim()) {
      return showError('Please enter a Job title');
    }
    if (processingType.length === 0) {
      return showError('Please select a Processing type');
    }
    const apiProcessingType = processingType[0] as ProcessType;
    const needsPrompts = shouldShowPrompts;
    if (needsPrompts && selectedPrompts.length === 0) {
      return showError('Please select a prompt');
    }
    try {
      await cloneBatchJob(title, cloneBatchData.batchId, processingType[0], selectedPrompts, selectedCategoriesIds);
      handleCancel();
    } catch (error: any) {
      console.log('Error cloning batch:', error);
      toaster.create({
        title: 'Error',
        description: `Error cloning batch: ${error}`,
        type: 'error',
      });
    }
  };
  const handleCancel = () => {
    setSelectedFolderPath(['']);
    setProcessingType([]);
    setSelectedCategories([]);
    setSelectedPromptIdentifiers([]);
    setJobTitle('');
    setCloneBatchData(null);
    // setRecurringBatchSize(30);
    // setBatchCategories([]);
    onClose();
  };
  useEffect(() => {
    if (isCloneMode && cloneBatchData) {
      setJobTitle(cloneBatchData.batchTitle || '');
    }
  }, [isCloneMode, cloneBatchData]);
  const selectedCategoryNames = categories.filter((cat) => selectedCategories.includes(cat.id)).map((cat) => ({ id: cat.id, name: cat.category_name }));
  return (
    <DrawerRoot open={isOpen} onOpenChange={({ open }) => !open && handleCancel()} placement="end" size="lg">
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <HStack>
            {isCloneMode ? <Copy01Icon size={24} /> : <AlgorithmIcon size={24} />}
            <DrawerTitle>{isCloneMode ? 'Clone Batch Job' : 'Create Bulk Automation Job'}</DrawerTitle>
          </HStack>
          <DrawerCloseTrigger />
        </DrawerHeader>
        <DrawerBody overflowY="auto" p={6}>
          <VStack gap={6} align="stretch">
            {/* Clone Info or Folder Browser */}
            {isCloneMode ? (
              <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="semibold" color={textColorPrimary} mb={2}>
                  Cloning from:
                </Text>
                <HStack>
                  <Icon color="blue.500">
                    <FoldersIcon size={18} />
                  </Icon>
                  <Text fontSize="sm" color="gray.700">
                    {cloneBatchData.fileSharePath}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600" mt={2}>
                  {cloneBatchData.totalFiles} files • Current type: {cloneBatchData.processType.replace(/_/g, ' ')}
                </Text>
              </Box>
            ) : (
              <FieldRoot label="File Location" required>
                <Box
                  w="100%"
                  maxH="320px"
                  overflowY="auto"
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor={borderColor}
                  css={{
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: '#3b82f6', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: '#2563eb' },
                  }}
                >
                  <MemoizedFolderBrowser folders={foldersData?.folders || []} selectedPath={selectedFolderPath[0]} onSelectPath={(path) => setSelectedFolderPath([path])} isLoading={isFoldersLoading} />
                </Box>
              </FieldRoot>
            )}
            {/* Processing Type */}
            <FieldRoot label="Batch Automation Title" required>
              <InputWithLocalState id="batch-job-title" value={jobTitle} onChangeCommitted={(value: string) => setJobTitle(value)} placeholder="Enter Batch Automation title" autoComplete="off" width="100%" bg="rgba(255, 255, 255, 0.5)" pl={3} />
            </FieldRoot>
            <FieldRoot label="Processing Type" required>
              <SelectRoot collection={processingTypeOptions} value={processingType} onValueChange={(details) => setProcessingType(details.value)} positioning={{ sameWidth: true }}>
                <SelectTrigger borderColor={borderColor}>
                  <SelectValueText placeholder={isCloneMode ? 'Select a different processing type...' : 'Select processing type...'} />
                </SelectTrigger>
                <SelectContent portalled={false}>
                  {processingTypeOptions.items.map((item) => (
                    <SelectItem key={item.value} item={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              {/* Informative messages based on selection */}
              {processingType.length > 0 && (
                <Box mt={2} p={3} borderRadius="md" bg="blue.50" border="1px solid" borderColor="blue.200">
                  {processingType[0] === 'automation-categorization' && (
                    <Text fontSize="xs" color="gray.700">
                      <Text as="span" fontWeight="semibold">
                        Categorization Only:
                      </Text>{' '}
                      Files will be automatically organized into categories based on your selected rules. No additional analysis will be performed.
                    </Text>
                  )}
                  {processingType[0] === 'automation-fullanalysis' && (
                    <Text fontSize="xs" color="gray.700">
                      <Text as="span" fontWeight="semibold">
                        Full Analysis Only:
                      </Text>{' '}
                      Files will be processed using your selected prompts for detailed analysis. No categorization will be applied.
                    </Text>
                  )}
                  {processingType[0] === 'automation-categorization-fullanalysis' && (
                    <Text fontSize="xs" color="gray.700">
                      <Text as="span" fontWeight="semibold">
                        Categorization & Full Analysis:
                      </Text>{' '}
                      Files will be both categorized and analyzed with prompts, providing comprehensive processing with both organization and insights.
                    </Text>
                  )}
                </Box>
              )}
              {isCloneMode && (
                <Text fontSize="xs" color="gray.600" mt={1}>
                  You must select a different processing type than the original batch
                </Text>
              )}
            </FieldRoot>
            {/* Categories Selection - Conditional */}
            {shouldShowCategories && (
              <>
                <FieldRoot label="Categories">
                  <SelectRoot
                    collection={categoriesCollection}
                    onValueChange={(details) => {
                      if (details.value && details.value.length > 0) {
                        handleCategorySelection(details.value[0]);
                      }
                    }}
                  >
                    <SelectTrigger borderColor={borderColor}>
                      <SelectValueText placeholder="Choose categories..." />
                    </SelectTrigger>
                    <SelectContent portalled={false}>
                      {categoriesCollection.items.map((category) => (
                        <SelectItem key={category.value} item={category}>
                          <VStack align="flex-start" gap={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {category.label}
                            </Text>
                          </VStack>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </FieldRoot>
                {selectedCategoryNames.length > 0 && (
                  <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                    <Text fontSize="sm" fontWeight="semibold" color={textColorPrimary} mb={3}>
                      Selected Categories ({selectedCategoryNames.length})
                    </Text>
                    <VStack gap={2} align="stretch">
                      {selectedCategoryNames.map((category) => (
                        <HStack key={category.id} justify="space-between" p={2} bg="white" borderRadius="sm" border="1px solid" borderColor="blue.200">
                          <Text fontSize="sm" fontWeight="medium">
                            {category.name}
                          </Text>
                          <Icon cursor="pointer" color="red.500" _hover={{ color: 'red.700' }} onClick={() => handleRemoveCategory(category.id)}>
                            <Cancel01Icon size={14} />
                          </Icon>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            )}
            {/* Prompts */}
            {shouldShowPrompts && (
              <FieldRoot label="Analysis Prompts">
                <Box border="1px solid" borderColor={borderColor} borderRadius="md" bg="rgba(233,238,248,0.5)" h="300px" overflowY="auto" w="100%">
                  {isPromptsLoading ? (
                    <Box p={4} textAlign="center">
                      <Spinner size="sm" />
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Loading prompts...
                      </Text>
                    </Box>
                  ) : prompts.length === 0 ? (
                    <Box p={4} textAlign="center">
                      <Text fontSize="sm" color="gray.500">
                        No prompts available
                      </Text>
                    </Box>
                  ) : (
                    <VStack w="100%" gap={2} p={3}>
                      {prompts.map((prt: Prompt, index) => {
                        const { isSelected, isIndeterminate } = getPromptState(prt);
                        return (
                          <AccordionRoot key={`prompt-${prt.id}-${index}`} w="100%" collapsible defaultValue={index === 0 ? [prt.title] : undefined}>
                            <AccordionItem value={prt.title} border="none" w="100%">
                              <HStack borderRadius="8px" bg="rgb(200,209,229,0.3)" px={2} h="40px" alignItems="center">
                                <HStack flex="1" gap={2}>
                                  <Box
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleTogglePrompt(prt, true);
                                    }}
                                    cursor="pointer"
                                  >
                                    <Checkbox checked={isSelected} indeterminate={isIndeterminate} pointerEvents="none" />
                                  </Box>
                                  <Text fontSize="sm" color="gray.600" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flex="1">
                                    {prt.title}
                                  </Text>
                                  {prt.is_owner === false && (
                                    <Tooltip content={`Shared by ${prt.shared_by || 'another user'}`}>
                                      <Icon as={Share08Icon} w={4} h={4} color="blue.500" />
                                    </Tooltip>
                                  )}
                                </HStack>
                                <AccordionItemTrigger h="40px" />
                              </HStack>
                              <AccordionItemContent w="100%" p={2} mt={2}>
                                <VStack gap={2} align="stretch">
                                  {prt.prompt.map((pmt, pind) => {
                                    if (!pmt.trim()) return null;
                                    return (
                                      <Box
                                        key={`${prt.id}-${pind}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleTogglePrompt(prt, false, pind);
                                        }}
                                        cursor="pointer"
                                        _hover={{ bg: 'blue.50', borderColor: 'blue.200' }}
                                        bg="white"
                                        p={3}
                                        borderRadius="8px"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        display="flex"
                                        alignItems="center"
                                      >
                                        <Checkbox checked={isSpecificPromptSelected(prt.id, pind)} pointerEvents="none" mr={3} />
                                        <Text fontSize="sm" color="gray.700" flex="1">
                                          {pmt}
                                        </Text>
                                      </Box>
                                    );
                                  })}
                                </VStack>
                              </AccordionItemContent>
                            </AccordionItem>
                          </AccordionRoot>
                        );
                      })}
                    </VStack>
                  )}
                </Box>
                {selectedPromptIdentifiers.length > 0 && (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    {selectedPromptIdentifiers.length} prompt{selectedPromptIdentifiers.length > 1 ? 's' : ''} selected
                  </Text>
                )}
              </FieldRoot>
            )}
          </VStack>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px">
          <HStack gap={3} w="100%" justifyContent="flex-end">
            <Button visual="outlineRed" onClick={handleCancel} disabled={isCloneMode ? isCloning : isProcessing}>
              Cancel
            </Button>
            <Button colorPalette="blue" onClick={isCloneMode ? handleCloneJob : handleCreateJob} loading={isCloneMode ? isCloning : isProcessing} loadingText={isCloneMode ? 'Cloning...' : 'Creating...'}>
              {isCloneMode ? 'Clone Batch' : 'Create Job'}
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};
export default BatchAutomationModal;
