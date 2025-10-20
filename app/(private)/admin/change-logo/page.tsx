'use client';
import React, { useRef, useState } from 'react';
import { Box, Image, VStack, Text, Icon, Input, HStack, Progress } from '@chakra-ui/react';
import { FileUploadIcon } from 'hugeicons-react';
import { useLogo } from '@/hooks/logoQuery';
import { useUploadLogoMutation } from '@/redux/slices/adminSlice';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
const ChangeLogo = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { logoWithCache } = useLogo();
  const [uploadLogo, { isLoading: uploading }] = useUploadLogoMutation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };
  const handleFileUpload = async () => {
    if (!logo) {
      toaster.create({
        title: 'No file selected.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }
    const formData = new FormData();
    formData.append('file', logo);
    try {
      await uploadLogo(formData).unwrap();
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
      toaster.create({
        title: 'Logo uploaded successfully.',
        type: 'success',
        duration: 3000,
      });
      setLogo(null);
    } catch (error) {
      console.log('Upload error:', error);
      toaster.create({
        title: 'Failed to upload the logo.',
        description: 'Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };
  return (
    <Box w="100%">
      <VStack gap={4} align="flex-start">
        <HStack w="100%" gap={4} align="flex-start">
          <VStack w="100%" align="flex-start">
            <Box
              minW="100%"
              w="100%"
              p="3"
              border="1px dashed"
              borderColor="blue.400"
              borderRadius="6px"
              textAlign="center"
              minH="150px"
              h="150px"
              bg="blue.50"
              onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
              cursor="pointer"
            >
              <VStack justify="center" align="center" h="100%">
                <Icon as={FileUploadIcon} w={8} h={8} color="blue.400" />
                <Text fontSize="sm" ml="2" color="blue.400">
                  Upload File or Drag and Drop
                </Text>
              </VStack>
              <Input ref={logoInputRef} type="file" accept="image/*" onChange={handleFileSelect} display="none" />
            </Box>
            {logo && (
              <Text fontSize="sm" mt={2} color="gray.600" display="flex">
                <Text as="span" fontWeight="bold" mr={2}>
                  Selected file:
                </Text>
                {logo.name}
              </Text>
            )}
          </VStack>
          {logoWithCache && (
            <Box textAlign="center" p={2} border="1px solid" borderColor="gray.200" boxSize="150px" borderRadius="8px" display="flex">
              <Image
                src={logoWithCache}
                alt="Current Logo"
                objectFit="contain"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = '/img/logo.png';
                }}
              />
            </Box>
          )}
        </HStack>
        {uploading && (
          <VStack gap="2" mb="4" w="100%" maxW="250px">
            <Box w="100%" p="4" borderRadius="6px" backgroundColor="#F5F5F5">
              <HStack justify="space-between">
                <Text fontSize="12px">{logo?.name}</Text>
              </HStack>
              <Progress.Root value={progress} size="xs" colorPalette="blue" w="100%" mt="10px" />
            </Box>
          </VStack>
        )}
        <Button onClick={handleFileUpload} disabled={!logo || uploading} bg="blue.400" color="white" fontSize="sm" borderRadius="full" minH="40px">
          {uploading ? 'Uploading...' : 'Upload Logo'}
        </Button>
      </VStack>
    </Box>
  );
};
export default ChangeLogo;
