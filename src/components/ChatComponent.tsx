'use client';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Card, Flex, Heading, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion';
import MessageBoxChat from '@/components/MessageBox';
import { Add02Icon, Attachment01Icon, BrowserIcon, Remove02Icon, SentIcon, SquareArrowExpand01Icon, Share08Icon } from 'hugeicons-react';
import { Prompt } from '@/types/prompt-types';
import { useColorModeValue } from './ui/color-mode';
import { Button } from './ui/button';
import { CloseButton } from './ui/close-button';
import { debounce } from 'lodash';
import { Tooltip } from './ui/tooltip';
import { useEscapeKey } from '@/hooks/handleEscape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { usePathname } from 'next/navigation';
import { setFileName } from '@/redux/slices/chatHistorySlice';
interface ChatComponentProps {
  isAuthenticated?: boolean;
  prompts?: Prompt[];
  selectedDocs: any[];
  handleTranslateAction: (value?: string, chatId?: string) => void;
  outputCode: string;
  inputCode: string;
  setInputCodeAction: (value: string) => void;
  isLoading: boolean;
  chatHistory: any[];
  userToken: number;
  chatId?: string;
  showWelcomeScreen?: boolean;
}
// Define interfaces for component props
interface WelcomeScreenProps {
  renderWelcomeScreen: () => React.ReactElement;
}
// Memoized subcomponents for better performance
const MemoizedMessageBox: React.MemoExoticComponent<typeof MessageBoxChat> = memo(MessageBoxChat);
MemoizedMessageBox.displayName = 'MemoizedMessageBox';
const MemoizedWelcomeScreen: React.MemoExoticComponent<React.FC<WelcomeScreenProps>> = memo(({ renderWelcomeScreen }: WelcomeScreenProps) => renderWelcomeScreen());
MemoizedWelcomeScreen.displayName = 'MemoizedWelcomeScreen';
export const ChatComponent: React.FC<ChatComponentProps> = ({ isAuthenticated, prompts, selectedDocs, handleTranslateAction, outputCode, inputCode, setInputCodeAction, isLoading, chatHistory, userToken, chatId, showWelcomeScreen = false }) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const promptPanelRef = useRef<HTMLDivElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isCitationOpen, setIsCitationOpen] = useState<boolean>(false);
  const hasPrompts = Boolean(prompts?.length);
  const hasSelectedDocs = selectedDocs.length > 0;
  const [isBrowsePrompt, setIsBrowsePrompt] = useState<boolean>(hasPrompts && hasSelectedDocs ? true : false);
  const { fileId, fileName } = useSelector((state: RootState) => state.chatHistory);
  const [promptExpand, setPromptExpand] = useState<boolean>(false);
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  const [contentEditField, setContentEditField] = useState<boolean>(false);
  const inputColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue({ color: 'gray.500' }, { color: 'whiteAlpha.600' });
  const handleFocus = () => setIsInputFocused(true);
  const handleBlur = useCallback(() => {
    if (contentEditableRef.current) {
      const content = contentEditableRef.current.innerHTML.trim();
      if (!content || content === '<br>' || content === '<p><br></p>') {
        contentEditableRef.current.innerHTML = "<p class='placeholder'><br></p>";
      }
    }
    setIsInputFocused(false);
  }, []);
  const isInputEmpty = () => {
    const trimmedCode = inputCode.trim();
    return !trimmedCode || trimmedCode === '<p class="placeholder"><br></p>' || trimmedCode === '<p><br></p>';
  };
  // Debounced input handler
  const debouncedHandleChange = useCallback(
    debounce((content: string) => {
      setInputCodeAction(content);
    }, 150),
    [setInputCodeAction],
  );
  const handleChange = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      if (contentEditableRef.current) {
        const content = contentEditableRef.current.innerHTML.trim();
        if (!content || content === '<br>' || content === '<p><br></p>' || content === '<p class="placeholder"><br></p>') {
          contentEditableRef.current.innerHTML = '<p class="placeholder"><br></p>';
        } else {
          const firstP = contentEditableRef.current.querySelector('p');
          if (firstP?.classList.contains('placeholder')) {
            firstP.classList.remove('placeholder');
            firstP.removeAttribute('class');
          }
        }
        debouncedHandleChange(contentEditableRef.current.innerText || '');
      }
    },
    [setInputCodeAction],
  );
  const insertNewParagraph = useCallback(
    (ev: KeyboardEvent) => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const node = selection?.anchorNode;
      if (!range || !node || !contentEditableRef.current) return;
      const parentBlock = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
      if (!parentBlock || !contentEditableRef.current?.contains(parentBlock)) return;
      const newP = document.createElement('p');
      const br = document.createElement('br');
      newP.appendChild(br);
      if (parentBlock.parentNode === contentEditableRef.current) {
        parentBlock.insertAdjacentElement('afterend', newP);
      } else {
        contentEditableRef.current?.appendChild(newP);
      }
      const newRange = document.createRange();
      newRange.setStart(newP, 0);
      newRange.setEnd(newP, 0);
      selection.removeAllRanges();
      selection.addRange(newRange);
      ev.stopPropagation();
      setInputCodeAction(contentEditableRef.current?.innerText || '');
    },
    [setInputCodeAction],
  );
  useEffect(() => {
    // Only focus when component initially mounts
    if (contentEditableRef.current && !contentEditableRef.current.contains(document.activeElement)) {
      contentEditableRef.current.focus();
    }
  }, []);
  useEffect(() => {
    const currentRef = contentEditableRef.current;
    if (currentRef) {
      if (isInputEmpty()) {
        const content = currentRef.innerHTML.trim();
        if (!content || content === '<br>' || content === '<p><br></p>' || content === '<p class="placeholder"><br></p>') {
          currentRef.innerHTML = '<p class="placeholder"><br></p>';
          // setContentEditField(true);
        }
      }
      setContentEditField(!isLoading);
    }
  }, [isInputEmpty]);
  useEffect(() => {
    const currentRef = contentEditableRef.current;
    if (!currentRef) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        insertNewParagraph(event);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (!isLoading && inputCode.trim().length > 0) {
          handleTranslateAction(inputCode, chatId);
          if (contentEditableRef.current) {
            contentEditableRef.current.innerHTML = '<p class="placeholder"><br></p>';
          }
        }
      }
    };
    currentRef.addEventListener('keydown', handleKeyDown);
    return () => {
      currentRef.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputCode, handleTranslateAction, isLoading, chatId, insertNewParagraph]);
  const handlePromptClick = useCallback(
    (value: string) => {
      handleTranslateAction(value, chatId);
      setPromptExpand(false);
    },
    [handleTranslateAction, chatId],
  );
  const handleBrowseClick = useCallback(() => {
    setIsBrowsePrompt((prev) => !prev);
  }, []);
  const handlePromptExpand = useCallback(() => {
    setPromptExpand((prev) => !prev);
  }, []);
  // Initialize state after mount
  useEffect(() => {
    if (hasPrompts && hasSelectedDocs) {
      setIsBrowsePrompt(true);
    }
  }, [prompts?.length, selectedDocs.length]);
  useEffect(() => {
    if (promptExpand) {
      const handleClickOutside = (event: MouseEvent) => {
        if (promptPanelRef.current && !promptPanelRef.current.contains(event.target as Node)) {
          const expandButton = document.querySelector('button[class*="submitP"]');
          if (!expandButton || !expandButton.contains(event.target as Node)) {
            setPromptExpand(false);
          }
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [promptExpand]);
  useEscapeKey(() => {
    if (promptExpand) {
      setPromptExpand(false);
    }
  }, [promptExpand]);
  useEffect(() => {
    // Only run this effect once on component mount
    const handleRefreshAtRoot = () => {
      if (pathname === '/') {
        if (selectedDocs.length > 0 && selectedDocs.length < 2) {
          const newFileName = selectedDocs[0].name;
          if (newFileName && newFileName !== fileName) {
            dispatch(setFileName(newFileName));
          }
        } else if (selectedDocs.length > 1) {
          const newFileName = `Multiple Files (${selectedDocs.length})`;
          if (newFileName !== fileName) {
            dispatch(setFileName(newFileName));
          }
        }
      }
    };
    handleRefreshAtRoot();
  }, [pathname, selectedDocs, fileName, dispatch]);
  const renderWelcomeScreen = () => (
    <Flex direction="column" alignItems="center" w="100%" maxW={{ sm: !isBrowsePrompt ? '1280px' : 'inherit' }} h="calc(100% - 107px)" mx="auto" display="flex" pt={{ base: '2rem', lg: '0.5rem' }} pb="0.5rem" px={{ base: 4, lg: 10 }} justifyContent={{ base: 'flex-start', lg: 'center' }} overflowY="auto">
      <Text fontWeight="500" fontSize={{ base: '18px', md: '22px', lg: '20px', xl: '24px' }} color="gray.600" textAlign="center">
        Hello there,
      </Text>
      <Text fontWeight="600" fontSize={{ base: '22px', md: '28px', lg: '26px', xl: '32px' }} color="blue.400" bg={'gradients.primary'} backgroundClip="text" css={{ textFillColor: 'transparent' }} textAlign="center">
        How can we assist you?
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: isBrowsePrompt ? 2 : 3, xl: 3 }} w={{ base: '220px', sm: '100%', md: '100%' }} gap={4} mt={5}>
        <Card.Root bg="rgb(200,209,229,0.3)" p={{ base: 4, lg: 4, xl: 6 }} alignItems="center" borderRadius="6px" border="1px solid" borderColor="#dbe0e3" boxShadow="0 5px 5px rgba(0,0,0,0.05)">
          <Text alignContent={'center'} fontSize={{ base: 'sm', lg: 'sm', xl: 'md' }} textAlign={{ base: 'center', lg: 'left' }}>
            Summarize the key points of an author's contract.
          </Text>
        </Card.Root>
        <Card.Root bg="rgb(200,209,229,0.3)" p={{ base: 4, lg: 4, xl: 6 }} alignItems="center" borderRadius="6px" border="1px solid" borderColor="#dbe0e3" boxShadow="0 5px 5px rgba(0,0,0,0.05)">
          <Text alignContent={'center'} fontSize={{ base: 'sm', lg: 'sm', xl: 'md' }} textAlign={{ base: 'center', lg: 'left' }}>
            Provide the royalty details from the agreement.
          </Text>
        </Card.Root>
        <Card.Root bg="rgb(200,209,229,0.3)" p={{ base: 4, lg: 4, xl: 6 }} alignItems="center" borderRadius="6px" border="1px solid" borderColor="#dbe0e3" boxShadow="0 5px 5px rgba(0,0,0,0.05)">
          <Text alignContent={'center'} fontSize={{ base: 'sm', lg: 'sm', xl: 'md' }} textAlign={{ base: 'center', lg: 'left' }}>
            How can publisher streamline their production schedules for timely book release.
          </Text>
        </Card.Root>
      </SimpleGrid>
    </Flex>
  );
  return (
    <Flex w="100%" pt={{ base: '0', md: '0px' }} direction="row" position="relative" h="100%">
      {isAuthenticated && (
        <>
          <Flex direction="column" mx="auto" w={{ base: '100%', md: isBrowsePrompt ? 'calc(100% - 300px)' : '100%' }} h="100%" filter={{ base: isBrowsePrompt ? 'blur(10px)' : 'blur(0)', md: promptExpand ? 'blur(10px)' : 'blur(0)' }} pointerEvents={{ base: isBrowsePrompt ? 'none' : 'auto', md: promptExpand ? 'none' : 'auto' }}>
            {showWelcomeScreen && !outputCode ? (
              <MemoizedWelcomeScreen renderWelcomeScreen={renderWelcomeScreen} />
            ) : (
              <Flex direction="column" w="100%" mx="auto" display="flex" mb="auto" h="calc(100% - 111px)" overflowY="auto">
                <Flex w="100%">
                  <MemoizedMessageBox isLoading={isLoading} output={outputCode} chatHistory={chatHistory} isCitationOpen={isCitationOpen} setIsCitationOpen={setIsCitationOpen} />
                </Flex>
              </Flex>
            )}
            <Flex mt="auto" pb={4} w="100%" maxW="1000px" mx="auto" minH={{ base: '44px', sm: '44px' }} maxH={{ base: '127px', sm: '127px' }} h="auto" px={4}>
              <VStack border="1px solid" borderColor="rgba(255,255,255,0.25)" w="100%" borderRadius={{ base: isInputFocused ? '25px' : '8px', sm: '8px' }} overflow="hidden" gap={0} boxShadow="0 5px 5px rgba(0,0,0,0.1)" minH={{ base: '44px', sm: '44px' }} h="auto" bg="rgba(255,255,255,0.5)">
                <Flex w="100%" alignItems="center">
                  <Flex w="100%" justifySelf="flex-end" zIndex="1000" pl={2} minH={{ base: '21px', sm: '21px' }} h="auto" flexWrap={{ base: isInputFocused ? 'wrap' : 'nowrap', sm: 'nowrap' }} transition="max-height 0.3s ease" my={2} overflowY="auto" maxH="61px">
                    <Box
                      contentEditable={contentEditField}
                      ref={contentEditableRef}
                      minH={{ base: '21px', sm: '21px' }}
                      h="auto"
                      bg="transparent"
                      pr={{ base: 4, md: 5 }}
                      pl={{ base: 1, md: 1 }}
                      me="10px"
                      w="calc(100% - 50px)"
                      border="none"
                      fontSize={{ base: 'xs', md: 'sm' }}
                      fontWeight="500"
                      order="2"
                      position="relative"
                      _focus={{
                        borderColor: 'transparent',
                        order: { base: 1, sm: 2 },
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      _focusVisible={{ borderColor: 'transparent', outline: 'none' }}
                      color={inputColor}
                      _placeholder={placeholderColor}
                      onInput={handleChange}
                      suppressHydrationWarning
                      css={{
                        '& .placeholder': {
                          _before: { content: `'Type your message here...'`, position: 'absolute', left: '5px', color: 'gray.300', fontWeight: 'normal', pointerEvents: 'none' },
                        },
                        _focus: {
                          '& .placeholder': {
                            _before: { visibility: 'hidden' },
                          },
                        },
                      }}
                    />
                  </Flex>
                  <Button className="submitP" px={{ base: '8px', md: '10px' }} fontSize={{ base: 'xs', md: 'sm' }} borderRadius="45px" ms="auto" w={{ base: '38px', sm: '45px' }} h={{ base: '21px', md: '21px' }} mr={{ base: '0px', sm: '0px' }} onClick={() => handleTranslateAction(inputCode, chatId)} loading={isLoading} disabled={!isLoading && !isInputEmpty() ? false : true} order={3} transition="order 0.3s ease" bg="transparent" color="#1c9cf4" _hover={{ bg: 'transparent' }} _focus={{ bg: 'transparent' }}>
                    <SentIcon size={22} />
                  </Button>
                </Flex>
                <HStack w="100%" h="100%" bg="rgb(200,209,229,0.1)" minH="35px" borderTop="1px solid" borderTopColor="#d1d7df" maxH={{ base: '38px', sm: '38px' }}>
                  <Button visual="ghost" py={1} px={2} fontSize={{ base: 'xs', md: 'sm' }} onClick={handleBrowseClick} bg="transparent" color="gray.600" _active={{ bg: 'transparent', color: 'blue.400' }} _focusVisible={{ bg: 'transparent', color: 'blue.400' }} _hover={{ bg: 'transparent', color: 'blue.400' }} _focus={{ bg: 'transparent', color: 'blue.400' }} h="auto" disabled={promptExpand}>
                    <BrowserIcon size={18} />
                    <Text fontSize="12px">Browse Prompts</Text>
                  </Button>
                  {fileName ? (
                    <Tooltip content={fileName}>
                      {/* {selectedDocs.length > 0 && ( */}
                      <Button visual="ghost" cursor="auto" py={1} px={2} fontSize={{ base: 'xs', md: 'sm' }} bg="transparent" color="gray.600" _hover={{ bg: 'transparent' }} _focus={{ bg: 'transparent' }} h="auto" maxW="402px" textOverflow="ellipsis" whiteSpace="nowrap" justifyContent="flex-start" overflow="hidden">
                        <Icon w="18px" h="18px" color="gray.700">
                          <Attachment01Icon />
                        </Icon>
                        <Text fontSize="12px">{fileName}</Text>
                      </Button>
                      {/* )} */}
                    </Tooltip>
                  ) : (
                    <Button visual="ghost" cursor="auto" py={1} px={2} fontSize={{ base: 'xs', md: 'sm' }} bg="transparent" color="gray.600" _hover={{ bg: 'transparent' }} _focus={{ bg: 'transparent' }} h="auto" maxW="402px" textOverflow="ellipsis" whiteSpace="nowrap" justifyContent="flex-start" overflow="hidden">
                      <Icon w="18px" h="18px" color="gray.700">
                        <Attachment01Icon />
                      </Icon>
                      <Text fontSize="12px">No File Attachment</Text>
                    </Button>
                  )}
                  <Text width="max-content" marginRight={2} fontSize="12px" color="gray.600" ms="auto">
                    Token: {userToken}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </Flex>
          {prompts && prompts.length > 0 && (
            <Flex ref={promptPanelRef} direction="column" w={{ base: selectedDocs.length > 0 ? (isBrowsePrompt ? '75%' : 0) : isBrowsePrompt ? '75%' : 0, md: selectedDocs.length > 0 ? (isBrowsePrompt ? (promptExpand ? '75%' : '300px') : 0) : isBrowsePrompt ? (promptExpand ? '75%' : '300px') : 0 }} pos={{ base: 'absolute', md: promptExpand ? 'absolute' : 'relative' }} right={{ base: selectedDocs.length > 0 ? (isBrowsePrompt ? 0 : '-75%') : isBrowsePrompt ? 0 : '-75%', md: selectedDocs.length > 0 ? (isBrowsePrompt ? 0 : promptExpand ? '-75%' : '-300px') : isBrowsePrompt ? 0 : promptExpand ? '-75%' : '-300px' }} display="flex" borderLeft="1px solid" borderColor="gray.200" transition="all 0.2s" mx={0} tabIndex={isBrowsePrompt ? 0 : -1} clip={{ base: 'inherit', md: promptExpand ? 'inherit' : 'rect(0, 0, 0, 0)' }} visibility={isBrowsePrompt ? 'visible' : 'hidden'} zIndex={{ base: '23', md: '1' }} h={'100%'}>
              <Heading as="h6" fontSize="md" borderBottom="1px solid" borderBottomColor="#dbe0e3" w="100%" textAlign="center" px={2} py={3} bg="rgb(200,209,229,0.3)" display="flex" alignItems={'center'}>
                Prompts
                <CloseButton size={{ base: 'md', md: 'md' }} display={{ base: 'inline-flex', md: 'none' }} visual={'ghost'} w="max-content" px={2} minW={'initial'} h={'100%'} ml="auto" onClick={() => setIsBrowsePrompt(false)} />
                <Button className="submitP" px={{ base: '8px', md: '10px' }} display={{ base: 'none', md: 'flex' }} fontSize={{ base: 'xs', md: 'sm' }} borderRadius="45px" ms="auto" w={{ base: '38px', sm: '45px' }} h={{ base: '21px', md: '21px' }} mr={{ base: '0px', sm: '0px' }} onClick={handlePromptExpand} order={3} transition="order 0.3s ease" bg="transparent" color="#1c9cf4" _hover={{ bg: 'transparent' }} _focus={{ bg: 'transparent' }}>
                  <SquareArrowExpand01Icon size={22} />
                </Button>
              </Heading>
              <VStack w="100%" gap={2} p={3} overflowY="auto" height={{ base: 'calc(100% - 47px)', md: 'calc(100% - 56px)' }} bg={promptExpand ? 'rgba(233,238,248,0.75)' : 'rgba(233,238,248,0.5)'} borderTop="1px solid" borderTopColor="#f3f8ff">
                {prompts.map((prt, index) => {
                  const validPrompts = prt.prompt.filter((prompt) => prompt && prompt.trim().length > 0);
                  return (
                    <AccordionRoot key={`prompt-group-${prt.id}-${index}`} w="100%" collapsible defaultValue={index === 0 ? [prt.title] : undefined}>
                      <AccordionItem value={prt.title} pos="relative" border="none" w="100%" css={{ '& .chakra-collapse': { width: '100%' } }}>
                        <AccordionItemTrigger
                          borderRadius="8px"
                          bg="rgb(200,209,229,0.3)"
                          px={2}
                          h="40px"
                          zIndex={1}
                          right="0"
                          pos="relative"
                          css={{
                            '&[data-state="open"]': {
                              mb: 2,
                              md: {
                                _before: {
                                  content: "''",
                                  w: '1px',
                                  pos: 'absolute',
                                  left: '5px',
                                  height: '32px',
                                  top: '37px',
                                  background: '#dbe0e3',
                                },
                              },
                            },
                          }}
                        >
                          <HStack w="100%" alignItems="center" gap={2}>
                            {prt.is_owner === false && (
                              <Tooltip content={`Shared by ${prt.shared_by || 'another user'}`}>
                                <Icon as={Share08Icon} w={4} h={4} color="blue.500" flexShrink={0} />
                              </Tooltip>
                            )}
                            <Text fontSize="sm" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" flex="1" textAlign="left" pointerEvents="none">
                              {prt.title}
                            </Text>
                          </HStack>
                        </AccordionItemTrigger>
                        <VStack w="100%">
                          <AccordionItemContent w="100%" p="0">
                            {validPrompts && (
                              <>
                                {prt.prompt.map((pmt, pind) => {
                                  const isLastIndex = pind === prt.prompt.length - 1;
                                  return (
                                    <Tooltip content={pmt} key={`${prt.id}-prompt-${pind}-${pmt.substring(0, 10)}`}>
                                      <Button
                                        disabled={isLoading}
                                        onClick={() => handlePromptClick(pmt)}
                                        height="40px"
                                        _focusVisible={{ outline: 'none' }}
                                        _focus={{ bg: 'blue.50', borderColor: 'blue.100' }}
                                        _hover={{ bg: 'blue.50', borderColor: 'blue.100' }}
                                        fontWeight="medium"
                                        bg="rgba(255,255,255,0.25)"
                                        p={2}
                                        alignItems="center"
                                        borderRadius="8px"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        color="gray.600"
                                        justifyContent="flex-start"
                                        w={{ base: 'calc(100% - 8px)', md: 'calc(100% - 16px)' }}
                                        mb={!isLastIndex ? 1 : 0}
                                        ml={{ base: 2, md: 4 }}
                                        _before={{
                                          md: {
                                            content: "''",
                                            h: '1px',
                                            pos: 'absolute',
                                            left: '-12px',
                                            width: '12px',
                                            background: '#dbe0e3',
                                          },
                                        }}
                                        _after={{
                                          md: {
                                            content: "''",
                                            w: '1px',
                                            pos: 'absolute',
                                            left: '-12px',
                                            height: '24px',
                                            bottom: !isLastIndex ? '-5px' : undefined,
                                            top: isLastIndex ? '-5px' : undefined,
                                            background: '#dbe0e3',
                                          },
                                        }}
                                      >
                                        <Text fontSize={{ base: '12px', md: 'sm' }} color="gray.600" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" maxW="100%">
                                          {pmt}
                                        </Text>
                                      </Button>
                                    </Tooltip>
                                  );
                                })}
                              </>
                            )}
                          </AccordionItemContent>
                        </VStack>
                      </AccordionItem>
                    </AccordionRoot>
                  );
                })}
              </VStack>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};
export default ChatComponent;
