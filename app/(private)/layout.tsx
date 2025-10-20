'use client';
import React, { ReactNode } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import Sidebar from '@/components/sidebar/Sidebar';
import Navbar from '@/components/navbar/NavbarAdmin';
import { getActiveRoute, getActiveNavbar } from '@/utils/navigation';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BatchProvider } from '@/context/BatchContext';
import '@/styles/App.css';
import { PrivateProvider } from '../providers/PrivateProvider';
import RouteConfig from '@/routes';
import { Toaster } from '@/components/ui/toaster';
import { BatchAutomationProvider } from '@/context/BatchAutomationContext';

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routes = RouteConfig();
  const [apiKey, setApiKey] = useState('');
  const { open, onOpen, onClose } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const shouldShowSidebar = pathname === '/' || pathname?.includes('/chat') || pathname?.includes('documents');
  useEffect(() => {
    const initialKey = localStorage.getItem('apiKey');
    if (initialKey?.includes('sk-') && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);
  const openMenu = () => {
    setIsHovered(!isHovered);
  };
  return (
    <PrivateProvider>
      <BatchProvider>
        <BatchAutomationProvider>
          <Toaster visual="subtle" />
          {pathname?.includes('register') || pathname?.includes('logout') ? (
            children
          ) : (
            <Box as="div" display="flex">
              <Sidebar isHovered={isHovered} openMenu={openMenu} setApiKey={setApiKey} routes={routes} />
              <Box
                overflow="hidden"
                position="relative"
                w={{
                  base: '100%',
                  lg: isHovered ? (shouldShowSidebar ? 'calc( 100% - 500px )' : 'calc( 100% - 260px )') : shouldShowSidebar ? 'calc( 100% - 260px )' : 'calc( 100% - 60px )',
                }}
                maxWidth={{
                  base: '100%',
                  lg: isHovered ? (shouldShowSidebar ? 'calc( 100% - 500px )' : 'calc( 100% - 260px )') : shouldShowSidebar ? 'calc( 100% - 260px )' : 'calc( 100% - 60px )',
                }}
                filter={{ base: isHovered ? 'blur(10px)' : 'blur(0)', xl: 'blur(0)' }}
                pointerEvents={{ base: isHovered ? 'none' : 'auto', xl: 'auto' }}
                transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
                transitionDuration=".2s, .2s, .35s"
                transitionProperty="top, bottom, width"
                transitionTimingFunction="linear, linear, ease"
              >
                <Navbar isHovered={isHovered} openMenu={openMenu} setApiKey={setApiKey} onOpen={onOpen} logoText={'Bloomsbury Dashboard'} brandText={getActiveRoute(routes, pathname)} secondary={getActiveNavbar(routes, pathname)} />
                <Box
                  mx="auto"
                  h={{
                    base: 'calc(100vh - 65px)',
                    md: 'calc(100vh - 67px)',
                    lg: 'calc(100vh - 85px)',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          )}
        </BatchAutomationProvider>
      </BatchProvider>
    </PrivateProvider>
  );
}
