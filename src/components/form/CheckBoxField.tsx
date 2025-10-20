'use client';

import { Box, Text, Icon, HStack, CheckboxLabel } from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { useEffect, useRef } from 'react';

export default function Default(props: { id?: string; label?: string; labelSize?: string | {};  labelFontWeight?: string; extra?: string; variant?: string; gap?: string; onChange?: (e: { checked: boolean }) => void; [x: string]: any }) {
  const { id, extra, label = '', labelSize, icon, variant, gap, order, labelFontWeight, onChange, ...rest } = props;
  return (
    <Checkbox visual="simple" onCheckedChange={onChange} gap={gap} {...rest} >
      <HStack>
        {icon && <Icon fontSize={22}>{icon}</Icon>}
        <CheckboxLabel display="flex" ms="0px" mb={extra ? '0.25rem' : ''} fontSize={labelSize || 'sm'} _hover={{ cursor: 'pointer' }} lineHeight={'1.4'} mr="0" textOverflow="ellipsis" style={{ lineClamp: 2, display: '-webkit-box' }} overflow="hidden" fontWeight={labelFontWeight}>
          {label}
        </CheckboxLabel>
      </HStack>
    </Checkbox>
  );
}
