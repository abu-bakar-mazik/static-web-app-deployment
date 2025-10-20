'use client';
/* eslint-disable */
// Chakra Imports
import { Box, Flex, HStack, Link, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { isWindowAvailable } from '@/utils/navigation';
import { useChatModel } from '@/hooks/GetModel';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import Brand from '@/components/sidebar/components/Brand';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowDown01Icon, Cancel01Icon, CheckmarkCircle01Icon, Loading03Icon, Menu01Icon, MenuSquareIcon, Message02Icon } from 'hugeicons-react';
import { useColorModeValue } from '../ui/color-mode';
import { Button } from '../ui/button';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../ui/menu';
export default function AdminNavbar(props: { isHovered: boolean; openMenu: () => void; secondary: boolean; brandText: string; logoText: string; onOpen: (...args: any[]) => any; setApiKey: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { models, selectedModel, handleModelChange } = useChatModel();
  // const dummyModels = ['gpt-4o', 'gpt-4o-mini', 'claude-3', 'gemini-pro'];
  const { isAuthenticated } = useMsalAuthHelper();
  useEffect(() => {
    isWindowAvailable() && window.addEventListener('scroll', changeNavbar);
    return () => {
      isWindowAvailable() && window.removeEventListener('scroll', changeNavbar);
    };
  });
  const { secondary, isHovered, openMenu } = props;
  let mainText = useColorModeValue('navy.700', 'white');
  let navbarFilter = 'none';
  let navbarBackdrop = 'blur(20px)';
  let navbarShadow = '0 0 35px -10px rgba(0,0,0,.35)';
  let navbarBg = useColorModeValue('rgb(200,209,229,0.3)', 'rgba(11,20,55,0.5)');
  let navbarBorder = 'rgba(255,255,255,0.5)';
  let secondaryMargin = '0px';
  const changeNavbar = () => {
    if (isWindowAvailable() && window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };
  return (
    <Box pos={'relative'} zIndex={99} boxShadow={navbarShadow} bg={navbarBg} filter={navbarFilter} backdropFilter={navbarBackdrop} backgroundPosition="center" backgroundSize="cover" borderStyle="solid" transitionDelay="0s, 0s, 0s, 0s" transitionDuration=" 0.25s, 0.25s, 0.25s, 0s" transition-property="box-shadow, background-color, filter, border" transitionTimingFunction="linear, linear, linear, linear" alignItems={{ xl: 'center' }} display={secondary ? 'block' : 'flex'} minH={{ base: '65px', lg: '75px' }} justifyContent={{ xl: 'center' }} lineHeight="1.1" mt={secondaryMargin} py={{ base: 2, lg: 3 }} px={{ base: 2, lg: '30px' }} w={{ base: '100%', xl: '100%' }} borderBottom="1px solid" borderBottomColor={navbarBorder}>
      <HStack w="100%">
        <HStack justifyContent="flex-start" w={{ base: '100%', md: 'initial' }}>
          <Link
            color={mainText}
            href="/"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="bold"
            fontSize="34px"
            p="0px"
            w={{ base: 'max-content', lg: '200px' }}
            maxW={{ base: '100%', lg: '200px' }}
            outline="none"
            _hover={{ color: mainText }}
            _active={{
              bg: 'inherit',
              transform: 'none',
              borderColor: 'transparent',
            }}
            _focus={{
              boxShadow: 'none',
            }}
          >
            <Brand />
          </Link>
          {isAuthenticated && (
            <>
              <MenuRoot>
                <MenuTrigger ml="auto" as={Button} bg="transparent" color="gray.600" fontWeight="normal" _hover={{ bg: 'transparent', boxShadow: 'none' }} _focus={{ bg: 'transparent', boxShadow: 'none', outline: 'none' }} _focusVisible={{ bg: 'transparent', boxShadow: 'none', outline: 'none' }} _active={{ bg: 'transparent', boxShadow: 'none' }} px={{ base: 1, lg: 2 }} fontSize={{ base: 13, sm: 'sm', lg: "md" }}>
                  {selectedModel || 'Select Model'}
                  <ArrowDown01Icon size={18} />
                </MenuTrigger>
                <MenuContent p={0} overflow={'hidden'}>
                  {models.length > 0 ? (
                    models.map((model) => (
                      <MenuItem value={model} py={4} _hover={{ bg: 'blue.300', color: 'white' }} fontSize="sm" bg={'transparent'} key={model} onClick={() => handleModelChange(model)}>
                        {model} {selectedModel === model && <CheckmarkCircle01Icon size={20} color="green" style={{ marginLeft: 'auto' }} />}
                      </MenuItem>
                    ))
                  ) : (
                    <Text px={4} py={2}>
                      No models available
                    </Text>
                  )}
                </MenuContent>
              </MenuRoot>
              <Flex justifyContent="space-between" alignItems="center" display={{ base: 'flex', sm: 'none' }}>
                <Button aria-label="Toggle Sidebar" w={8} minW={8} p={0} minH={8} borderRadius="full" h={8} onClick={openMenu}>
                  {!isHovered ? <MenuSquareIcon style={{ width: 16, height: 16 }} /> : <Cancel01Icon style={{ width: 14, height: 14 }} />}
                </Button>
              </Flex>
            </>
          )}
        </HStack>
        {!pathname?.includes('/batch') && isAuthenticated && (
          <>
            <Button onClick={() => router.push('/batch')} display={{ base: 'none', md: 'flex' }} py={3} h="auto" aria-label="Batch Processing" justifyContent={'flex-end'} alignItems="center" ml="auto">
              <Loading03Icon style={{ width: 24, height: 24 }} />
              <Text fontSize={12} fontWeight="400">
                Go to Batch Prompting
              </Text>
            </Button>
          </>
        )}
      </HStack>
    </Box>
  );
}
