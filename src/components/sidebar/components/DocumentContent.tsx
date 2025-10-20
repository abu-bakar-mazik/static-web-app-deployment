'use client';

import { Flex, Box, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { BotIcon, FileScriptIcon, Resize02Icon, SearchReplaceIcon, WorkUpdateIcon } from 'hugeicons-react';

function DocumentSidebar() {
  return (
    <Flex direction="column" height="100%" pt="20px" pb="26px" borderRadius="30px" maxW="285px" px="20px">
      <Box mb={8}>
        <Text fontSize="lg" fontWeight="bold">
          Admin Menu
        </Text>
      </Box>
      <VStack align="start" gap={0}>
        <Link href="/admin/models" passHref style={{ width: '100%' }}>
          <Box as='span' fontSize="md" borderBottom="1px solid" borderColor="gray.200" p={3} fontWeight="500" _hover={{ bg: '#D3E2ED'}} display="flex" borderRadius="0">
            <BotIcon size={22} />
            <Text ml={4}>Models</Text>
          </Box>
        </Link>
        <Link href="/admin/change-logo" passHref style={{ width: '100%' }}>
          <Box as='span' fontSize="md" borderBottom="1px solid" borderColor="gray.200" p={3} fontWeight="500" _hover={{ bg: '#D3E2ED'}} display="flex" borderRadius="0">
            <WorkUpdateIcon size={22} />
            <Text ml={4}>Change Logo</Text>
          </Box>
        </Link>
        <Link href="/admin/chunk-size" passHref style={{ width: '100%' }}>
          <Box as='span' fontSize="md" borderBottom="1px solid" borderColor="gray.200" p={3} fontWeight="500" _hover={{ bg: '#D3E2ED'}} display="flex" borderRadius="0">
            <Resize02Icon size={22} />
            <Text ml={4}>Chunk Size</Text>
          </Box>
        </Link>
        <Link href="/admin/retriever-status" passHref style={{ width: '100%' }}>
          <Box as='span' fontSize="md" borderBottom="1px solid" borderColor="gray.200" p={3} fontWeight="500" _hover={{ bg: '#D3E2ED'}} display="flex" borderRadius="0">
            <SearchReplaceIcon size={22} />
            <Text ml={4}>Retriever</Text>
          </Box>
        </Link>
        <Link href="/admin/logs-analysis" passHref style={{ width: '100%' }}>
          <Box as='span' fontSize="md" borderBottom="1px solid" borderColor="gray.200" p={3} fontWeight="500" _hover={{ bg: '#D3E2ED'}} display="flex" borderRadius="0">
            <FileScriptIcon size={22} />
            <Text ml={4}>LLM Logs</Text>
          </Box>
        </Link>
      </VStack>
    </Flex>
  );
}

export default DocumentSidebar;
