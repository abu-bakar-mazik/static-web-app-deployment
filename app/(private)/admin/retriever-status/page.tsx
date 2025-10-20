'use client';
import React, { useState } from 'react';
import { Box, Text, HStack, createListCollection, VStack } from '@chakra-ui/react';
import { useUpdateRetrieverStatusMutation } from '@/redux/slices/adminSlice';
import { toaster } from '@/components/ui/toaster';
import { FieldRoot } from '@/components/ui/field';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const SetRetrieverStatus: React.FC = () => {
  const [status, setStatus] = useState<string[]>(['langchain']);
  const [updateStatus, { isLoading, error }] = useUpdateRetrieverStatusMutation();

  const handleUpdateStatus = async () => {
    try {
      const response = await updateStatus(status[0]).unwrap();
      toaster.create({
        title: 'Success',
        description: response.message,
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        type: 'error',
      });
    }
  };
  const retrieverOptions = createListCollection({
    items: [
      { value: 'langchain', label: 'Lang Chain' },
      { value: 'azureopenai', label: 'Azure Open AI' },
    ],
  });
  return (
    <Box w="100%">
      <VStack gap={4} w="100%" alignItems="flex-start">
        {/* <FieldRoot required>
          <Text fontWeight="bold" fontSize="sm">
            Status
          </Text>
          <SelectRoot value={status} fontSize="14px" borderRadius={8} onChange={(e) => setStatus(e.target.value)}>
            <option value="langchain">Lang Chain</option>
            <option value="azureopenai">Azure Open AI</option>
          </SelectRoot>
        </FieldRoot> */}
        <FieldRoot required label="Status">
          <SelectRoot
            collection={retrieverOptions}
            defaultValue={status}
            onValueChange={(details) => {
              setStatus(details.value);
            }}
          >
            <SelectTrigger>
              <SelectValueText 
                placeholder={
                  status 
                    ? retrieverOptions.items.find((item) => item.value === status[0])?.label 
                    : 'Select Status'
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {retrieverOptions.items.map((option) => (
                <SelectItem key={option.value} item={option}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </FieldRoot>
        {error && (
          <Text color="red.500" mt={4}>
            Failed to Update the Retriever Status
          </Text>
        )}
        <Button colorPalette="blue" onClick={handleUpdateStatus} loading={isLoading} loadingText="Updating..." fontWeight="normal" fontSize="sm" maxW="200px">
          Update Status
        </Button>
      </VStack>
    </Box>
  );
};
export default SetRetrieverStatus;
