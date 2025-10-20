'use client';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { Box, Button, Center, Image, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function Logout() {
  const router = useRouter();
  const { handleLogin, handleLogout, isAuthenticated, isInitialized } = useMsalAuthHelper();
  const [hasTriggeredLogout, setHasTriggeredLogout] = useState(false);
  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated && !hasTriggeredLogout) {
      setHasTriggeredLogout(true);
      handleLogout();
    } else if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, handleLogout, router, isInitialized, hasTriggeredLogout]);
  return (
    <Center w="100%" p={2} h="100%">
      <Box backdropFilter="blur(200px)" bg="linear-gradient(140deg, #bee3f8 0%, #f7fafc 100%)" h="100%" borderRadius="12px" w="100%" alignItems="center" display="flex" justifyContent="center">
        <VStack alignItems="center">
          <Image
            src={'/img/logo.png'}
            alt="Company Logo"
            h="auto"
            w={{ base: '120px', lg: '140px' }}
            maxH="75px"
            objectFit="contain"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = '/img/logo.png';
            }}
            mb={4}
          />
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            {isAuthenticated ? 'Signing you out...' : 'You have been signed out!'}
          </Text>
          <Text fontSize="lg" mb="4">
            {isAuthenticated ? 'Please wait while we sign you out securely' : 'Redirecting to login page...'}
          </Text>
          {!isAuthenticated && (
            <Button className="sign-in" onClick={handleLogin} fontWeight="normal">
              Sign in
            </Button>
          )}
        </VStack>
      </Box>
    </Center>
  );
}
