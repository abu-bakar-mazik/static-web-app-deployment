import React from 'react';
import { HStack, Heading, Spinner } from '@chakra-ui/react';
import { Download01Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
interface LogsHeaderProps {
  onExportCSV: () => void;
  isLoading: boolean;
}
export const LogsHeader: React.FC<LogsHeaderProps> = ({ onExportCSV, isLoading }) => {
  return (
    <HStack pb={{ base: 2, lg: 3 }} px={4} flexDirection={{ base: 'column', sm: 'row', md: 'row' }} alignItems="center" w="100%">
      <Heading as="h1" fontSize={{ base: 16, xl: 18 }} fontWeight="700" mb={{ base: '0.5rem', sm: 0 }} display={{ base: 'none', sm: 'flex' }}>
        Analyze Logs
      </Heading>
      <HStack ml="auto" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        <Heading as="h1" fontSize={{ base: 16, xl: 18 }} fontWeight="700" mb={{ base: 0 }} display={{ base: 'flex', sm: 'none' }}>
          Analyze Logs
        </Heading>
        <Button visual="primary" onClick={onExportCSV} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" mr={2} /> : <Download01Icon />}
          Export Excel
        </Button>
      </HStack>
    </HStack>
  );
};
