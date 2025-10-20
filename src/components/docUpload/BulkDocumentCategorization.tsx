import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Flex, Icon, Spinner, createListCollection } from '@chakra-ui/react';
import { DrawerRoot, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerCloseTrigger, DrawerBackdrop } from '@/components/ui/drawer';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import { useGetAllCategoriesQuery } from '@/redux/slices/categoriesSlice';
import { useUpdateDocumentCategoriesMutation } from '@/redux/slices/fileUploadSlice';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types/category-types';
import { Tag02Icon, FoldersIcon, SparklesIcon, CheckmarkCircle01Icon, Cancel01Icon } from 'hugeicons-react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { BadgeRoot } from '@/components/ui/badge';
interface FileToCategorize {
  fileId: string;
  fileName: string;
  serverFileId?: string;
}
interface DocumentToCategorize {
  id: string;
  name: string;
  categories?: string[];
}
interface BulkDocumentCategorizationProps {
  isOpen: boolean;
  onClose: () => void;
  files?: FileToCategorize[];
  onCategorize?: (categorization: { selectedCategories: string[]; categorizeMode: 'manual' | 'auto' | 'skip' }) => void;
  documents?: DocumentToCategorize[];
  onCategorizeComplete?: () => void;
  mode?: 'upload' | 'update';
}
const BulkDocumentCategorization: React.FC<BulkDocumentCategorizationProps> = ({ isOpen, onClose, files = [], onCategorize, documents = [], onCategorizeComplete, mode = files.length > 0 ? 'upload' : 'update' }) => {
  const { userId } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorizeMode, setCategorizeMode] = useState<'manual' | 'auto'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategoriesQuery(userId || '', {
    skip: !userId,
  });
  const [updateDocumentCategories, { isLoading: isUpdating }] = useUpdateDocumentCategoriesMutation();
  const textColorPrimary = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const itemsToProcess = mode === 'upload' ? files : documents;
  const itemCount = itemsToProcess.length;
  useEffect(() => {
    if (isOpen) {
      setSelectedCategories([]);
      setCategorizeMode('manual');
      setIsProcessing(false);
    }
  }, [isOpen]);
  if (!itemCount) {
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
  const handleUpdateCategories = async () => {
    if (!userId || documents.length === 0) return;
    try {
      setIsProcessing(true);
      await updateDocumentCategories({
        file_ids: documents.map((doc) => doc.id),
        categorization_mode: categorizeMode,
        category_id: selectedCategories[0],
        userId,
      }).unwrap();
      toaster.create({
        title: 'Categories Updated',
        description: `Successfully updated categories for ${documents.length} document${documents.length !== 1 ? 's' : ''}`,
        type: 'success',
      });
      if (onCategorizeComplete) {
        onCategorizeComplete();
      }
      onClose();
    } catch (error: any) {
      console.log('Error updating categories:', error);
      toaster.create({
        title: 'Update Failed',
        description: error?.data?.message || 'Failed to update document categories',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleFinish = () => {
    if (mode === 'upload' && onCategorize) {
      onCategorize({
        selectedCategories,
        categorizeMode,
      });
      onClose();
    } else if (mode === 'update') {
      handleUpdateCategories();
    }
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
                Select Categories for All {mode === 'upload' ? 'Files' : 'Documents'}
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
                  These categories will be applied to all {itemCount} {mode === 'upload' ? 'file' : 'document'}
                  {itemCount !== 1 ? 's' : ''}.
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
              Our AI will automatically analyze and categorize all {itemCount} {mode === 'upload' ? 'document' : 'document'}
              {itemCount !== 1 ? 's' : ''} based on their content and your existing categories.
            </Text>
            {isProcessing ? (
              <VStack gap={2}>
                <Spinner size="md" color="blue.500" />
                <Text fontSize="xs" color="blue.600">
                  {mode === 'upload' ? 'Analyzing documents...' : 'Updating categories...'}
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
            {mode === 'upload' ? 'Categorize' : 'Update Categories for'} {itemCount} {mode === 'upload' ? 'Document' : 'Document'}
            {itemCount !== 1 ? 's' : ''}
          </DrawerTitle>
          <DrawerCloseTrigger />
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={5} align="stretch">
            {/* Items List */}
            <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="semibold" color={textColorPrimary} mb={3}>
                {mode === 'upload' ? 'Files to Upload' : 'Documents to Update'} ({itemCount}):
              </Text>
              <VStack gap={2} align="stretch" maxH="150px" overflowY="auto">
                {itemsToProcess.map((item, index) => (
                  <HStack key={mode === 'upload' ? (item as FileToCategorize).fileId : (item as DocumentToCategorize).id} justify="space-between" p={2} bg="white" borderRadius="sm">
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {index + 1}. {mode === 'upload' ? (item as FileToCategorize).fileName : (item as DocumentToCategorize).name}
                    </Text>
                    {mode === 'update' && (item as DocumentToCategorize).categories && (item as DocumentToCategorize).categories!.length > 0 && (
                      <HStack gap={1}>
                        {(item as DocumentToCategorize).categories!.slice(0, 2).map((cat, i) => (
                          <BadgeRoot key={i} colorPalette="gray" size="xs">
                            {cat}
                          </BadgeRoot>
                        ))}
                        {(item as DocumentToCategorize).categories!.length > 2 && (
                          <BadgeRoot colorPalette="gray" size="xs">
                            +{(item as DocumentToCategorize).categories!.length - 2}
                          </BadgeRoot>
                        )}
                      </HStack>
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>
            {/* Mode Selection Buttons - Only Manual and Auto, no Skip for updates */}
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
              {mode === 'upload' ? 'Upload All Files' : 'Update Categories'}
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};
export default BulkDocumentCategorization;
