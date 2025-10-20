'use client';
import { useColorModeValue } from '@/components/ui/color-mode';
import { InputRoot } from '@/components/ui/input';
import { InputGroup } from '@/components/ui/input-group';
import { Search02Icon } from 'hugeicons-react';
import * as React from 'react';
export function SearchDoc(props: { visual?: string; ref?: React.Ref<HTMLInputElement> | undefined; background?: string; children?: React.ReactElement; placeholder?: string; borderRadius?: string | number; disabled?: boolean; [x: string]: any }) {
  // Pass the computed styles into the `__css` prop
  const { visual, background, children, placeholder, ref, disabled, borderRadius, ...rest } = props;
  // Chakra Color Mode
  const searchIconColor = useColorModeValue('gray', 'white');
  const inputBg = useColorModeValue('rgb(200,209,229,0.3)', 'navy.900');
  const inputText = useColorModeValue('gray.700', 'gray.100');
  return (
    <InputGroup startOffset="0px" startElement={<Search02Icon color={searchIconColor} style={{width:"20px", height:"20px"}} />} w={{ base: '100%', sm: '200px', md: '244px' }} {...rest}>
      <InputRoot ref={ref} disabled={disabled} placeholder={placeholder} visual="searchDoc" bg={inputBg} h="50px" fontSize={{ base: 'xs', sm: 'xs', xl: 'sm' }} color={inputText} fontWeight="500" _placeholder={{ color: 'gray.400', fontWeight: 'normal', fontSize: { base: 'xs', sm: 'xs', xl: 'sm' } }} _focusVisible={{outline: 'none'}} borderColor={'#ebf0f3'} />
    </InputGroup>
  );
}
