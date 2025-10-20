'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Text, VStack, HStack, Flex, Heading, Separator, Icon, Spinner, createListCollection, Avatar } from '@chakra-ui/react';
import { SearchDoc } from '@/components/docUpload/searchDoc/SearchDoc';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllPromptsQuery } from '@/redux/slices/promptsSlice';
import { useGetAllCategoriesQuery, useSaveCategoryMutation, useDeleteCategoryMutation, useDeleteAllCategoriesMutation, selectFilteredCategories, selectEditingId, selectSearchQuery, addCategory, setEditingId, setSearchQuery, updateCategoryField, selectValidationError, validateCategory, clearTemporaryCategories, clearSearchQuery, clearValidationError, savePreviousState, restorePreviousState } from '@/redux/slices/categoriesSlice';
import { useAuth } from '@/hooks/useAuth';
import { Delete02Icon, Edit02Icon, MultiplicationSignIcon, TaskAdd02Icon, TickDouble04Icon, FoldersIcon, Tag02Icon, Share08Icon, Link06Icon } from 'hugeicons-react';
import _ from 'lodash';
import { Category } from '@/types/category-types';
import { ConfirmationDialog } from '@/components/confirmationDialog';
import { useEscapeKey } from '@/hooks/handleEscape';
import { useColorModeValue } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { InputWithLocalState } from '@/components/MemoizedInput';
import { TextareaWithLocalState } from '@/components/MemoizedTextarea';
import { AppDispatch } from '@/redux/store';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from '@/components/ui/select';
type CategoryField = keyof Category;
const CategoryManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId, isAuthLoading: SessionLoading } = useAuth();
  const skipQuery = !userId;
  const { data: prompts } = useGetAllPromptsQuery(userId || '', {
    skip: skipQuery,
  });
  const { data: categories, isLoading: categoriesLoading } = useGetAllCategoriesQuery(userId || '', {
    skip: skipQuery,
  });
  const validationError = useSelector(selectValidationError);
  const [saveCategory] = useSaveCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteAllCategories, { isLoading: isDeletingAll }] = useDeleteAllCategoriesMutation();
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const filteredCategories = useSelector(selectFilteredCategories);
  const editingId = useSelector(selectEditingId);
  const searchQuery = useSelector(selectSearchQuery);
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasModifiedFields, setHasModifiedFields] = useState(false);
  const handleAddCategory = () => {
    if (editingId) {
      return;
    }
    dispatch(addCategory());
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  const handleSaveCategory = async (category: Category) => {
    const categoryId = category.id;
    dispatch(
      validateCategory({
        category_name: category.category_name,
        rules: category.rules,
      }),
    );
    if (!category.category_name?.trim() || !category.rules?.trim()) {
      return;
    }
    try {
      setLoadingCategoryId(category.id);
      const isNewCategory = editingId?.startsWith('temp');
      const categoryData = isNewCategory
        ? {
            category_name: category.category_name,
            rules: category.rules,
            mapped_prompts: category.mapped_prompts?.map((mp) => mp.id) || [],
          }
        : {
            category_id: category.id,
            category_name: category.category_name,
            rules: category.rules,
            mapped_prompts: category.mapped_prompts?.map((mp) => mp.id) || [],
          };
      await saveCategory({
        category: categoryData,
        userId: userId || '',
      }).unwrap();
      if (inputRef.current) {
        inputRef.current.value = '';
        dispatch(clearSearchQuery());
      }
      dispatch(setEditingId(null));
      setHasModifiedFields(false);
      toaster.create({
        title: isNewCategory ? 'Category saved successfully.' : 'Category updated successfully.',
        type: 'success',
      });
    } catch (error: any) {
      console.log('Failed to save category:', error);
      if (error?.data?.error === 'DUPLICATE_CATEGORY_NAME') {
        const { message, details } = error.data;
        toaster.create({
          title: 'Duplicate Category Name',
          description: message,
          type: 'warning',
          duration: 6000,
        });
        dispatch(setEditingId(null));
        if (categoryId.startsWith('temp')) {
          dispatch(clearTemporaryCategories());
        }
        return;
      }
      if (error?.data?.error === 'DUPLICATE_CATEGORY_RULES') {
        const { message, details } = error.data;
        toaster.create({
          title: 'Duplicate Category Rules',
          description: message,
          type: 'warning',
          duration: 6000,
        });
        dispatch(setEditingId(null));
        if (categoryId.startsWith('temp')) {
          dispatch(clearTemporaryCategories());
        }
        return;
      }
      if (error?.data?.error === 'CREATION_FAILED') {
        toaster.create({
          title: 'Save Failed',
          description: error.data.message || 'Failed to save category',
          type: 'error',
        });
        return;
      }
      if (error?.status === 'FETCH_ERROR' || !error?.data) {
        toaster.create({
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your connection and try again.',
          type: 'error',
        });
        return;
      }
      toaster.create({
        title: 'Failed to save category',
        description: error?.data?.message || 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setLoadingCategoryId(null);
    }
  };
  const handleDeleteCategory = async (id: string) => {
    const category = categories?.find((cat) => cat.id === id);
    if (category && userId !== category.user_id) {
      toaster.create({
        title: 'Access denied',
        description: 'You can only delete categories you created.',
        type: 'error',
      });
      return;
    }
    try {
      setLoadingCategoryId(id);
      await deleteCategory({ userId: userId || '', categoryId: id }).unwrap();
      toaster.create({
        title: 'Category deleted successfully.',
        type: 'success',
      });
    } catch (error: any) {
      if (error?.data?.error === 'CATEGORY_HAS_DOCUMENTS') {
        const { message, details } = error.data;
        toaster.create({
          title: 'Cannot Delete Category',
          description: message,
          type: 'warning',
          duration: 6000,
        });
        return;
      }
      if (error?.data?.error === 'DELETION_FAILED') {
        toaster.create({
          title: 'Deletion Failed',
          description: error.data.message || 'Failed to delete category',
          type: 'error',
        });
        return;
      }
      if (error?.status === 'FETCH_ERROR' || !error?.data) {
        toaster.create({
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your connection and try again.',
          type: 'error',
        });
        return;
      }
      toaster.create({
        title: 'Failed to delete category',
        description: error?.data?.message || 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setLoadingCategoryId(null);
    }
  };
  const handleDeleteAll = async () => {
    try {
      await deleteAllCategories(userId || '').unwrap();
      toaster.create({
        title: 'All categories deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Failed to delete all categories',
        description: 'Please try again',
        type: 'error',
      });
      console.log('Failed to delete all categories:', error);
    }
  };
  const handleEditCategory = (id: string) => {
    const category = categories?.find((cat) => cat.id === id);
    if (category && userId !== category.user_id) {
      toaster.create({
        title: 'Access denied',
        description: 'You can only edit categories you created.',
        type: 'error',
      });
      return;
    }
    dispatch(setEditingId(id));
    setTimeout(() => {
      if (containerRef.current) {
        const categoryElement = containerRef.current.querySelector(`[data-category-id="${id}"]`);
        if (categoryElement) {
          categoryElement.scrollIntoView({
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
      dispatch(clearTemporaryCategories());
      dispatch(clearSearchQuery());
    };
  }, [dispatch]);
  const handleCancel = (categoryId: string) => {
    if (hasModifiedFields) {
      dispatch(restorePreviousState());
      setHasModifiedFields(false);
    }
    dispatch(setEditingId(null));
    if (categoryId.startsWith('temp')) {
      dispatch(clearTemporaryCategories());
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
        dispatch(clearTemporaryCategories());
      }
    }
  }, [editingId, hasModifiedFields]);
  const handleCommittedInputChange = useCallback(
    (categoryId: string, field: CategoryField, newValue: string) => {
      if (!hasModifiedFields) {
        dispatch(savePreviousState({ categoryId }));
        setHasModifiedFields(true);
      }
      dispatch(
        updateCategoryField({
          id: categoryId,
          field,
          value: newValue,
        }),
      );
    },
    [dispatch, hasModifiedFields],
  );
  const handleAddMappedPrompt = (categoryId: string, prompt: any) => {
    if (!hasModifiedFields) {
      dispatch(savePreviousState({ categoryId }));
      setHasModifiedFields(true);
    }
    const category = filteredCategories.find((c) => c.id === categoryId);
    const currentMappedPrompts = category?.mapped_prompts || [];
    const alreadyMappedPrompts = !currentMappedPrompts.some((p) => p.id === prompt.id);
    if (alreadyMappedPrompts) {
      dispatch(
        updateCategoryField({
          id: categoryId,
          field: 'mapped_prompts',
          value: [...currentMappedPrompts, prompt],
        }),
      );
    }
  };
  const promptsCollection = createListCollection({
    items:
      prompts
        ?.filter((prompt) => {
          const currentCategory = filteredCategories.find((c) => c.id === editingId);
          const mappedPrompts = currentCategory?.mapped_prompts || [];
          return !mappedPrompts.some((p) => p.id === prompt.id);
        })
        .map((pmt) => ({
          ...pmt,
          value: pmt.id,
          label: pmt.is_owner === false ? `🔗 ${pmt.title} (shared by ${pmt.shared_by || 'another user'})` : pmt.title,
        })) || [],
  });
  return (
    <Box h="100%" w="100%">
      <Box display="flex" flexDir="column" height="100%">
        <HStack py={{ base: 2, lg: 3 }} px={4} flexDirection={{ base: 'column', sm: 'row', md: 'row' }} alignItems="center" w="100%">
          <Heading as="h1" display="flex" alignItems="center" fontSize={{ base: 16, xl: 18 }} fontWeight="700" mb={{ base: '0.5rem', sm: 0 }}>
            <FoldersIcon size={24} style={{ marginRight: 8 }} color="inherit" />
            Categories
          </Heading>
          <HStack ml="auto" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Button ml="auto" visual="outline" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} minH={{ base: 30, sm: 50 }} fontWeight="medium" px={{ base: 3, sm: 5 }} onClick={handleAddCategory} disabled={editingId || categoriesLoading ? true : false}>
              <Icon mr={{ base: 0, md: 1 }} w={18} h={18}>
                <TaskAdd02Icon />
              </Icon>
              <Text ml={1} display={{ base: 'none', md: 'flex' }}>
                Add New
              </Text>
            </Button>
            {/* <Button visual="outlineRed" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} fontWeight="medium" px={{ base: 3, sm: 5 }} onClick={() => setIsDeleteOpen(true)} minH={{ base: 30, sm: 50 }} _focusVisible={{ outline: 'none' }} disabled={editingId || categoriesLoading ? true : false || isDeletingAll}>
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
            </Button> */}
            <ConfirmationDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteAll} title="Delete All Categories" description="Are you sure you want to delete all categories? This action cannot be undone." confirmText="Confirm" variant="destructive" />
            <SearchDoc ref={inputRef} placeholder="Search Categories" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} disabled={editingId || categoriesLoading ? true : false} />
          </HStack>
        </HStack>
        <Separator my={0} borderColor={'#fdfdfd'} />
        <VStack gap={2} w="100%" p={4} h="calc(100% - 75px)" overflowY={'auto'} ref={containerRef} borderTop="1px solid" borderTopColor="#e1e5ec">
          {filteredCategories.map((category) => (
            <Box key={category.id} w="100%" p={3} border="1px solid" filter={!editingId ? 'blur(0)' : editingId !== category.id ? 'blur(10px)' : 'blur(0)'} borderColor={'rgba(255,255,255,0.5)'} borderRadius="md" boxShadow="inset 0 0 2px #e1e5ec" position="relative" bg="#eef1f7" pointerEvents={!editingId ? 'auto' : editingId !== category.id ? 'none' : 'auto'} data-category-id={category.id} zIndex={editingId === category.id ? 2 : ''}>
              {editingId === category.id ? (
                <VStack gap={3} align="stretch" _before={{ content: `''`, position: 'absolute', left: 0, width: '4px', height: '100%', background: 'blue.400', top: 0, borderRadius: 'full' }}>
                  <HStack gap={4} align="stretch" flexDir={{ base: 'column', md: 'row' }}>
                    <VStack alignItems="flex-start" gap={0}>
                      <InputWithLocalState id={`category-name-${category.id}`} value={category.category_name} onChangeCommitted={(newValue) => handleCommittedInputChange(category.id, 'category_name', newValue)} hasError={validationError?.category_name} autoComplete="category-name" placeholder="Enter Category Name" width={{ base: '100%', md: '260px', lg: '248px' }} label="Category Name" maxLength={60} />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {category.category_name?.length || 0}/60 characters
                      </Text>
                    </VStack>
                    <VStack alignItems="flex-start" w="100%" gap={0}>
                      <Text display="flex" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold" mb={1}>
                        Rules
                      </Text>
                      <TextareaWithLocalState
                        value={category.rules}
                        onChangeCommitted={(newValue) => handleCommittedInputChange(category.id, 'rules', newValue)}
                        hasError={validationError?.rules}
                        disabled={loadingCategoryId === category.id}
                        index={0}
                        promptId={''}
                        canDelete={false}
                        onDelete={function (index: number): void {
                          throw new Error('Function not implemented.');
                        }}
                      />
                    </VStack>
                  </HStack>
                  <VStack alignItems="flex-start" w="100%" gap={2}>
                    <Text display="flex" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold">
                      Mapped Prompts ({category.mapped_prompts?.length || 0})
                    </Text>
                    {/* Updated Chakra UI Select */}
                    <Box w="100%">
                      <SelectRoot
                        collection={promptsCollection}
                        onValueChange={(details) => {
                          const selectedValue = details.value[0];
                          if (selectedValue) {
                            const selectedPrompt = promptsCollection.items.find((item) => item.value === selectedValue);
                            handleAddMappedPrompt(category.id, selectedPrompt);
                          }
                        }}
                        size="md"
                      >
                        <SelectTrigger
                          w="300px"
                          borderColor={borderColor}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                          }}
                          background={'transparent'}
                          css={{ '& .chakra-select__trigger': { background: 'rgba(233,236,240,1)' } }}
                        >
                          <SelectValueText placeholder="Select a prompt to map" />
                        </SelectTrigger>
                        <SelectContent portalled={false} maxH="200px" overflowY="auto">
                          {promptsCollection.items.map((item) => (
                            <SelectItem key={item.value} item={item.value}>
                              <Text fontSize="sm" truncate>
                                {item.label}
                              </Text>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </Box>
                    {category.mapped_prompts && category.mapped_prompts.length > 0 ? (
                      <HStack wrap={'wrap'} gap={2} w="100%" bg="gray.50" p={2} borderRadius="md" maxH="150px" overflowY="auto">
                        {category.mapped_prompts.map((mappedPrompt, index) => {
                          const prompt = prompts?.find((p) => p.id === mappedPrompt.id);
                          return (
                            <Box key={index} px={2} py={1} bg="blue.100" borderRadius="md" fontSize="sm" display="flex" alignItems="center" justifyContent="space-between" minW={'150px'} maxW={'100%'}>
                              <HStack pr={1}>
                                <Tag02Icon size={14} />
                                <Text fontSize={'xs'}>{mappedPrompt.title}</Text>
                                {prompt?.is_owner === false && (
                                  <Tooltip content={`Shared by ${prompt.shared_by || 'another user'}`}>
                                    <Icon as={Share08Icon} w={3} h={3} color="blue.500" />
                                  </Tooltip>
                                )}
                              </HStack>
                              <Icon
                                as={MultiplicationSignIcon}
                                w={4}
                                h={4}
                                cursor="pointer"
                                _hover={{ color: 'blue.500' }}
                                _focus={{ color: 'blue.500' }}
                                onClick={() => {
                                  if (!hasModifiedFields) {
                                    dispatch(savePreviousState({ categoryId: category.id }));
                                    setHasModifiedFields(true);
                                  }
                                  dispatch(
                                    updateCategoryField({
                                      id: category.id,
                                      field: 'mapped_prompts',
                                      value: category.mapped_prompts?.filter((p) => p.id !== mappedPrompt.id) || [],
                                    }),
                                  );
                                }}
                              />
                            </Box>
                          );
                        })}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No prompts mapped
                      </Text>
                    )}
                  </VStack>
                  <HStack justifyContent="flex-end" position="absolute" right="1rem" top="1rem">
                    <Tooltip closeOnScroll content="Cancel">
                      <Button visual="ghost" _hover={{ bg: 'transparent', color: 'red.500' }} p="0" h={'auto'} minW="initial" aria-label="Cancel" onClick={() => handleCancel(category.id)} _focus={{ bg: 'transparent', color: 'red.500' }} _focusVisible={{ outline: 'none', color: 'red.500' }} disabled={loadingCategoryId === category.id} mr={2}>
                        <MultiplicationSignIcon style={{ width: 20, height: 20 }} />
                      </Button>
                    </Tooltip>
                    <Tooltip closeOnScroll content="Save category">
                      <Button bg="transparent" color="gray.400" _hover={{ bg: 'transparent', color: 'blue.600' }} p="0" h={'auto'} minW="initial" aria-label="Save" onClick={() => handleSaveCategory(category)} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingCategoryId === category.id}>
                        {loadingCategoryId === category.id ? <Spinner size="sm" /> : <TickDouble04Icon style={{ width: 20, height: 20 }} />}
                      </Button>
                    </Tooltip>
                  </HStack>
                </VStack>
              ) : (
                <VStack gap={3} align="stretch">
                  <HStack gap={4} align="stretch" flexDir={{ base: 'column', md: 'row' }}>
                    <VStack alignItems="flex-start" gap={0} minW="250px">
                      <Text display="flex" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold" mb={1}>
                        Category Name
                      </Text>
                      <Text fontSize={{ base: 'sm' }} color={'gray.600'} maxW={'250px'} lineClamp="2">
                        {category.category_name}
                      </Text>
                    </VStack>
                    <VStack alignItems="flex-start" w="100%" gap={0}>
                      <Text display="flex" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold" mb={1}>
                        Rules
                      </Text>
                      <Text fontSize={{ base: 'sm' }} color="gray.600" lineHeight="1.5">
                        {category.rules}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack alignItems="flex-start" w="100%" gap={0}>
                    <Text display="flex" fontSize={{ base: 'sm' }} color={textColorPrimary} fontWeight="semibold" mb={1}>
                      Mapped Prompts ({category.mapped_prompts?.length || 0})
                    </Text>
                    {category.mapped_prompts && category.mapped_prompts.length > 0 ? (
                      <Flex wrap="wrap" gap={2}>
                        {category.mapped_prompts.map((mappedPrompt, index) => {
                          const prompt = prompts?.find((p) => p.id === mappedPrompt.id);
                          return (
                            <Box key={index} px={2} py={1} bg="blue.100" borderRadius="md" fontSize="sm" display="flex" alignItems="center" gap={2}>
                              <Link06Icon size={16} />
                              <Text maxW={'100px'} truncate>
                                {prompt?.title || `${mappedPrompt.title}`}
                              </Text>
                              {prompt?.is_owner === false && (
                                <Tooltip content={`Shared by ${prompt.shared_by || 'another user'}`}>
                                  <Icon as={Share08Icon} w={3} h={3} color="blue.500" />
                                </Tooltip>
                              )}
                            </Box>
                          );
                        })}
                      </Flex>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No prompts mapped
                      </Text>
                    )}
                  </VStack>
                  <HStack justifyContent="flex-end" position="absolute" right="1rem" top="0.5rem">
                    <Tooltip closeOnScroll content={category.user_display_name}>
                      <Box>
                        <Avatar.Root variant={'solid'} w={'24px'} h={'24px'} mr={2} bg={'gradients.primary'}>
                          <Avatar.Fallback name={category.user_display_name} fontSize={'10px'} />
                        </Avatar.Root>
                      </Box>
                    </Tooltip>
                    {userId === category.user_id && (
                      <>
                        <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} color="gray.400" _hover={{ color: 'red.600' }} p="0" h={'auto'} minW="initial" mr={3} aria-label="Delete" onClick={() => handleDeleteCategory(category.id)} _focus={{ bg: 'transparent', color: 'red.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingCategoryId === category.id}>
                          <Delete02Icon style={{ width: 18, height: 18 }} />
                        </Button>
                        <Button visual="ghost" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} bg="transparent" color="gray.400" _hover={{ bg: 'transparent', color: 'blue.600' }} p="0" h={'auto'} minW="initial" aria-label="Edit" onClick={() => handleEditCategory(category.id)} _focus={{ bg: 'transparent', color: 'blue.600' }} _focusVisible={{ outline: 'none' }} disabled={loadingCategoryId === category.id}>
                          <Edit02Icon style={{ width: 16, height: 16 }} />
                        </Button>
                      </>
                    )}
                  </HStack>
                </VStack>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};
export default CategoryManager;
