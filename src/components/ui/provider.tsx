'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';
import theme from '../theme/theme';

export default function UIProvider({ children }: ColorModeProviderProps) {
  return (
    <ChakraProvider value={theme}>
      {children}
    </ChakraProvider>
  );
}
