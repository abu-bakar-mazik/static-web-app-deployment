'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, HStack, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowLeft04Icon, ArrowRight04Icon, Copy01Icon, DocumentCodeIcon } from 'hugeicons-react';
import { DrawerBackdrop, DrawerBody, DrawerCloseTrigger, DrawerContent, DrawerRoot, DrawerTrigger } from '@/components/ui/drawer';
import { useColorModeValue } from './ui/color-mode';
import { DrawerFooter, DrawerHeader } from './ui/drawer';
import { toaster } from './ui/toaster';
import { CardRoot } from './ui/card';
import { Button } from './ui/button';
interface Citation {
  content: string;
  title: string;
}
interface MessageBoxProps {
  output: string;
  chatHistory: Array<{ content: string; role: string; citation?: Array<{ content: string; title: string }> }>;
  setIsCitationOpen: (open: boolean) => void;
  isCitationOpen: boolean;
  isLoading: boolean;
}
const MessageBox = ({ output, chatHistory, setIsCitationOpen, isCitationOpen, isLoading }: MessageBoxProps) => {
  const textColor = useColorModeValue('navy.700', 'white');
  const [displayedText, setDisplayedText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [selectedCitations, setSelectedCitations] = useState<Citation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { open, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (output) {
      let currentIndex = 0;
      setDisplayedText('');
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + output.charAt(currentIndex));
        currentIndex += 1;
        if (currentIndex === output.length) {
          clearInterval(intervalId);
        }
      }, 10);
      return () => clearInterval(intervalId);
    }
  }, [output]);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toaster.create({
        title: 'Message copied successfully.',
        type: 'success',
      });
    });
  };
  const renderers = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <Box position="relative" mt={2}>
          <SyntaxHighlighter language={match[1]} style={oneDark} customStyle={{ borderRadius: '8px', padding: '1em', backgroundColor: '#282c34' }} PreTag="div" {...props}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
          <Button aria-label="Copy code" position="absolute" px={2} top="0.5em" right="0.5em" size="sm" onClick={() => handleCopy(String(children))} bg="gray.700" color="white">
            <Copy01Icon style={{width: 18, height: 18}} />
          </Button>
        </Box>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    ul: ({ children }: any) => <ul style={{ marginTop: 4, paddingLeft: '2em', listStyleType: 'disc' }}>{children}</ul>,
    ol: ({ children }: any) => <ol style={{ marginTop: 4, paddingLeft: '2em', listStyleType: 'decimal' }}>{children}</ol>,
    li: ({ children }: any) => <li style={{ marginBottom: '0.5em' }}>{children}</li>,
    table: ({ children }: any) => (
      <div style={{ overflowX: 'auto', margin: '1em 0' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th
        style={{
          backgroundColor: '#56bafe',
          color: 'white',
          padding: '12px',
          fontSize: '14px',
          textAlign: 'left',
          fontWeight: 'bold',
          borderBottom: '2px solid #ddd',
        }}
      >
        {children}
      </th>
    ),
    td: ({ children, rowIndex }: any) => (
      <td
        style={{
          padding: '10px',
          textAlign: 'left',
          fontSize: '13px',
          backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#fff',
          borderBottom: '1px solid #ddd',
        }}
      >
        {children}
      </td>
    ),
  };
  const formatCitationContent = (content: string) => {
    // Handle array content
    if (Array.isArray(content)) {
      return content.map((item, index) => `${index + 1}. ${item}`).join('\n');
    }

    // Handle string content
    if (typeof content !== 'string') {
      return String(content);
    }
    // Special handling for table content
    if (content.includes('|')) {
      // Split into lines and process each line
      const lines = content.split('\n');
      const processedLines = lines.map((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return '';
        // Process each cell in the table row
        const cells = trimmedLine.split('|').map((cell) => cell.trim());
        // Filter out empty cells at start/end (from split on outer pipes)
        const filteredCells = cells.filter((cell) => cell !== '');
        // Rejoin with proper table formatting
        return `| ${filteredCells.join(' | ')} |`;
      });
      // Filter out empty lines and join with newlines
      const tableContent = processedLines.filter((line) => line).join('\n');
      // For tables that don't have a header row divider, add one
      const lines2 = tableContent.split('\n');
      if (lines2.length > 1 && !lines2[1].match(/^\|[\s-|]*\|$/)) {
        // Count columns in first row
        const columnCount = lines2[0].split('|').length - 2; // -2 for outer pipes
        const headerDivider = `|${' --- |'.repeat(columnCount)}`;
        lines2.splice(1, 0, headerDivider);
        return lines2.join('\n');
      }
      return tableContent;
    }
    // Handle markdown section markers
    const markdownSections = content.split('##').map((section) => section.trim());
    return markdownSections
      .map((section) => {
        if (!section) return '';
        // Process the content and handle section numbers
        let processedContent = section.replace(/(\d+\.\d+)\s+/g, (match, sectionNum) => `\n\n**${sectionNum}** `);
        // If the section starts with a number (like "14."), add the markdown heading
        if (section.match(/^\s*\d+\./)) {
          processedContent = `## ${processedContent}`;
        }
        // Clean up extra spaces and line breaks
        return processedContent
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line)
          .join('\n\n');
      })
      .join('\n\n');
  };
  const markdownComponents = {
    h1: ({ children }: any) => (
      <Text fontSize="xl" fontWeight="bold" mb={4} mt={6}>
        {children}
      </Text>
    ),
    h2: ({ children }: any) => (
      <Text fontSize="lg" fontWeight="bold" mb={3} mt={5}>
        {children}
      </Text>
    ),
    h3: ({ children }: any) => (
      <Text fontSize="md" fontWeight="bold" mb={2} mt={4} color="blue.700">
        {children}
      </Text>
    ),
    p: ({ children }: any) => (
      <Text
        mb={4}
        lineHeight="tall"
        fontSize="14px"
        color="gray.700"
        whiteSpace="pre-wrap"
        css={{
          '& strong': {
            color: 'blue.600',
            fontWeight: 'bold',
            display: 'inline-block',
            mr: 2,
          },
        }}
      >
        {children}
      </Text>
    ),
    strong: ({ children }: any) => (
      <Text as="strong" color="blue.600" fontWeight="bold" display="inline-block" mr={2}>
        {children}
      </Text>
    ),
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <Box position="relative" mt={2}>
          <SyntaxHighlighter language={match[1]} style={oneDark} PreTag="div" {...props}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    table: ({ children }: any) => (
      <Box overflowX="auto" my={4}>
        <Box as="table" width="100%" borderCollapse="separate" borderSpacing={0} borderRadius="8px" border="1px solid" borderColor="gray.200">
          {children}
        </Box>
      </Box>
    ),
    thead: ({ children }: any) => (
      <Box as="thead" bg="#56bafe" color="white">
        {children}
      </Box>
    ),
    tbody: ({ children }: any) => (
      <Box
        as="tbody"
        css={{
          '& tr:nth-of-type(odd)': {
            bg: 'gray.50',
          },
          '& tr:nth-of-type(even)': {
            bg: 'white',
          },
        }}
      >
        {children}
      </Box>
    ),
    th: ({ children }: any) => (
      <Box as="th" px={4} py={3} fontSize="14px" fontWeight="semibold" textAlign="left" borderBottom="2px" borderColor="gray.200" color="white">
        {children}
      </Box>
    ),
    td: ({ children }: any) => (
      <Box as="td" px={4} py={3} fontSize="13px" borderTop="1px" borderColor="gray.200" whiteSpace="pre-wrap">
        {children}
      </Box>
    ),
    ul: ({ children }: any) => (
      <Box as="ul" pl={4} mb={4} listStyle="disc">
        {children}
      </Box>
    ),
    ol: ({ children }: any) => (
      <Box as="ol" pl={4} mb={4} listStyle="decimal">
        {children}
      </Box>
    ),
    li: ({ children }: any) => (
      <Box as="li" mb={2}>
        {children}
      </Box>
    ),
    blockquote: ({ children }: any) => (
      <Box borderLeft="4px" borderColor="blue.200" pl={4} py={2} my={4} bg="gray.50">
        {children}
      </Box>
    ),
  };
  const handleCitationClick = (citations: Array<{ content: string; title: string }>) => {
    setSelectedCitations(citations);
    setIsCitationOpen(true);
    onOpen();
  };
  const closeSidebar = () => {
    setIsCitationOpen(false);
    setCurrentPage(1);
    onClose();
  };

  const citationsPerPage = 1;
  const totalPages = Math.ceil(selectedCitations.length / citationsPerPage);
  return (
    <>
      <CardRoot display={chatHistory.length > 0 ? 'flex' : 'none'} color={textColor} minH="300px" fontSize={{ base: 'sm', md: 'md' }} fontWeight="500" mb={10} overflowY="auto" w={'100%'} backgroundColor="transparent" boxShadow="none">
        {chatHistory.map((entry, index) => (
          <Box key={index} display="flex" flexDirection="column" alignItems={entry.role === 'user' ? 'flex-end' : 'flex-start'} padding="10px 0">
            <Box bg={entry.role === 'user' ? 'blue.400' : 'rgba(243,248,255,0.4)'} padding={'12px 18px'} fontSize={{ base: '14px', sm: '13px', xl: '14px' }} borderRadius={entry.role === 'user' ? '6px 6px 0 6px' : '0 6px 6px 6px'} maxWidth="70%" textAlign="left" color={entry.role === 'user' ? 'white' : 'gray.600'} lineHeight={{ base: 1.6, sm: 1.6, xl: 1.82 }} boxShadow={entry.role === 'user' ? '0 5px 10px rgba(66,153,225,0.15)' : '0 0 15px rgba(0,0,0,0.05)'} border="1px solid" borderColor={entry.role === 'user' ? 'rgba(5,87,155,0.2)' : '#f3f8ff'}>
              <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
                {entry.content}
              </ReactMarkdown>
              {entry.role === 'assistant' && (
                <HStack gap={2} mt={2} justifyContent="flex-start">
                  <Button aria-label="Copy" size="sm" colorPalette="blue" borderRadius="full" onClick={() => handleCopy(entry.content)} px={2.5}>
                    <Copy01Icon size={18} />
                  </Button>
                  {entry.citation && entry.citation.length > 0 && (
                    <Button aria-label="info" size="sm" colorPalette="blue" borderRadius="full" onClick={() => handleCitationClick(entry.citation || [])} px={2.5}>
                      <DocumentCodeIcon size={18} />
                    </Button>
                  )}
                </HStack>
              )}
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box userSelect="none" display="flex" alignItems="center" justifyContent="flex-start" mt={4}>
            <Spinner size="sm" mr={2} />
            <Box fontSize="14px" color={textColor}>
              Assistant is searching for Response...
            </Box>
          </Box>
        )}
        <Box ref={bottomRef} />
      </CardRoot>
      {isCitationOpen && (
        <DrawerRoot
          open={open}
          onOpenChange={() => {
            closeSidebar();
          }}
          closeOnEscape
          closeOnInteractOutside
          placement="end"
          size="md"
        >
          <DrawerTrigger />
          <DrawerBackdrop style={{ background: 'transparent' }} />
          <DrawerContent bg="white">
            <DrawerCloseTrigger top={1} onClick={onClose} />
            <DrawerHeader bg={'rgb(200,209,229,0.3)'} alignItems="center" py={3} fontSize={'lg'}>
              Citation
            </DrawerHeader>
            <DrawerBody userSelect={'text'} css={{'& *': {userSelect: 'text'}}} bg="rgba(233,238,248,0.5)" borderTop="1px solid" borderTopColor="gray.200" py={4}>
              {selectedCitations.length > 0 ? (
                <>
                  <Text fontWeight="bold" mb={2} color="blue.600">
                    {selectedCitations[currentPage - 1].title}
                  </Text>
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {formatCitationContent(selectedCitations[currentPage - 1].content)}
                  </ReactMarkdown>
                </>
              ) : (
                <Box p={4}>
                  <Text>No citations available.</Text>
                </Box>
              )}
            </DrawerBody>
            <DrawerFooter bg={'rgb(200,209,229,0.3)'} justifyContent="space-between">
              <Text fontSize="sm">
                Page {currentPage} of {selectedCitations.length}
              </Text>
              <HStack ml="auto">
                <Button aria-label="Previous citation" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ArrowLeft04Icon size={20} />
                </Button>
                <Button aria-label="Next citation" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, selectedCitations.length))} disabled={currentPage === selectedCitations.length}>
                  <ArrowRight04Icon size={20} />
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </DrawerRoot>
      )}
    </>
  );
};
export default MessageBox;
