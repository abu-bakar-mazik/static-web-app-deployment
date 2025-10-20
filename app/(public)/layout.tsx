'use client';
import React, { ReactNode, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { PublicProvider } from '../providers/PublicProvider';
import '@/styles/App.css';
import { Toaster } from '@/components/ui/toaster';

export default function PublicLayout({ children }: { children: ReactNode }) {
  
  return (
    <PublicProvider>
      <Toaster />
      <Box
        w="100%"
        h={{
          base: '100vh',
          sm: '100vh',
          lg: '100vh',
        }}
      >
        {children}
      </Box>
    </PublicProvider>
  );
}
