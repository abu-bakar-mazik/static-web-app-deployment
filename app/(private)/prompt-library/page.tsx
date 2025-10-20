'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Text, VStack, HStack, Flex, Heading, Separator, Icon, Spinner, List, Tabs } from '@chakra-ui/react';
import { SearchDoc } from '@/components/docUpload/searchDoc/SearchDoc';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllPromptsQuery, useSavePromptMutation, useDeletePromptMutation, useDeleteAllPromptsMutation, useRemoveFromMyViewMutation, useSharePromptMutation, useDuplicatePromptMutation, selectEditingId, selectSearchQuery, addPrompt, setEditingId, setSearchQuery, updatePromptField, selectValidationError, validatePrompt, clearTemporaryPrompts, clearSearchQuery, addPromptField, removePromptField, validateSelectedPrompts, clearSelectedPrompts, savePreviousState, restorePreviousState, clearValidationError } from '@/redux/slices/promptsSlice';
import { RootState } from '@/redux/store';
import { useAuth } from '@/hooks/useAuth';
import { CheckmarkCircle01Icon, Delete02Icon, Edit02Icon, MultiplicationSignIcon, NoteAddIcon, TaskAdd02Icon, TickDouble04Icon, Share08Icon, Copy01Icon, ShareKnowledgeIcon } from 'hugeicons-react';
import _ from 'lodash';
import { Prompt } from '@/types/prompt-types';
import { ConfirmationDialog } from '@/components/confirmationDialog';
import { useEscapeKey } from '@/hooks/handleEscape';
import { useColorModeValue } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { FieldRoot } from '@/components/ui/field';
import { TextareaWithLocalState } from '@/components/MemoizedTextarea';
import { InputWithLocalState } from '@/components/MemoizedInput';
import { AppDispatch } from '@/redux/store';
import { useSharePrompt } from '@/hooks/useUsersList';
import { SharePromptModal } from '@/components/SharePromptModal';
type PromptField = keyof Prompt;
interface SharedPrompt extends Prompt {
  is_shared?: boolean;
  shared_with?: string[];
  shared_datetime?: string;
  shared_by?: string;
  permission_level?: string;
  is_owner?: boolean;
}
const PromptManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId, isAuthLoading: SessionLoading } = useAuth();
  const skipQuery = !userId;
  const [activeTab, setActiveTab] = useState<'my-prompts' | 'shared-with-me'>('my-prompts');
  const { data: myPrompts, isLoading: myPromptsLoading } = useGetAllPromptsQuery(userId || '', {
    skip: skipQuery,
  });
  const validationError = useSelector(selectValidationError);
  const [savePrompt] = useSavePromptMutation();
  const [deletePrompt] = useDeletePromptMutation();
  const [deleteAllPrompts, { isLoading: isDeletingAll }] = useDeleteAllPromptsMutation();
  const [removeFromMyView] = useRemoveFromMyViewMutation();
  const [sharePrompt] = useSharePromptMutation();
  const [duplicatePrompt] = useDuplicatePromptMutation();
  const { isModalOpen, openShareModal, closeShareModal, users, isLoadingUsers, selectedUsers, toggleUserSelection, selectAllUsers, clearSelection, currentPromptId } = useSharePrompt();
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const editingId = useSelector(selectEditingId);
  const searchQuery = useSelector(selectSearchQuery);
  const reduxPrompts = useSelector((state: RootState) => state.prompts.prompts);
  const [loadingPromptId, setLoadingPromptId] = useState<string | null>(null);
  const [duplicatingPromptId, setDuplicatingPromptId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [shareDialogPromptId, setShareDialogPromptId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasModifiedFields, setHasModifiedFields] = useState(false);
  const getFilteredOwnedPrompts = useCallback(() => {
    const serverPrompts = myPrompts || [];
    const temporaryPrompts = reduxPrompts?.filter((p: Prompt) => p.id.startsWith('temp')) || [];
    let filteredByTab: Prompt[] = [];
    if (activeTab === 'my-prompts') {
      let ownedPrompts;
      if (editingId && !editingId.startsWith('temp')) {
        ownedPrompts = serverPrompts
          .filter((prompt) => prompt.is_owner === true)
          .map((serverPrompt) => {
            const reduxPrompt = reduxPrompts.find((p) => p.id === serverPrompt.id);
            return reduxPrompt || serverPrompt;
          });
      } else {
        ownedPrompts = serverPrompts.filter((prompt) => prompt.is_owner === true);
      }
      const allPrompts = [...temporaryPrompts, ...ownedPrompts];
      filteredByTab = editingId ? allPrompts : allPrompts.filter((prompt) => !prompt.id.startsWith('temp'));
    } else {
      filteredByTab = serverPrompts.filter((prompt) => prompt.is_owner === false);
    }
    if (!searchQuery || searchQuery.trim() === '') {
      return filteredByTab;
    }
    return filteredByTab.filter((prompt) => {
      if (prompt.id === editingId) {
        return true;
      }
      const searchLower = searchQuery.toLowerCase();
      const titleLower = prompt.title.toLowerCase();
      const promptsLower = prompt.prompt.map((p) => p.toLowerCase());
      return titleLower.includes(searchLower) || promptsLower.some((p) => p.includes(searchLower));
    });
  }, [myPrompts, reduxPrompts, activeTab, editingId, searchQuery]);
  const currentPrompts = getFilteredOwnedPrompts();
  const isLoading = myPromptsLoading;
  const handleDuplicatePrompt = async (prompt: Prompt | SharedPrompt) => {
    try {
      setDuplicatingPromptId(prompt.id);
      const duplicateRequest = {
        source_prompt_id: prompt.id,
        new_title: `${prompt.title} (Copy)`,
        new_prompts: prompt.prompt,
      };
      await duplicatePrompt({
        userId: userId || '',
        duplicateRequest,
      }).unwrap();
      toaster.create({
        title: 'Prompt duplicated successfully.',
        description: 'The duplicated prompt has been added to your prompts.',
        type: 'success',
      });
    } catch (error: any) {
      toaster.create({
        title: 'Failed to duplicate prompt',
        description: error?.data?.error || 'Please try again',
        type: 'error',
      });
    } finally {
      setDuplicatingPromptId(null);
    }
  };
  const handleAddPrompt = () => {
    console.log('addPrompt');
    if (editingId && activeTab !== 'my-prompts') {
      return;
    }
    dispatch(addPrompt());
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  const handleAddPromptField = () => {
    console.log('addpromptfield');
    if (editingId) {
      const currentPrompt = currentPrompts.find((p: Prompt) => p.id === editingId);
      console.log('Current prompt before adding field:', currentPrompt);
      console.log('Current prompt fields count:', currentPrompt?.prompt.length);
      if (!hasModifiedFields) {
        dispatch(savePreviousState({ promptId: editingId }));
        setHasModifiedFields(true);
      }
      dispatch(addPromptField(editingId));
      setTimeout(() => {
        const updatedPrompt = currentPrompts.find((p: Prompt) => p.id === editingId);
        console.log('Updated prompt after adding field:', updatedPrompt);
        console.log('Updated prompt fields count:', updatedPrompt?.prompt.length);
        if (containerRef.current) {
          const promptElement = containerRef.current.querySelector(`[data-prompt-id="${editingId}"]`);
          console.log('Found prompt element:', promptElement);
          if (promptElement) {
            const textareas = promptElement.querySelectorAll('textarea');
            console.log('Total textareas found:', textareas.length);
            const lastTextarea = textareas[textareas.length - 1];
            if (lastTextarea) {
              lastTextarea.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              lastTextarea.focus();
            } else {
              console.log('No last textarea found');
            }
          } else {
            containerRef.current.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }
        } else {
          console.log('Container ref not available');
        }
      }, 100);
    } else {
      console.log('No editing ID found');
    }
  };
  const handleRemovePromptField = (index: number) => {
    if (editingId) {
      if (!hasModifiedFields) {
        dispatch(savePreviousState({ promptId: editingId }));
        setHasModifiedFields(true);
      }
      dispatch(removePromptField({ promptId: editingId, index }));
      dispatch(validateSelectedPrompts());
      setTimeout(() => {
        if (containerRef.current) {
          const promptElement = containerRef.current.querySelector(`[data-prompt-id="${editingId}"]`);
          if (promptElement) {
            promptElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }
      }, 50);
    }
  };
  const handleSavePrompt = async (prompt: Prompt) => {
    dispatch(
      validatePrompt({
        title: prompt.title,
        prompt: prompt.prompt,
      }),
    );
    const nonEmptyPrompts = prompt.prompt.filter((p) => p?.trim());
    if (!prompt.title?.trim() || nonEmptyPrompts.length === 0) {
      return;
    }
    try {
      setLoadingPromptId(prompt.id);
      const isNewPrompt = editingId?.startsWith('temp');
      await savePrompt({
        prompt: {
          ...prompt,
          prompt: nonEmptyPrompts,
        },
        userId: userId || '',
      }).unwrap();
      if (inputRef.current) {
        inputRef.current.value = '';
        dispatch(clearSearchQuery());
      }
      dispatch(setEditingId(null));
      setHasModifiedFields(false);
      toaster.create({
        title: isNewPrompt ? 'Prompt saved successfully.' : 'Prompt updated successfully.',
        type: 'success',
      });
    } catch (error) {
    } finally {
      setLoadingPromptId(null);
    }
  };
  const handleDeletePrompt = async (id: string) => {
    try {
      setLoadingPromptId(id);
      if (activeTab === 'my-prompts') {
        await deletePrompt({ id, userId: userId || '' }).unwrap();
      } else {
        await removeFromMyView({
          userId: userId || '',
          removeRequest: { prompt_id: id, action: 'hide' },
        }).unwrap();
      }
      dispatch(validateSelectedPrompts());
      toaster.create({
        title: activeTab === 'my-prompts' ? 'Prompt deleted successfully.' : 'Prompt removed from your view.',
        type: 'success',
      });
    } catch (error: any) {
      if (error?.data?.errorType === 'OWNER_RESTRICTION') {
        toaster.create({
          title: 'Cannot remove own prompt',
          description: 'You cannot hide prompts that you own. Use the "My Prompts" tab to delete it instead.',
          type: 'info',
        });
      } else {
        toaster.create({
          title: activeTab === 'my-prompts' ? 'Failed to delete prompt' : 'Failed to remove prompt',
          description: 'Please try again',
          type: 'error',
        });
      }
    } finally {
      setLoadingPromptId(null);
    }
  };
  const handleDeleteAll = async () => {
    if (activeTab !== 'my-prompts') return;
    try {
      await deleteAllPrompts(userId || '').unwrap();
      dispatch(clearSelectedPrompts());
      toaster.create({
        title: 'All prompts deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Failed to delete all prompts',
        description: 'Please try again',
        type: 'error',
      });
    }
  };
  const handleEditPrompt = (id: string) => {
    if (activeTab !== 'my-prompts') return;
    dispatch(setEditingId(id));
    setTimeout(() => {
      if (containerRef.current) {
        const promptElement = containerRef.current.querySelector(`[data-prompt-id="${id}"]`);
        if (promptElement) {
          promptElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else {
          containerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }
    }, 50);
  };
  const handleSharePrompt = async () => {
    if (!currentPromptId || selectedUsers.length === 0) return;
    try {
      setLoadingPromptId(currentPromptId);
      const response = await sharePrompt({
        userId: userId || '',
        shareRequest: {
          prompt_id: currentPromptId,
          shared_user_ids: selectedUsers,
          permission_level: 'read_only',
        },
      }).unwrap();
      if (response.status === 'success') {
        toaster.create({
          title: 'Prompt shared successfully',
          description: response.message,
          type: 'success',
        });
        closeShareModal();
      } else if (response.status === 'warning') {
        toaster.create({
          title: 'Already Shared',
          description: response.message,
          type: 'warning',
        });
      } else if (response.status === 'partial_success') {
        toaster.create({
          title: 'Partially Shared',
          description: response.message,
          type: 'info',
        });
        closeShareModal();
      } else if (response.status === 'info') {
        toaster.create({
          title: 'No Changes Made',
          description: response.message,
          type: 'info',
        });
      }
    } catch (error) {
      toaster.create({
        title: 'Failed to share prompt',
        description: 'Please try again',
        type: 'error',
      });
    } finally {
      setLoadingPromptId(null);
    }
  };
  const debouncedSearchHandler = useCallback(
    _.debounce((value: string) => {
      dispatch(setSearchQuery(value));
    }, 300),
    [dispatch],
  );
  const handleSearchChange = (value: string) => {
    debouncedSearchHandler(value);
  };
  useEffect(() => {
    return () => {
      dispatch(clearTemporaryPrompts());
      dispatch(clearSearchQuery());
    };
  }, [dispatch]);
  const handleCancel = (promptId: string) => {
    if (hasModifiedFields) {
      dispatch(restorePreviousState());
      setHasModifiedFields(false);
    }
    dispatch(setEditingId(null));
    if (promptId.startsWith('temp')) {
      dispatch(clearTemporaryPrompts());
    }
  };
  useEscapeKey(() => {
    if (editingId) {
      if (hasModifiedFields) {
        dispatch(restorePreviousState());
        setHasModifiedFields(false);
      }
      dispatch(clearValidationError());
      dispatch(setEditingId(null));
      if (editingId?.startsWith('temp')) {
        dispatch(clearTemporaryPrompts());
      }
    }
  }, [editingId, hasModifiedFields]);
  const handleCommittedChange = useCallback(
    (promptId: string, field: PromptField, index: number, newValue: string) => {
      if (!hasModifiedFields) {
        dispatch(savePreviousState({ promptId }));
        setHasModifiedFields(true);
      }
      const prompt = currentPrompts.find((p: Prompt) => p.id === promptId);
      if (prompt) {
        const newPrompt = [...prompt.prompt];
        newPrompt[index] = newValue;
        dispatch(
          updatePromptField({
            id: promptId,
            field,
            value: newPrompt,
          }),
        );
      }
    },
    [dispatch, currentPrompts, hasModifiedFields],
  );
  const handleCommittedInputChange = useCallback(
    (promptId: string, field: PromptField, newValue: string) => {
      if (!hasModifiedFields) {
        dispatch(savePreviousState({ promptId }));
        setHasModifiedFields(true);
      }
      dispatch(
        updatePromptField({
          id: promptId,
          field,
          value: newValue,
        }),
      );
    },
    [dispatch, hasModifiedFields],
  );
  return (
    <Box h="100%" w="100%">
      <Box display="flex" flexDir="column" height="100%">
        <HStack py={{ base: 2, lg: 3 }} px={4} flexDirection={{ base: 'column', sm: 'row', md: 'row' }} alignItems="center" w="100%">
          <Heading as="h1" fontSize={{ base: 16, xl: 18 }} fontWeight="700" mb={{ base: '0.5rem', sm: 0 }} display={{ base: 'none', sm: 'flex' }}>
            Prompt Library
          </Heading>
          <HStack ml="auto" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Heading as="h1" fontSize={{ base: 16, xl: 18 }} fontWeight="700" mb={{ base: 0 }} display={{ base: 'flex', sm: 'none' }}>
              Prompt Library
            </Heading>
            {activeTab === 'my-prompts' && (
              <>
                <Button ml="auto" visual="outline" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} minH={{ base: 30, sm: 50 }} fontWeight="medium" px={{ base: 3, sm: 5 }} onClick={handleAddPrompt} disabled={editingId || isLoading ? true : false}>
                  <Icon mr={{ base: 0, md: 1 }} w={18} h={18}>
                    <TaskAdd02Icon />
                  </Icon>
                  <Text ml={1} display={{ base: 'none', md: 'flex' }}>
                    Add New
                  </Text>
                </Button>
                <Button visual="outlineRed" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} fontWeight="medium" px={{ base: 3, sm: 5 }} onClick={() => setIsDeleteOpen(true)} minH={{ base: 30, sm: 50 }} _focusVisible={{ outline: 'none' }} disabled={editingId || isLoading ? true : false || isDeletingAll}>
                  {isDeletingAll ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Icon mr={{ base: 0, md: 1 }} w={18} h={18}>
                        <Delete02Icon />
                      </Icon>
                      <Text ml={1} display={{ base: 'none', md: 'flex' }}>
                        Delete All
                      </Text>
                    </>
                  )}
                </Button>
              </>
            )}
            <ConfirmationDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteAll} title="Delete All Prompts" description="Are you sure you want to delete? This action cannot be undone." confirmText="Confirm" variant="destructive" />
            <SearchDoc ref={inputRef} placeholder="Search Prompts" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} disabled={editingId || isLoading ? true : false} />
          </HStack>
        </HStack>
        <Separator my={0} borderColor={'#fdfdfd'} />
        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as 'my-prompts' | 'shared-with-me')} h="calc(100% - 75px)">
          <Tabs.List px={4} pt={3} pb={2}>
            <Tabs.Trigger value="my-prompts">My Prompts</Tabs.Trigger>
            <Tabs.Trigger value="shared-with-me">Shared with Me</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="my-prompts" h="calc(100% - 61px)" overflowY={'auto'}>
            <VStack gap={2} w="100%" p={4} ref={containerRef} borderTop="1px solid" borderTopColor="#e1e5ec">
              {currentPrompts.map((prompt) => (
                <Box key={prompt.id} w="100%" p={3} border="1px solid" filter={!editingId ? 'blur(0)' : editingId !== prompt.id ? 'blur(10px)' : 'blur(0)'} borderColor={'rgba(255,255,255,0.5)'} borderRadius="md" boxShadow="inset 0 0 2px #e1e5ec" position="relative" bg="#eef1f7" pointerEvents={!editingId ? 'auto' : editingId !== prompt.id ? 'none' : 'auto'} data-prompt-id={prompt.id}>
                  {editingId === prompt.id ? (
                    <HStack gap={2} align="stretch" flexDir={{ base: 'column', md: 'row' }} _before={{ content: `''`, position: 'absolute', left: 0, width: '4px', height: '100%', background: 'blue.400', top: 0, borderRadius: 'full' }}>
                      <VStack alignItems="flex-start" gap={0}>
                        <InputWithLocalState id={`my-prompts-title-${prompt.id}`} value={prompt.title} onChangeCommitted={(newValue) => handleCommittedInputChange(prompt.id, 'title', newValue)} hasError={validationError?.title} autoComplete="title" placeholder="Enter Title" width={{ base: '100%', md: '260px', lg: '248px' }} label="Title" />
                      </VStack>
                      <VStack alignItems="flex-start" w="100%" gap={2}>
                        <HStack gap={0}>
                          <Text display="flex" mr="0" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold" mb={0}>
                            Prompts
                          </Text>
                          <Tooltip closeOnScroll content="Add new field">
                            <Button bg="transparent" color="gray.400" _hover={{ bg: 'transparent', color: 'blue.600' }} p="0" h={'auto'} minW="initial" aria-label="Add Prompt Field" onClick={handleAddPromptField} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} ml={3}>
                              <NoteAddIcon size={20} />
                            </Button>
                          </Tooltip>
                        </HStack>
                        {prompt?.prompt?.map((promptText, index) => (
                          <Box key={`${prompt.id}-prompt-${index}`} pos="relative" w="100%" overflow={'hidden'} borderRadius="6px">
                            <TextareaWithLocalState value={promptText} onChangeCommitted={(newValue) => handleCommittedChange(prompt.id, 'prompt', index, newValue)} index={index} promptId={prompt.id} hasError={validationError?.prompt?.[index]} canDelete={prompt.prompt.length > 1} onDelete={handleRemovePromptField} disabled={loadingPromptId === prompt.id} />
                            {prompt.prompt.length > 1 && (
                              <Button pos="absolute" right="0" aria-label="Delete Prompt" justifyContent="center" visual="red" onClick={() => handleRemovePromptField(index)} minW="initial" w={8} h="100%" borderRadius={0} px={2} zIndex={1} top={0} disabled={loadingPromptId === prompt.id}>
                                <Delete02Icon style={{ width: 18, height: 18 }} />
                              </Button>
                            )}
                          </Box>
                        ))}
                      </VStack>
                      <HStack justifyContent="flex-end" position="absolute" right="1rem">
                        <Tooltip closeOnScroll content="Cancel">
                          <Button
                            visual="ghost"
                            _hover={{ bg: 'transparent', color: 'red.500' }}
                            p="0"
                            h={'auto'}
                            minW="initial"
                            aria-label="Cancel"
                            onClick={() => {
                              handleCancel(prompt.id);
                            }}
                            _focus={{ bg: 'transparent', color: 'red.500' }}
                            _focusVisible={{ outline: 'none', color: 'red.500' }}
                            disabled={loadingPromptId === prompt.id}
                            mr={2}
                          >
                            <MultiplicationSignIcon style={{ width: 20, height: 20 }} />
                          </Button>
                        </Tooltip>
                        <Tooltip closeOnScroll content="Save prompt">
                          <Button bg="transparent" color="gray.400" _hover={{ bg: 'transparent', color: 'blue.600' }} p="0" h={'auto'} minW="initial" aria-label="Save" onClick={() => handleSavePrompt(prompt)} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingPromptId === prompt.id}>
                            {loadingPromptId === prompt.id ? <Spinner size="sm" /> : <TickDouble04Icon style={{ width: 20, height: 20 }} />}
                          </Button>
                        </Tooltip>
                      </HStack>
                    </HStack>
                  ) : (
                    <HStack gap={2} align="stretch" flexDir={{ base: 'column', md: 'row' }}>
                      <InputWithLocalState id={`my-prompts-title-${prompt.id}`} value={prompt.title} onChangeCommitted={(newValue) => handleCommittedInputChange(prompt.id, 'title', newValue)} autoComplete="title" placeholder="Enter Title" width={{ base: '100%', md: '260px', lg: '248px' }} label="Title" readOnly />
                      <Flex direction="column" mb="0" w="100%">
                        <Text display="flex" ms="10px" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold" mb={1}>
                          Prompts
                        </Text>
                        <List.Root ml={2} gap={2}>
                          {prompt?.prompt?.map((promptText, index) => (
                            <List.Item key={`${prompt.id}-prompt-${promptText.substring(0, 10)}-${index}`} display="flex" alignItems="center">
                              <CheckmarkCircle01Icon style={{ color: 'green', marginRight: 8, minWidth: 18, maxWidth: 18, height: 18 }} />
                              <Text fontSize={{ base: '13px', sm: 'sm' }}>{promptText}</Text>
                            </List.Item>
                          ))}
                        </List.Root>
                      </Flex>
                      <HStack justifyContent="flex-end" position="absolute" right="1rem">
                        <Tooltip closeOnScroll content="Share prompt">
                          <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} color="gray.400" _hover={{ color: 'blue.600' }} p="0" h={'auto'} minW="initial" mr={3} aria-label="Share" onClick={() => openShareModal(prompt.id)} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingPromptId === prompt.id}>
                            <Share08Icon style={{ width: 18, height: 18 }} />
                          </Button>
                        </Tooltip>
                        <Tooltip closeOnScroll content="Delete prompt">
                          <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} color="gray.400" _hover={{ color: 'red.600' }} p="0" h={'auto'} minW="initial" mr={3} aria-label="Delete" onClick={() => handleDeletePrompt(prompt.id)} _focus={{ bg: 'transparent', color: 'red.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingPromptId === prompt.id}>
                            <Delete02Icon style={{ width: 18, height: 18 }} />
                          </Button>
                        </Tooltip>
                        <Tooltip closeOnScroll content="Edit prompt">
                          <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} bg="transparent" color="gray.400" _hover={{ bg: 'transparent', color: 'blue.600' }} p="0" h={'auto'} minW="initial" aria-label="Edit" onClick={() => handleEditPrompt(prompt.id)} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingPromptId === prompt.id}>
                            <Edit02Icon style={{ width: 16, height: 16 }} />
                          </Button>
                        </Tooltip>
                      </HStack>
                    </HStack>
                  )}
                </Box>
              ))}
            </VStack>
          </Tabs.Content>
          <Tabs.Content value="shared-with-me" h="calc(100% - 61px)" overflowY={'auto'}>
            <VStack gap={2} w="100%" p={4} borderTop="1px solid" borderTopColor="#e1e5ec">
              {currentPrompts.map((prompt) => (
                <Box key={prompt.id} w="100%" p={3} border="1px solid" borderColor={'rgba(255,255,255,0.5)'} borderRadius="md" boxShadow="inset 0 0 2px #e1e5ec" position="relative" bg="#eef1f7" data-prompt-id={prompt.id}>
                  <HStack gap={2} align="stretch" flexDir={{ base: 'column', md: 'row' }}>
                    <InputWithLocalState id={`shared-with-me-title-${prompt.id}`} value={prompt.title} onChangeCommitted={() => {}} autoComplete="title" placeholder="Enter Title" width={{ base: '100%', md: '260px', lg: '248px' }} label="Title" readOnly />
                    <Flex direction="column" mb="0" w="100%">
                      <HStack justify="space-between" align="center" mb={1}>
                        <Text display="flex" ms="10px" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold">
                          Prompts
                          {(prompt as SharedPrompt).shared_by && (
                            <>
                              <Text as={'span'} display={'flex'} fontSize="xs" color="gray.500" fontWeight={'normal'} ml={4}>
                                <ShareKnowledgeIcon size={18} color="#3182CE" style={{ marginRight: 8 }} /> {(prompt as SharedPrompt).shared_by}
                              </Text>
                            </>
                          )}
                        </Text>
                      </HStack>
                      <List.Root ml={2} gap={2}>
                        {prompt?.prompt?.map((promptText, index) => (
                          <List.Item key={`${prompt.id}-prompt-${promptText.substring(0, 10)}-${index}`} display="flex" alignItems="center">
                            <CheckmarkCircle01Icon style={{ color: 'green', marginRight: 8, minWidth: 18, maxWidth: 18, height: 18 }} />
                            <Text fontSize={{ base: '13px', sm: 'sm' }}>{promptText}</Text>
                          </List.Item>
                        ))}
                      </List.Root>
                    </Flex>
                    <HStack justifyContent="flex-end" position="absolute" right="1rem">
                      <Tooltip closeOnScroll content="Duplicate prompt">
                        <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} color="gray.400" _hover={{ color: 'blue.600' }} p="0" h={'auto'} minW="initial" mr={3} aria-label="Duplicate" onClick={() => handleDuplicatePrompt(prompt)} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} disabled={duplicatingPromptId === prompt.id}>
                          {duplicatingPromptId === prompt.id ? <Spinner size="sm" /> : <Copy01Icon style={{ width: 18, height: 18 }} />}
                        </Button>
                      </Tooltip>
                      <Tooltip closeOnScroll content="Remove from my view">
                        <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} color="gray.400" _hover={{ color: 'red.600' }} p="0" h={'auto'} minW="initial" mr={3} aria-label="Remove" onClick={() => handleDeletePrompt(prompt.id)} _focus={{ bg: 'transparent', color: 'red.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingPromptId === prompt.id}>
                          <Delete02Icon style={{ width: 18, height: 18 }} />
                        </Button>
                      </Tooltip>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Tabs.Content>
          <SharePromptModal isOpen={isModalOpen} onClose={closeShareModal} users={users} isLoadingUsers={isLoadingUsers} selectedUsers={selectedUsers} onToggleUser={toggleUserSelection} onSelectAll={selectAllUsers} onClearSelection={clearSelection} onShare={handleSharePrompt} isSharing={loadingPromptId === currentPromptId} />
        </Tabs.Root>
      </Box>
    </Box>
  );
};
export default PromptManager;
