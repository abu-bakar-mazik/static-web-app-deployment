'use client';
import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <Box mt={{ base: '150px', md: '80px' }} float="right" h={{ base: 'calc(100vh - 150px)', sm: 'calc(100vh - 100px)' }} overflow="hidden" position="relative" maxHeight="100%" w={{ base: '100%', xl: 'calc( 100% - 290px )' }} maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }} transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)" transitionDuration=".2s, .2s, .35s" transitionProperty="top, bottom, width" transitionTimingFunction="linear, linear, ease">
      <Box mx="auto" p={{ base: '20px', md: '30px' }} pe="20px" pt="50px" overflowY={'auto'} h={'100%'}>
        {children}
      </Box>
    </Box>
  );
}
