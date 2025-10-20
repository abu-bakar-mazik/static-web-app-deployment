'use client';
import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Flex, IconButton, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { renderThumb, renderTrack, renderView } from '@/components/scrollbar/Scrollbar';
import { IRoute } from '@/types/navigation';
import { isWindowAvailable } from '@/utils/navigation';
import SidebarWrapper from './components/SidebarWrapper';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useChatTranslate } from '@/hooks/chat';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedDocs } from '@/hooks/SelectedDocs';
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, Logout01Icon, Menu11Icon, Message02Icon } from 'hugeicons-react';
import { DrawerBackdrop, DrawerBody, DrawerCloseTrigger, DrawerContent, DrawerRoot, DrawerTrigger } from '../ui/drawer';
import { useColorModeValue } from '../ui/color-mode';
import { Tooltip } from '../ui/tooltip';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { ConfirmationDialog } from '../confirmationDialog';
import { toaster } from '../ui/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setFileName } from '@/redux/slices/chatHistorySlice';
import { BadgeRoot } from '../ui/badge';
import { useGetAllSessionsQuery } from '@/redux/slices/sessionSlice';
export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  isHovered: boolean;
  openMenu: () => void;
  [x: string]: any;
}
export interface RespSidebarProps extends PropsWithChildren {
  routes: IRoute[];
}
function Sidebar(props: SidebarProps) {
  const { selectedDocs, clearDocs } = useSelectedDocs();
  const { routes, setApiKey, isHovered, openMenu } = props;
  const variantChange = '0.2s linear';
  const shadow = useColorModeValue('14px 17px 40px 4px rgba(112, 144, 176, 0.08)', 'unset');
  const sidebarBg = useColorModeValue('rgba(233,238,248,0.2)', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const { isAuthenticated, handleLogout } = useMsalAuthHelper();
  const { userAccount, userId } = useAuth();
  const [targetRoute, setTargetRoute] = useState('');
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const confirmButtonClickedRef = useRef(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const shouldShowSidebar = pathname === '/' || pathname?.includes('documents') || pathname?.includes('chat');
  const { goToPreviousRoute, isNavigating } = useChatTranslate();
  const { fileName } = useSelector((state: RootState) => state.chatHistory);
  const { data: sessions = [] } = useGetAllSessionsQuery(userId ?? '', {
    skip: !userId,
  });
  const isRouteDisabled = (route: IRoute) => {
    return isNavigating || (selectedDocs.length > 1 && route.path === '/');
  };
  const updateFileNameInRedux = () => {
    if (selectedDocs.length > 0) {
      const newFileName = selectedDocs.length === 1 ? selectedDocs[0].name : `Multiple Files (${selectedDocs.length})`;
      dispatch(setFileName(newFileName));
    }
  };
  const handleRouteChange = useCallback(
    (path: string) => {
      if (isNavigating) return;
      const hasPreviousRoute = sessionStorage.getItem('previousRoute') !== null;
      const isChatRoute = path === '/' || path.includes('/chat');
      const currentPath = window.location.pathname;
      const isComingFromDocumentsPage = !currentPath.includes('/chat') && currentPath !== '/' && (path === '/' || path.includes('/chat'));
      const isComingFromSessionToRoot = currentPath.includes('/chat') && path === '/';
      if (selectedDocs.length > 0 && hasPreviousRoute && isChatRoute && fileName) {
        setTargetRoute(path);
        setShowDocumentDialog(true);
        return;
      } else if (selectedDocs.length > 0 && isComingFromDocumentsPage && !fileName) {
        updateFileNameInRedux();
        toaster.create({
          title: 'File-Based Responses Enabled',
          description: 'No file was attached before. Now, responses will be based on your uploaded file.',
          type: 'info',
          duration: 3000,
        });
      } else if (selectedDocs.length > 0 && isComingFromSessionToRoot) {
        updateFileNameInRedux();
      }
      goToPreviousRoute(path);
    },
    [goToPreviousRoute, selectedDocs.length, isNavigating, fileName],
  );
  return (
    <>
      <Box pos={{ base: isHovered ? 'absolute' : 'relative', sm: isHovered ? 'absolute' : 'relative', xl: 'relative' }} display="inline-block" width={{ base: isHovered ? '260px' : '0', sm: isHovered ? '260px' : '60px' }} transition="width 0.2s" backgroundColor="rgba(255,255,255,0.25)" boxShadow="0 0 25px rgba(0, 0, 0, .1)" height="100vh" py={4} px={{ base: isHovered ? 2.5 : 0, sm: 2.5 }} zIndex={{ base: isHovered ? 1000 : 101, sm: isHovered ? 1000 : 101, xl: 101 }} borderRight="1px solid" borderRightColor="rgba(255,255,255,0.5)" visibility={{ base: isHovered ? 'visible' : 'hidden', sm: 'visible' }}>
        <Flex justifyContent="space-between" alignItems="center" pos="absolute" zIndex="1" right="-10px" top="72px" display={{ base: 'none', sm: 'flex' }}>
          <Button aria-label="Toggle Sidebar" w={6} minW={6} p={0} minH={6} borderRadius="full" h={6} onClick={openMenu}>
            {!isHovered ? <ArrowRight01Icon style={{ width: 14, height: 14 }} /> : <ArrowLeft01Icon style={{ width: 14, height: 14 }} />}
          </Button>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" pos="absolute" zIndex="1" right="-15px" top="67px" display={{ base: isHovered ? 'flex' : 'none', sm: 'none' }}>
          <Button aria-label="Toggle Sidebar" w={8} minW={8} p={0} minH={8} borderRadius="full" h={8} onClick={openMenu}>
            <Cancel01Icon style={{ width: 14, height: 14 }} />
          </Button>
        </Flex>
        <Button display="flex" color={'white'} fontSize={'sm'} fontWeight="500" letterSpacing="0.5px" borderRadius="full" minH="40px" onClick={() => (selectedDocs.length < 2 ? (window.location.href = '/') : (window.location.href = '/batch'))} w="100%" p={2} disabled={isNavigating} my={'6px'}>
          <Message02Icon style={{ width: 22, height: 22 }} />
          {isHovered && (
            <Text fontSize={{ base: 14, sm: 12, xl: 14 }} fontWeight="400" ml={2}>
              New Chat
            </Text>
          )}
        </Button>
        <Box width="100%" h={isAuthenticated ? 'calc(100% - 161px)' : 'calc(100% - 98px)'} overflowY="auto" overflowX="hidden">
          <Box as="nav" display="flex" flexDirection="column" alignItems="flex-start" borderTop="1px solid" borderTopColor="#e4eaed" pt={3} mt={4}>
            {routes.map((route, key) => {
              const isActive = pathname === route.path;
              const disabled = isRouteDisabled(route);
              return (
                <Box key={key} display="flex" alignItems="center" w="100%" mb={2} flexDir="column">
                  <Tooltip closeOnScroll content={route.name}>
                    <Button visual="ghost" disabled={disabled} onClick={() => handleRouteChange(route.path)} display="flex" px={2} py={2} h="auto" aria-label={`${route.name} Page`} w="100%" justifyContent={isHovered ? 'flex-start' : 'center'} color={isActive ? 'blue.400' : 'gray.600'} _hover={{ color: 'blue.400' }}>
                      {route.path === '/documents' && selectedDocs.length > 0 && (
                        <BadgeRoot colorPalette="blue" borderRadius="full" pos={'absolute'} right="0.5px" top="-2px" height="20px" width="20px" background="gradients.primary" color="white" justifyContent="center" fontSize="10px">
                          {selectedDocs.length}
                        </BadgeRoot>
                      )}
                      {route.icon}
                      {isHovered && (
                        <Text fontSize={{ base: 14, sm: 14, xl: 15 }} fontWeight="medium" ml={3}>
                          {route.name}
                        </Text>
                      )}
                    </Button>
                  </Tooltip>
                  {route.children && isHovered && (
                    <Box key={key} display="flex" flexDir="column" alignItems="center" w="100%" mb={2} mt={2} pl={4}>
                      {route.children.map((child, index) => {
                        const isActiveChild = pathname === child.path;
                        return (
                          <Box key={index} display="flex" flexDir="column" alignItems="center" w="100%">
                            <Button onClick={() => router.push(child.path)} display="flex" px={2} py={2} h="auto" _hover={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} _focus={{ bg: 'transparent', color: 'blue.400', boxShadow: 'none' }} _focusVisible={{ bg: 'transparent', color: 'blue.400' }} bg="transparent" color={isActiveChild ? 'blue.400' : 'gray.700'} aria-label={`${child.name} Page`} w="100%" justifyContent={isHovered ? 'flex-start' : 'center'}>
                              {child.icon}
                              <Text fontSize={{ base: 14, sm: 14, xl: 15 }} fontWeight="400" ml={3}>
                                {child.name}
                              </Text>
                            </Button>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
        <VStack alignItems="flex-start">
          <Flex mt="auto" alignItems="center" w="100%" bottom="0" height={'54px'}>
            <Tooltip closeOnScroll content={userAccount?.name}>
              <Flex alignItems="center">
                <Avatar bg={'gradients.primary'} w="40px" h="40px" size="xs" variant="solid" name={isAuthenticated ? userAccount?.name : ''} />
                {isHovered && (
                  <>
                    <Text color={textColor} w="calc(100% - 80px)" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" fontSize="sm" fontWeight="semibold" ml="10px">
                      {userAccount?.name}
                    </Text>
                  </>
                )}
              </Flex>
            </Tooltip>
          </Flex>
          {isAuthenticated && (
            <HStack>
              <Tooltip closeOnScroll content="Logout">
                <Button visual="transparent" alignItems="center" onClick={handleLogout} px={0} color={textColor} _hover={{ bg: 'transparent', color: 'blue.400' }} _focus={{ bg: 'transparent', color: 'blue.400', outline: 'none' }} _focusVisible={{ bg: 'transparent', color: 'blue.400', outline: 'none' }}>
                  <Box border="1px solid" borderColor={'#d1d7db'} borderRadius="full" p={2.5} color="inherit" transition="0.1s all" minW="40px" minH="40px" _hover={{ bg: 'gradients.primary', color: 'white' }} _focus={{ bg: 'gradients.primary', color: 'white' }} _focusVisible={{ bg: 'gradients.primary', color: 'white' }}>
                    <Logout01Icon size={20} />
                  </Box>
                  {isHovered && (
                    <Text fontSize="sm" fontWeight="medium">
                      Logout
                    </Text>
                  )}
                </Button>
              </Tooltip>
            </HStack>
          )}
        </VStack>
      </Box>
      {shouldShowSidebar && (
        <Box display={{ base: 'none', lg: 'block' }} minH="100vh" pos="relative" w="285px" h="100vh">
          <Box bg={sidebarBg} transition={variantChange} h="100%" minH="100%" overflow="hidden" boxShadow={shadow} borderRight="1px solid rgba(255,255,255,0.25)" filter={{ base: props.isHovered ? 'blur(10px)' : 'blur(0)', xl: 'blur(0)' }}>
            <SidebarWrapper setApiKey={setApiKey} routes={routes} />
          </Box>
        </Box>
      )}
      <ConfirmationDialog
        isOpen={showDocumentDialog}
        onClose={() => {
          if (confirmButtonClickedRef.current) {
            updateFileNameInRedux();
            goToPreviousRoute(targetRoute);
            toaster.create({
              title: 'Keeping selected documents',
              description: 'Navigated while maintaining your document selection.',
              type: 'info',
              duration: 3000,
            });
          } else {
            clearDocs();
            let sessionId = null;
            const previousRoute = sessionStorage.getItem('previousRoute');
            if (previousRoute && previousRoute.includes('/chat/')) {
              sessionId = previousRoute.split('/').pop();
            }
            const targetSession = sessions.find((session) => session.chat_id === sessionId);
            if (targetSession?.have_file) {
              dispatch(setFileName(targetSession?.filename));
            } else {
              dispatch(setFileName(''));
            }
            goToPreviousRoute(targetRoute);
            toaster.create({
              title: 'Cleared document selection',
              description: 'Navigated after clearing your document selection.',
              type: 'info',
              duration: 3000,
            });
          }
          confirmButtonClickedRef.current = false;
          setShowDocumentDialog(false);
          setTargetRoute('');
        }}
        onConfirm={() => {
          confirmButtonClickedRef.current = true;
        }}
        title="Document Selection"
        description="You have documents selected. Do you want to keep them when navigating?"
        confirmText="Yes, Keep Documents"
        cancelText="No, Clear Documents"
        variant="default"
      />
    </>
  );
}
export function SidebarResponsive(props: RespSidebarProps) {
  let sidebarBackgroundColor = useColorModeValue('white', 'navy.800');
  let menuColor = useColorModeValue('gray.400', 'white');
  const [open, setOpen] = useState(false);
  const { routes } = props;
  return (
    <Flex display={{ sm: 'flex', xl: 'none' }} alignItems="center" className="res-menu">
      {/* <Flex w="max-content" h="max-content" onClick={onOpen}>
        <Icon color={menuColor} my="auto" w="20px" h="20px" me="10px" _hover={{ cursor: 'pointer' }}><Menu11Icon /></Icon>
      </Flex> */}
      <DrawerRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
        <DrawerBackdrop />
        <DrawerTrigger asChild>
          <Button visual="outline" size="sm" w="max-content" h="max-content">
            <Menu11Icon size={20} />
          </Button>
        </DrawerTrigger>
        <DrawerContent
          offset="4"
          rounded="md"
          w="285px"
          maxW="285px"
          ms={{
            sm: '16px',
          }}
          my={{
            sm: '16px',
          }}
          borderRadius="16px"
          bg={sidebarBackgroundColor}
        >
          <DrawerCloseTrigger />
          <DrawerBody w="100%" px="0rem" pb="0">
            {/* <Scrollbars autoHide renderTrackVertical={renderTrack} renderThumbVertical={renderThumb} renderView={renderView}> */}
            <SidebarWrapper routes={routes} />
            {/* </Scrollbars> */}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  );
}
export default Sidebar;
