'use client';
import React from 'react';
import { Box, Heading, Text, SimpleGrid, Spinner, AlertIndicator, AlertTitle } from '@chakra-ui/react';
import { useGetModelsQuery, useRemoveModelMutation } from '@/redux/slices/adminSlice';
import { Delete02Icon } from 'hugeicons-react';
import { Alert } from '@/components/ui/alert';
import { toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

type Model = string;

const ModelsList: React.FC = () => {
  const { data: models, isLoading, error } = useGetModelsQuery();
  const [removeModel] = useRemoveModelMutation();
  if (error) {
    return (
      <Box>
        <Alert status="error" mt={8} mb={4}>
          <AlertIndicator />
          <AlertTitle>{'message' in error ? error.message : 'Error loading models'}</AlertTitle>
        </Alert>
      </Box>
    );
  }
  return (
    <Box>
      <Heading as="h2" fontSize="18px" mb={6}>
        Available Models
      </Heading>
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Spinner />
        </div>
      ) : !models || models.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No models available</div>
      ) : (
        <SimpleGrid columns={3} gap={6}>
          {models.map((modelName: Model) => (
            <Box key={modelName} p={2} borderWidth="1px" borderRadius={8} boxShadow="sm" _hover={{ boxShadow: 'md' }} bg="rgba(255,255,255,0.3)" display="flex" justifyContent="space-between" alignItems="center">
              <Text textStyle="sm">{modelName}</Text>
              <Button
                visual="ghost"
                p={0}
                colorPalette="red"
                bg={'transparent'}
                _hover={{ bg: 'transparent', color: 'red.600' }}
                _focus={{ bg: 'transparent', color: 'red.600' }}
                _focusVisible={{ bg: 'transparent', color: 'red.600' }}
                color="gray.400"
                size="sm"
                onClick={async () => {
                  try {
                    await removeModel(modelName).unwrap();
                  } catch (error: any) {
                    toaster.create({
                      title: 'Error',
                      description: error.message,
                      type: 'error',
                    });
                  }
                }}
              >
                <Delete02Icon size={20} />
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};
export default ModelsList;
