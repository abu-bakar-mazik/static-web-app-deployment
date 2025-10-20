import React from 'react';
import { Flex, Image, Spinner } from '@chakra-ui/react';
import { useLogo } from '@/hooks/logoQuery';

export default function SidebarBrand() {
  const { logoWithCache, isLogoFetching } = useLogo();
  const displayUrl = logoWithCache || '/img/logo.png';

  if (isLogoFetching) {
    return (
      <Flex alignItems="center" justifyContent="center" minH="60px" maxH="60px" w="100%">
        <Spinner size="md" color="blue.500" thickness="3px" />
      </Flex>
    );
  }

  return (
    <Flex alignItems="flex-start" flexDirection="column" minH={{base: "40px", lg: '60px'}} maxH={{base: "40px", lg: '60px'}} justifyContent="center" px={{base: 2, lg: 4}} w="100%">
      <Image
        src={displayUrl}
        alt="Company Logo"
        h="auto"
        w={{base: "120px", lg: '160px'}}
        maxH="75px"
        objectFit="contain"
        // fallback={
        //   <Flex w={{base: "120px", lg: '160px'}} h="40px" alignItems="center" justifyContent="center">
        //     <Spinner size="sm" color="blue.500" />
        //   </Flex>
        // }
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = '/img/logo.png';
        }}
      />
    </Flex>
  );
}
