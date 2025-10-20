'use client';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Box, Flex, HStack, Text, List, ListItem, Link, IconButton, Input, Spacer, Icon, VStack } from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
import { useChatHistory } from '@/hooks/chatHistory';
import { IRoute } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';
import { setEditingConversationId, setNewName, useGetAllSessionsQuery, useRenameChatMutation } from '@/redux/slices/sessionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { openShareModal, useGenerateShareLinkMutation, closeShareModal, copyShareLink } from '@/redux/slices/chatShareSlice';
import ChatShareModal from '@/components/ChatShareModal';
import { RootState } from '@/redux/store';
import { resetChat } from '@/redux/slices/chatSlice';
import { resetChatHistory, setFileName } from '@/redux/slices/chatHistorySlice';
import { BubbleChatPreviewIcon, CircleIcon, Delete02Icon, Edit02Icon, Share08Icon, Tick04Icon } from 'hugeicons-react';
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion';
import { useColorModeValue } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { InputGroup } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { StringUtils } from '@azure/msal-browser';
import { useSelectedDocs } from '@/hooks/SelectedDocs';
import { ConfirmationDialog } from '@/components/confirmationDialog';
interface Session {
  _ts: number;
  chat_id: string;
  title: string;
  filename: string | null;
  fileid: string[];
  have_file: boolean;
}
interface GroupedSessions {
  [key: string]: Session[];
}
interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
}
export function SidebarLinks(props: SidebarLinksProps) {
  const confirmButtonClickedRef = useRef(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { handleDeleteChat, userId, isAuthLoading: SessionLoading } = useAuth();
  // Redux share state
  const { isShareModalOpen: isModalOpen, chatId, shareLink } = useSelector((state: RootState) => state.chatShare);
  const [generateShareLinkMutation, { isLoading: isGeneratingLink }] = useGenerateShareLinkMutation();
  // Redux rename chat
  const { editingConversationId, newName } = useSelector((state: RootState) => state.sessions);
  const [renameChat, { isLoading: isRenameLoading }] = useRenameChatMutation();
  const { selectedDocs, clearDocs } = useSelectedDocs();
  const {
    data: sessions = [],
    isLoading: historyLoading,
    error: sessionsError,
  } = useGetAllSessionsQuery(userId ?? '', {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });
  const { handleConversationClick, isSHLoading, activeConversationId } = useChatHistory();
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const activeColor = useColorModeValue('navy.700', 'white');
  const inactiveColor = useColorModeValue('gray.500', 'gray.500');
  const activeIcon = useColorModeValue('brand.500', 'white');
  const gray = useColorModeValue('gray.500', 'gray.500');
  const bgColor = useColorModeValue('transparent', 'transparent');
  const hoverBgColor = useColorModeValue('gray.200', 'navy.600');
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [pendingSessionName, setPendingSessionName] = useState<string>('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const isHandlingActionRef = useRef(false);
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName);
    },
    [pathname],
  );
  const handleRenameClick = useCallback(
    (session: Session) => {
      dispatch(setEditingConversationId(session.chat_id));
      dispatch(setNewName(session.title));
    },
    [dispatch],
  );
  const updateFileNameInRedux = () => {
    if (selectedDocs.length > 0) {
      const newFileName = selectedDocs.length === 1 ? selectedDocs[0].name : `Multiple Files (${selectedDocs.length})`;
      dispatch(setFileName(newFileName));
    }
  };
  // Update your handleConversationClick function to deselect documents when changing sessions
  const handleSessionSwitchRequest = useCallback(
    async (sessionId: string, sessionName: string) => {
      if (isSHLoading || sessionId === activeConversationId) return;
      if (selectedDocs.length > 0) {
        const targetSession = sessions.find((session) => session.chat_id === sessionId);
        if (targetSession?.have_file) {
          setPendingSessionId(sessionId);
          setPendingSessionName(sessionName);
          setIsConfirmDialogOpen(true);
        } else {
          toaster.create({
            title: 'File-Based Responses Enabled',
            description: 'No file was attached before. Now, responses will be based on your selected file.',
            type: 'info',
            duration: 3000,
          });
          await handleConversationClick(sessionId);
          updateFileNameInRedux();
        }
      } else {
        handleConversationClick(sessionId);
      }
    },
    [isSHLoading, activeConversationId, selectedDocs, handleConversationClick, sessions],
  );
  const handleCancelAndClearDocs = useCallback(async() => {
    // Early return if already processing or no pending session
    if (isHandlingActionRef.current || !pendingSessionId) {
      console.log('cancelandclear - skipped (already processing or no pending ID)');
      return;
    }
    isHandlingActionRef.current = true;
    try {
      clearDocs();
      toaster.create({
        title: 'Switched session',
        description: 'Cleared your document selection.',
        type: 'info',
        duration: 3000,
      });
      await handleConversationClick(pendingSessionId);
      const targetSession = sessions.find((session) => session.chat_id === pendingSessionId);
      if (targetSession) {
        const sessionFileName = targetSession.filename || '';
        dispatch(setFileName(sessionFileName));
      }
    } catch (error) {
      console.log('Error in handleCancelAndClearDocs:', error);
    } finally {
      setIsConfirmDialogOpen(false);
      setPendingSessionId(null);
      setPendingSessionName('');
      setTimeout(() => {
        isHandlingActionRef.current = false;
      }, 200);
    }
  }, [pendingSessionId, clearDocs, sessions, dispatch, handleConversationClick, toaster]);
  
  // Similarly update the keep docs function
  const handleConfirmKeepDocs = useCallback(async() => {
    if (isHandlingActionRef.current || !pendingSessionId) {
      console.log('confirmkeepdocs - skipped (already processing or no pending ID)');
      return;
    }
    isHandlingActionRef.current = true;
    try {
      toaster.create({
        title: 'Switched session',
        description: 'Kept your selected documents.',
        type: 'info',
        duration: 3000,
      });      
      await handleConversationClick(pendingSessionId);
      updateFileNameInRedux();
    } catch (error) {
      console.log('Error in handleConfirmKeepDocs:', error);
    } finally {
      // Reset states
      setIsConfirmDialogOpen(false);
      setPendingSessionId(null);
      setPendingSessionName('');
      setTimeout(() => {
        isHandlingActionRef.current = false;
      }, 200);
    }
  }, [pendingSessionId, updateFileNameInRedux, handleConversationClick, toaster]);
  // Updated handleRenameChat function
  const handleRenameChat = useCallback(
    async (session: Session, e?: React.MouseEvent | React.KeyboardEvent) => {
      e?.preventDefault(); // Prevent form submission
      if (!newName.trim()) return; // Don't allow empty names
      try {
        await renameChat({ chat_id: session.chat_id, new_title: newName.trim() }).unwrap();
        dispatch(setEditingConversationId(null));
        dispatch(setNewName(''));
        toaster.create({
          title: 'Chat name updated successfully.',
          type: 'success',
        });
      } catch (error) {
        toaster.create({
          title: 'Error updating chat name.',
          description: error instanceof Error ? error.message : 'An error occurred.',
          type: 'error',
        });
      }
    },
    [renameChat, newName, dispatch, toaster],
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, session: Session) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleRenameChat(session, event);
      } else if (event.key === 'Escape') {
        dispatch(setEditingConversationId(null));
        dispatch(setNewName(''));
      }
    },
    [handleRenameChat, dispatch],
  );
  const handleShare = useCallback(
    (chatId: string) => {
      if (!userId) return;
      // Only open the modal, don't generate the link yet
      dispatch(openShareModal(chatId));
    },
    [dispatch, userId],
  );
  const generateShareLink = useCallback(
    async (chatId: string) => {
      if (!userId) return;
      try {
        await generateShareLinkMutation({ chatId, userId }).unwrap();
      } catch (error) {
        toaster.create({
          title: 'Failed to generate share link',
          type: 'error',
        });
      }
    },
    [generateShareLinkMutation, userId, toaster],
  );
  const handleHoveredSession = useCallback((sessionId: string) => {
    setHoveredSessionId(sessionId);
  }, []);
  const handleUnHoveredSession = useCallback(() => {
    setHoveredSessionId(null);
  }, []);
  const groupedByDate = useMemo<GroupedSessions>(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Create date for 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Create date for 30 days ago
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return sessions.reduce<GroupedSessions>((acc, session) => {
      // Convert _ts to a date (from seconds to milliseconds)
      const sessionDate = new Date(session._ts * 1000);
      const sessionMonth = sessionDate.getMonth();
      const sessionYear = sessionDate.getFullYear();
      let dateGroup: string;
      if (sessionDate.getDate() === today.getDate() && sessionMonth === currentMonth && sessionYear === currentYear) {
        dateGroup = 'Today';
      } else if (sessionDate.getDate() === yesterday.getDate() && sessionMonth === currentMonth && sessionYear === currentYear) {
        dateGroup = 'Yesterday';
      } else if (sessionDate >= sevenDaysAgo && sessionDate < yesterday) {
        dateGroup = 'Previous 7 Days';
      } else if (sessionDate >= thirtyDaysAgo && sessionDate < sevenDaysAgo) {
        dateGroup = 'Previous 30 Days';
      } else {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        dateGroup = `${monthNames[sessionMonth]} ${sessionYear}`;
      }
      if (!acc[dateGroup]) {
        acc[dateGroup] = [];
      }
      acc[dateGroup].push(session);
      return acc;
    }, {});
  }, [sessions]);
  const getGroupSortOrder = (groupName: string): number => {
    switch (groupName) {
      case 'Today':
        return 0;
      case 'Yesterday':
        return 1;
      case 'Previous 7 Days':
        return 2;
      case 'Previous 30 Days':
        return 3;
      default:
        const parts = groupName.split(' ');
        if (parts.length === 2) {
          const monthName = parts[0];
          const year = parseInt(parts[1], 10);
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const monthIndex = monthNames.indexOf(monthName);
          if (monthIndex !== -1 && !isNaN(year)) {
            return 1000 + 10000 * year + 100 * monthIndex;
          }
        }
        return 100000;
    }
  };
  // Sort function for the grouped chats
  const sortGroupedChats = (entries: [string, Session[]][]): [string, Session[]][] => {
    return entries.sort((a, b) => {
      const orderA = getGroupSortOrder(a[0]);
      const orderB = getGroupSortOrder(b[0]);
      return orderA - orderB;
    });
  };
  // Function to determine if a group is a month-year group
  const isMonthYearGroup = (groupName: string): boolean => {
    const fixedGroups = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days'];
    return !fixedGroups.includes(groupName);
  };
  const renderSessionItem = useCallback(
    (session: Session) => {
      const isActive = session.chat_id === activeConversationId;
      const isEditing = editingConversationId === session.chat_id;
      return (
        <Box
          key={session.chat_id}
          py={1}
          w="100%"
          bg={bgColor}
          _hover={{
            bg: bgColor,
            '& .chat-text': {
              color: isSHLoading ? 'light-dark(rgba(16, 16, 16, 0.3), rgba(255, 255, 255, 0.3))' : isActive ? 'gray.600' : 'blue.300',
              transition: 'all 0.2s ease-in-out',
            },
            '& .chat-icon': {
              color: isSHLoading ? 'light-dark(rgba(16, 16, 16, 0.3), rgba(255, 255, 255, 0.3))' : isActive ? 'blue.400' : 'gray.600',
            },
          }}
        >
          <Flex direction="row" alignItems="center" cursor="pointer" pos="relative" paddingBlock={2} paddingRight={!isEditing ? '12px' : 1} borderRadius={6} _hover={{ bg: !isEditing || !isSHLoading ? 'transparent' : 'transparent' }} _focus={{ bg: !isEditing || !isSHLoading ? 'transparent' : 'transparent' }} _focusVisible={{ bg: !isEditing || !isSHLoading ? 'transparent' : 'transparent' }} onMouseEnter={() => handleHoveredSession(session.chat_id)} onMouseLeave={handleUnHoveredSession}>
            {!isEditing ? (
              <>
                <NavLink
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    if (isSHLoading || isActive) return;
                    handleSessionSwitchRequest(session.chat_id, session.title);
                  }}
                  styles={{
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    pointerEvents: isSHLoading ? 'none' : isActive ? 'none' : 'auto',
                    outline: 'none',
                  }}
                >
                  <Flex alignItems="center">
                    <Box color={isSHLoading ? 'light-dark(rgba(16, 16, 16, 0.3), rgba(255, 255, 255, 0.3))' : isActive ? 'gray.600' : 'blue.400'} className="chat-icon" me="7px">
                      <BubbleChatPreviewIcon size={20} />
                    </Box>
                    <Text fontWeight="normal" color={isSHLoading ? 'light-dark(rgba(16, 16, 16, 0.3), rgba(255, 255, 255, 0.3))' : isActive ? 'blue.400' : 'gray.600'} className="chat-text" fontSize="13px" lineHeight={1.2}>
                      {session.title}
                    </Text>
                  </Flex>
                </NavLink>
                <Box pos="absolute" bg="gray.600" borderRadius="full" px={2} py={1.5} display={hoveredSessionId === session.chat_id ? 'flex' : 'none'} top={'-18px'} right={0}>
                  <Button
                    visual="ghost"
                    bg="transparent"
                    color="white"
                    _hover={{ bg: 'transparent', color: 'red.600' }}
                    _focus={{ bg: 'transparent', color: 'red.600' }}
                    aria-label="Delete"
                    onClick={() => {
                      {
                        isActive ? (handleDeleteChat(session.chat_id), router.push('/'), dispatch(resetChat()), dispatch(resetChatHistory())) : handleDeleteChat(session.chat_id);
                      }
                    }}
                    minWidth="initial"
                    h="auto"
                    pl={1}
                    pr={2}
                    borderRight="1px solid"
                    borderRightColor={borderColor}
                    borderRadius={0}
                  >
                    <Delete02Icon style={{ width: 16, height: 16 }} />
                  </Button>
                  {/* <Button visual="ghost" disabled={isGeneratingLink} bg="transparent" color="white" _hover={{ bg: 'transparent', color: 'blue.400' }} _focus={{ bg: 'transparent', color: 'blue.400' }} aria-label="Share" onClick={() => handleShare(session.chat_id)} minWidth="initial" h="auto" borderLeft="1px solid" borderRight="1px solid" borderColor={borderColor} borderRadius={0} px={2} mx={2}>
                    <Share08Icon style={{ width: 16, height: 16 }} />
                  </Button> */}
                  <Button visual="ghost" bg="transparent" color="white" _hover={{ bg: 'transparent', color: 'blue.400' }} _focus={{ bg: 'transparent', color: 'blue.400' }} aria-label="Rename" onClick={() => handleRenameClick(session)} minWidth="initial" h="auto" borderLeftColor={borderColor} borderRadius={0} pl={2} pr={1}>
                    <Edit02Icon style={{ width: 14, height: 14 }} />
                  </Button>
                </Box>
                <Spacer />
              </>
            ) : (
              <HStack width="100%">
                <InputGroup
                  w="100%"
                  backgroundIE={true}
                  borderRadius={'8px'}
                  endElement={
                    <Button visual="ghost" borderRadius="0 8px 8px 0" px={0} aria-label="Confirm" onClick={() => handleRenameChat(session)} minWidth="initial" h="auto" disabled={isRenameLoading}>
                      <Tick04Icon style={{ width: 16, height: 16 }} color="white" />
                    </Button>
                  }
                >
                  <Input autoFocus value={newName} onChange={(e) => dispatch(setNewName(e.target.value))} size="sm" placeholder="Enter new name" px={1} fontSize={12} _focus={{ borderColor: borderColor }} borderRadius="8px 0 0 8px" onKeyDown={(event) => handleKeyDown(event, session)} h="40px" />
                </InputGroup>
              </HStack>
            )}
          </Flex>
        </Box>
      );
    },
    [
      activeConversationId,
      editingConversationId,
      hoveredSessionId,
      handleHoveredSession,
      handleUnHoveredSession,
      handleSessionSwitchRequest, // <-- Use this instead of handleConversationClick
      handleDeleteChat,
      handleShare,
      handleRenameClick,
      handleRenameChat,
      handleKeyDown,
      bgColor,
      hoverBgColor,
      borderColor,
      isSHLoading,
      isGeneratingLink,
      newName,
      dispatch,
      router,
      selectedDocs,
      clearDocs,
    ],
  );
  const renderRoute = useCallback(
    (route: IRoute, key: number) => {
      if (route.invisible) return null;
      if (route.collapse) {
        return (
          <AccordionRoot defaultValue={['a']} collapsible key={key}>
            <Flex w="100%" justifyContent="space-between">
              <AccordionItem value={route.name} disabled border="none" mb="14px">
                <AccordionItemTrigger display="flex" alignItems="center" mb="4px" justifyContent="center" _hover={{ bg: 'unset' }} _focus={{ boxShadow: 'none' }} borderRadius="8px" w="100%" py="0px" ms={0}>
                  {route.icon ? (
                    <Flex align="center" justifyContent="space-between" w="100%">
                      <HStack gap={activeRoute(route.path.toLowerCase()) ? '22px' : '26px'}>
                        <Flex w="100%" alignItems="center" justifyContent="center">
                          <Box color={route.disabled ? gray : activeRoute(route.path.toLowerCase()) ? activeIcon : inactiveColor} me="12px" mt="6px">
                            {route.icon}
                          </Box>
                          <Text cursor="not-allowed" me="auto" color={route.disabled ? gray : activeRoute(route.path.toLowerCase()) ? activeColor : 'gray.500'} fontWeight="semibold" fontSize="sm">
                            {route.name}
                          </Text>
                        </Flex>
                      </HStack>
                    </Flex>
                  ) : (
                    <Flex pt="0px" pb="10px" alignItems="center" w="100%">
                      <HStack gap={activeRoute(route.path.toLowerCase()) ? '22px' : '26px'} ps="32px">
                        <Text cursor="not-allowed" me="auto" fontWeight="500" fontSize="sm">
                          {route.name}
                        </Text>
                      </HStack>
                      {/* <AccordionIcon ms="auto" color={route.disabled ? gray : 'gray.500'} /> */}
                    </Flex>
                  )}
                </AccordionItemTrigger>
                <AccordionItemContent py="0px" ps="8px">
                  <List.Root>
                    {route.items?.map((item, index) => (
                      <List.Item ms="28px" display="flex" alignItems="center" mb="10px" key={index} cursor="not-allowed">
                        <Icon w="6px" h="6px" me="8px" as={CircleIcon} color={item.disabled ? gray : activeIcon} />
                        <Text color={item.disabled ? gray : activeRoute(item.path.toLowerCase()) ? activeColor : inactiveColor} fontWeight={activeRoute(item.path.toLowerCase()) ? 'bold' : 'normal'} fontSize="sm">
                          {item.name}
                        </Text>
                      </List.Item>
                    ))}
                  </List.Root>
                </AccordionItemContent>
              </AccordionItem>
              <Link href="https://Mazik-ui.com/ai-template" mt="6px">
                <Badge display={{ base: 'flex', lg: 'none', xl: 'flex' }} colorScheme="brand" borderRadius="25px" color="brand.500" textTransform="none" letterSpacing="0px" px="8px">
                  PRO
                </Badge>
              </Link>
            </Flex>
          </AccordionRoot>
        );
      }
      // Non-collapsible route
      return (
        <Flex key={`route-${key}`}>
          {route.icon ? (
            <Flex align="center" justifyContent="space-between" w="100%" maxW="100%" mb="0px">
              <HStack w="100%" maxW="100%" gap={activeRoute(route.path.toLowerCase()) ? '22px' : '26px'}>
                {route.name === 'Chat' && (
                  <Flex direction="column" pt="15px" pb="5px" overflowX="hidden" w="100%" pos="relative">
                    {sessions.length > 0 ? (
                      sortGroupedChats(Object.entries(groupedByDate)).map(([groupName, groupSessions], groupIndex) => {
                        // Sort sessions within each group by date (newest first)
                        const sortedSessions = groupSessions.sort((a, b) => b._ts - a._ts);
                        // Create unique key for group
                        const groupKey = `group-${groupIndex}-${groupName.replace(/\\s+/g, '-')}`;
                        return (
                          <Box key={groupKey} mb={4}>
                            <Text fontSize="xs" color={isMonthYearGroup(groupName) ? 'black' : 'black'} fontWeight={isMonthYearGroup(groupName) ? 'semibold' : 'medium'} mb={0}>
                              {groupName}
                            </Text>
                            <VStack gap={0} align="stretch">
                              {sortedSessions.map((session, sessionIndex) => renderSessionItem(session))}
                            </VStack>
                          </Box>
                        );
                      })
                    ) : (
                      <Text fontSize="sm" p={2} color={'gray.500'}>
                        No chat history available.
                      </Text>
                    )}
                  </Flex>
                )}
              </HStack>
            </Flex>
          ) : (
            <ListItem ms={0} cursor="not-allowed" opacity="0.4">
              <Flex ps="32px" alignItems="center" mb="8px">
                <Text color={route.disabled ? gray : activeRoute(route.path.toLowerCase()) ? activeColor : inactiveColor} fontWeight="500" fontSize="xs">
                  {route.name}
                </Text>
              </Flex>
            </ListItem>
          )}
        </Flex>
      );
    },
    [activeRoute, gray, activeIcon, activeColor, inactiveColor, sessions, renderSessionItem, groupedByDate],
  );
  return (
    <>
      {props.routes.map((route, index) => renderRoute(route, index))}
      <ChatShareModal isOpen={isModalOpen} onClose={() => dispatch(closeShareModal())} sessionChatId={chatId} generateShareLink={generateShareLink} onCopyLink={() => dispatch(copyShareLink())} shareLink={shareLink} isGeneratingLink={isGeneratingLink} />
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          if (!isHandlingActionRef.current) {
            if (!confirmButtonClickedRef.current && pendingSessionId) {
              setTimeout(() => {
                handleCancelAndClearDocs();
              }, 0);
            }
            confirmButtonClickedRef.current = false;
          }
        }}
        onConfirm={() => {
          confirmButtonClickedRef.current = true;
          handleConfirmKeepDocs();
        }}
        title="Switch Session"
        description={`You have selected documents. Do you want to keep them while switching to "${pendingSessionName}"`}
        confirmText="Yes, Keep Current Documents"
        cancelText="No, Clear Selection"
        variant="default"
      />
    </>
  );
}
export default SidebarLinks;
