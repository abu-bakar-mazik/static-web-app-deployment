'use client';
import { useEffect, useState } from 'react';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { Center, Spinner, Box, Text, Button, VStack, Image } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const router = useRouter();
  const { handleLogin, isAuthenticated, inProgress, handleAuthActionRedirect, isInitialized, isFullyAuthenticated } = useMsalAuthHelper();
  const [hasHandledRedirect, setHasHandledRedirect] = useState(false);
  const [shouldAutoLogin, setShouldAutoLogin] = useState(false);
  useEffect(() => {
    if (isInitialized && !hasHandledRedirect) {
      handleAuthActionRedirect();
      setHasHandledRedirect(true);
    }
  }, [isInitialized, hasHandledRedirect, handleAuthActionRedirect]);
  useEffect(() => {
    if (isInitialized && hasHandledRedirect) {
      const isFromLogout = sessionStorage.getItem('loggedOut') === 'true';
      if (!isFromLogout && !isAuthenticated && inProgress === 'none') {
        setShouldAutoLogin(true);
      }
      sessionStorage.removeItem('loggedOut');
    }
  }, [isInitialized, hasHandledRedirect, isAuthenticated, inProgress]);
  useEffect(() => {
    if (shouldAutoLogin) {
      const timer = setTimeout(() => {
        handleLogin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoLogin, handleLogin]);
  useEffect(() => {
    if (isFullyAuthenticated) {
      router.push('/');
    }
  }, [isFullyAuthenticated, router]);
  if (!isInitialized) {
    return null;
  }
  if (!shouldAutoLogin && !isAuthenticated && inProgress === 'none') {
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
              Welcome to Bloomsbury
            </Text>
            <Text fontSize="lg" mb="4">
              Sign in with Microsoft to access your account
            </Text>
            <Button className="sign-in" onClick={handleLogin} fontWeight="normal" colorScheme="blue" size="lg">
              Sign in with Microsoft
            </Button>
          </VStack>
        </Box>
      </Center>
    );
  }
  return (
    <Center w="100%" p={2} h="100%">
      <Box backdropFilter="blur(200px)" bg="linear-gradient(140deg, #bee3f8 0%, #f7fafc 100%)" h="100%" borderRadius="12px" w="100%" alignItems="center" display="flex" justifyContent="center">
        <Center flexDirection="column">
          <Spinner size="xl" color="blue.500" borderWidth="4px" animationDuration="0.65s" mb={4} />
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            {isAuthenticated ? 'Signing you in... Almost there!' : 'You are not logged in!'}
          </Text>
          <Text fontSize="lg" mb="4">
            {isAuthenticated ? `Just a moment, we're signing you in...` : 'Redirecting to Microsoft login...'}
          </Text>
        </Center>
      </Box>
    </Center>
  );
}
