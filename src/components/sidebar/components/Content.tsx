'use client';
// chakra imports
import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import Links from '@/components/sidebar/components/Links';
import { PropsWithChildren } from 'react';
import { IRoute } from '@/types/navigation';
import DocUpload from '@/components/docUpload/docUpload';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { usePathname } from 'next/navigation';
import { useColorModeValue } from '@/components/ui/color-mode';
interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}
function SidebarContent(props: SidebarContent) {
  const { routes } = props;
  const borderColor = useColorModeValue('rgba(232,238,241,0.75)', 'whiteAlpha.300');
  const { isAuthenticated } = useMsalAuthHelper();
  const pathname = usePathname();
  const gray = useColorModeValue('gray.500', 'white');
  return (
    <Flex direction="column" height="100%" maxW="100%">
      {isAuthenticated && (
        <>
          <Text display="flex" fontWeight="bold" borderBottom="1px solid" borderColor={borderColor} justifyContent="center" px={4} py={3}>
            {pathname === '/' || pathname?.includes('chat') ? 'Chats' : pathname?.includes('documents') ? 'Upload File' : null}
          </Text>
          <Box width={'calc(100% + 15px)'} height={'100%'} overflowY={'auto'} borderTop="1px solid" borderTopColor="#f3f8ff" px={4}>
            {(pathname === '/' || pathname?.includes('chat')) && (
              <Stack direction="column" mb="auto" mt="8px" h="calc(100% - 8px)">
                <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }} h="100%">
                  <Links routes={routes} />
                </Box>
              </Stack>
            )}
            {pathname?.includes('documents') && <DocUpload />}
          </Box>
        </>
      )}
    </Flex>
  );
}
export default SidebarContent;
