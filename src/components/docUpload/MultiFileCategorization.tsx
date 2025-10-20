'use client';
import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Flex, Icon, Spinner, createListCollection } from '@chakra-ui/react';
import { DrawerRoot, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerCloseTrigger, DrawerBackdrop } from '@/components/ui/drawer';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import { useGetAllCategoriesQuery } from '@/redux/slices/categoriesSlice';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types/category-types';
import { Tag02Icon, FoldersIcon, SparklesIcon, Forward01Icon, CheckmarkCircle01Icon, Cancel01Icon } from 'hugeicons-react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { BadgeRoot } from '@/components/ui/badge';
interface FileToCategorize {
  fileId: string;
  fileName: string;
  serverFileId?: string;
}
interface MultiFileCategorizationProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileToCategorize[];
  onCategorize: (categorization: { selectedCategories: string[]; categorizeMode: 'manual' | 'auto' | 'skip' }) => void;
}
const MultiFileCategorization: React.FC<MultiFileCategorizationProps> = ({ isOpen, onClose, files, onCategorize }) => {
  const { userId } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorizeMode, setCategorizeMode] = useState<'manual' | 'auto' | 'skip'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery(userId || '', {
    skip: !userId,
  });
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  useEffect(() => {
    if (isOpen) {
      setSelectedCategories([]);
      setCategorizeMode('manual');
      setIsProcessing(false);
    }
  }, [isOpen]);
  if (!files.length) {
    return null;
  }
  const availableCategories = categories.filter((cat) => !selectedCategories.includes(cat.id));
  const categoriesCollection = createListCollection({
    items: availableCategories.map((cat) => ({
      value: cat.id,
      label: cat.category_name,
      rules: cat.rules,
    })),
  });
  const handleCategorySelection = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    }
  };
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };
  const handleFinish = () => {
    onCategorize({
      selectedCategories,
      categorizeMode,
    });
    onClose();
  };
  const selectedCategoryNames = categories.filter((cat) => selectedCategories.includes(cat.id)).map((cat) => ({ id: cat.id, name: cat.category_name }));
  const renderModeContent = () => {
    switch (categorizeMode) {
      case 'manual':
        return (
          <VStack gap={4} align="stretch">
            {/* Category Dropdown */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColorPrimary} mb={2}>
                Select Categories for All Files
              </Text>
              {categoriesLoading ? (
                <Box textAlign="center" py={4}>
                  <Spinner size="md" />
                  <Text mt={2} fontSize="sm" color="gray.500">
                    Loading categories...
                  </Text>
                </Box>
              ) : categories.length === 0 ? (
                <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    No categories available. Create categories first to categorize documents.
                  </Text>
                </Box>
              ) : (
                <SelectRoot
                  collection={categoriesCollection}
                  onValueChange={(details) => {
                    if (details.value && details.value.length > 0) {
                      handleCategorySelection(details.value[0]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValueText placeholder="Choose categories..." />
                  </SelectTrigger>
                  <SelectContent portalled={false}>
                    {categoriesCollection.items.map((category) => (
                      <SelectItem key={category.value} item={category}>
                        <VStack align="flex-start" gap={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {category.label}
                          </Text>
                          {category.rules && (
                            <Text fontSize="xs" color="gray.600" lineHeight="1.2">
                              {category.rules}
                            </Text>
                          )}
                        </VStack>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            </Box>
            {/* Selected Categories */}
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
                <Text fontSize="xs" color="blue.600" mt={2}>
                  These categories will be applied to all {files.length} file{files.length !== 1 ? 's' : ''}.
                </Text>
              </Box>
            )}
          </VStack>
        );
      case 'auto':
        return (
          <Box p={6} bg="gradient-to-br from-blue.50 to-purple.50" borderRadius="lg" textAlign="center">
            <Icon color="blue.500" mb={3}>
              <SparklesIcon size={32} />
            </Icon>
            <Text fontSize="lg" fontWeight="semibold" color={textColorPrimary} mb={2}>
              Auto-Categorization
            </Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Our AI will automatically analyze and categorize all {files.length} document{files.length !== 1 ? 's' : ''} based on their content and your existing categories.
            </Text>
            {isProcessing ? (
              <VStack gap={2}>
                <Spinner size="md" color="blue.500" />
                <Text fontSize="xs" color="blue.600">
                  Analyzing documents...
                </Text>
              </VStack>
            ) : (
              <BadgeRoot colorPalette="blue" size="lg">
                <SparklesIcon size={14} style={{ marginRight: 6 }} />
                Ready for AI Categorization
              </BadgeRoot>
            )}
          </Box>
        );
      case 'skip':
        return (
          <Box p={6} bg="gray.50" borderRadius="lg" textAlign="center">
            <Icon color="gray.500" mb={3}>
              <Forward01Icon size={32} />
            </Icon>
            <Text fontSize="lg" fontWeight="semibold" color={textColorPrimary} mb={2}>
              Skip Categorization
            </Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              All {files.length} document{files.length !== 1 ? 's' : ''} will be uploaded without categories. You can categorize them later from the documents list.
            </Text>
            <BadgeRoot colorPalette="gray" size="lg">
              <Forward01Icon size={14} style={{ marginRight: 6 }} />
              No Categorization
            </BadgeRoot>
          </Box>
        );
      default:
        return null;
    }
  };
  return (
    <DrawerRoot open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <DrawerBackdrop />
      <DrawerContent maxW="700px">
        <DrawerHeader>
          <DrawerTitle display="flex" alignItems="center">
            <FoldersIcon size={24} style={{ marginRight: 8 }} />
            Categorize {files.length} Document{files.length !== 1 ? 's' : ''}
          </DrawerTitle>
          <DrawerCloseTrigger />
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={5} align="stretch">
            {/* Files List */}
            <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="semibold" color={textColorPrimary} mb={3}>
                Files to Upload ({files.length}):
              </Text>
              <VStack gap={2} align="stretch" maxH="150px" overflowY="auto">
                {files.map((file, index) => (
                  <HStack key={file.fileId} justify="space-between" p={2} bg="white" borderRadius="sm">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {index + 1}. {file.fileName}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
            {/* Mode Selection Buttons */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColorPrimary} mb={3}>
                Choose Categorization Method:
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <Button visual={categorizeMode === 'manual' ? 'primary' : 'outline'} onClick={() => setCategorizeMode('manual')} size="md" disabled={isProcessing} flex="1" minW="140px">
                  <Tag02Icon size={18} style={{ marginRight: 6 }} />
                  Manual
                </Button>
                <Button visual={categorizeMode === 'auto' ? 'primary' : 'outline'} onClick={() => setCategorizeMode('auto')} size="md" disabled={isProcessing || categories.length === 0} flex="1" minW="140px">
                  <SparklesIcon size={18} style={{ marginRight: 6 }} />
                  Auto-Suggest
                </Button>
                <Button visual={categorizeMode === 'skip' ? 'primary' : 'outline'} onClick={() => setCategorizeMode('skip')} size="md" disabled={isProcessing} flex="1" minW="140px">
                  <Forward01Icon size={18} style={{ marginRight: 6 }} />
                  Skip
                </Button>
              </HStack>
            </Box>
            {/* Mode-specific Content */}
            {renderModeContent()}
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <HStack gap={3} w="100%">
            <Button visual="outline" onClick={onClose} disabled={isProcessing} flex="1">
              Cancel
            </Button>
            <Button visual="primary" onClick={handleFinish} disabled={isProcessing || (categorizeMode === 'manual' && selectedCategories.length === 0)} flex="2">
              <CheckmarkCircle01Icon size={16} style={{ marginRight: 6 }} />
              Upload All Files
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};
export default MultiFileCategorization;
