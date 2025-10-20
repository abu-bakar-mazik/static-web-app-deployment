'use client';
import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Box p={4} h="100%" w="100%">
      <Box border="1px solid" borderColor="gray.200" borderRadius={8} mx="auto" h="100%">
        <Box overflowY="auto" my={2} h="calc(100% - 16px)" p={{ base: '12px', md: '12px' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
