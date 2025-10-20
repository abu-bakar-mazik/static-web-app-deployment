'use client';
import { ReactNode } from 'react';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { Center, Spinner, Box, Text } from '@chakra-ui/react';
interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}
export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { isInitialized, inProgress, isAuthenticated, isFullyAuthenticated } = useMsalAuthHelper();
  if (!isInitialized) {
    return (
      <Center w="100%" p={2} h="100vh">
        <Box backdropFilter="blur(200px)" bg="linear-gradient(140deg, #bee3f8 0%, #f7fafc 100%)" h="100%" borderRadius="12px" w="100%" alignItems="center" display="flex" justifyContent="center">
          <Center flexDirection="column">
            <Spinner size="xl" color="blue.500" borderWidth="4px" animationDuration="0.65s" mb={4} />
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              Initializing Application...
            </Text>
            <Text fontSize="lg" mb="4">
              Please wait while we set up your authentication
            </Text>
          </Center>
        </Box>
      </Center>
    );
  }
  if (inProgress !== 'none') {
    return (
      <Center w="100%" p={2} h="100vh">
        <Box backdropFilter="blur(200px)" bg="linear-gradient(140deg, #bee3f8 0%, #f7fafc 100%)" h="100%" borderRadius="12px" w="100%" alignItems="center" display="flex" justifyContent="center">
          <Center flexDirection="column">
            <Spinner size="xl" color="blue.500" borderWidth="4px" animationDuration="0.65s" mb={4} />
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              Processing Authentication...
            </Text>
            <Text fontSize="lg" mb="4">
              Please wait while we verify your credentials
            </Text>
          </Center>
        </Box>
      </Center>
    );
  }
  if (requireAuth && !isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  return <>{children}</>;
}
