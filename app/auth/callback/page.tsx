// app/auth/callback/page.tsx
'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Spinner } from '@chakra-ui/react';
import useMsalAuthHelper from '@/hooks/useMsalAuth';

const CallbackPage = () => {
  const router = useRouter();
  const hasHandledRedirect = useRef(false);

  const { handleAuthActionRedirect, inProgress, isAuthenticated } = useMsalAuthHelper();

  useEffect(() => {
    if (inProgress === 'none' && !hasHandledRedirect.current) {
      handleAuthActionRedirect();
      hasHandledRedirect.current = true; // Set the ref to true after handling the redirect
    }
    if (inProgress === 'none' && !isAuthenticated) {
      router.push('/login');
    }
  }, [inProgress, handleAuthActionRedirect, isAuthenticated, router]);

  return (
    <Suspense fallback={<LoadingComponent />}>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
        {inProgress ? <Text fontSize="xl" mb={4}>
          <Spinner color='blue.400' />
        </Text> : null}
      </Box>
    </Suspense>
  );
};

const LoadingComponent = () => (
  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
    <Spinner size="xl" />
    <Text>Loading...</Text>
  </Box>
);

export default CallbackPage;
