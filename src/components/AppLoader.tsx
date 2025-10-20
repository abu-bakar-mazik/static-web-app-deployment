import { Box, Spinner, Text } from '@chakra-ui/react';
import React from 'react';

type Props = {};

const AppLoader = (props: Props) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" width="100%" bg="#ddf1ff" flexDirection="column" zIndex={9999}>
      <Spinner borderWidth="2px" animationDuration="0.65s" css={{ "--spinner-track-color": "colors.gray.200" }} color="#3965FF" w="35px" h="35px" mb={3} />
      <Text fontSize="sm" fontFamily="'Poppins', serif">
        Redirecting...
      </Text>
    </Box>
  );
};

export default AppLoader;
