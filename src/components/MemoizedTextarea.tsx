import { Box, Text, Textarea } from '@chakra-ui/react';
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Delete02Icon } from 'hugeicons-react';
interface TextareaWithLocalStateProps {
  value: string;
  onChangeCommitted: (value: string) => void;
  index: number;
  promptId: string;
  hasError?: string;
  canDelete: boolean;
  onDelete: (index: number) => void;
  disabled: boolean;
}
export const TextareaWithLocalState = memo(({ value: initialValue, onChangeCommitted, index, promptId, hasError, canDelete, onDelete, disabled }: TextareaWithLocalStateProps) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const previousValueRef = useRef(initialValue);
  useEffect(() => {
    if (initialValue !== previousValueRef.current) {
      setLocalValue(initialValue);
      previousValueRef.current = initialValue;
    }
  }, [initialValue]);
  const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  }, []);
  const handleBlur = useCallback(() => {
    if (localValue !== previousValueRef.current) {
      onChangeCommitted(localValue);
      previousValueRef.current = localValue;
    }
  }, [localValue, onChangeCommitted]);
  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [onDelete, index]);
  return (
    <Box pos="relative" w="100%" overflow="hidden" borderRadius="6px">
      <Textarea bg="rgba(233,236,240,0.75)" rows={2} placeholder="Prompts" size={{ base: 'sm', sm: 'sm', xl: 'sm' }} borderRadius="6px" resize="none" minH="40px" value={localValue} display="flex" autoresize onChange={handleLocalChange} onBlur={handleBlur} borderColor={hasError ? 'red.500' : 'gray.200'} pr="2rem" disabled={disabled} />
      {hasError && (
        <Text color="red.500" fontSize="xs">
          {hasError}
        </Text>
      )}
      {canDelete && (
        <Button pos="absolute" right="0" aria-label="Delete Prompt" justifyContent="center" visual="red" onClick={handleDelete} minW="initial" w={8} h="100%" borderRadius={0} px={2} zIndex={1} top={0} disabled={disabled}>
          <Delete02Icon style={{ width: 18, height: 18 }} />
        </Button>
      )}
    </Box>
  );
});
TextareaWithLocalState.displayName = 'TextareaWithLocalState';
