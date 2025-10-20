import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { InputRoot } from './ui/input';
import { FieldRoot } from './ui/field';
interface InputWithLocalStateProps {
  id: string;
  value: string;
  onChangeCommitted: (value: string) => void;
  hasError?: string;
  placeholder: string;
  autoComplete: string;
  label?: string;
  width?: any;
  [x: string]: any;
}
export const InputWithLocalState = memo(({ id, value: initialValue, onChangeCommitted, hasError, placeholder, autoComplete, label, width, ...restProps }: InputWithLocalStateProps) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const previousValueRef = useRef(initialValue);
  useEffect(() => {
    if (initialValue !== previousValueRef.current) {
      setLocalValue(initialValue);
      previousValueRef.current = initialValue;
    }
  }, [initialValue]);
  const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);
  const handleBlur = useCallback(() => {
    if (localValue !== previousValueRef.current) {
      onChangeCommitted(localValue);
      previousValueRef.current = localValue;
    }
  }, [localValue, onChangeCommitted]);
  return (
    <FieldRoot id={id} label={label} invalid={!!hasError} errorText={hasError} w={width}>
      <InputRoot id={id} bg={'rgba(233,236,240,0.75)'} value={localValue} onChange={handleLocalChange} onBlur={handleBlur} borderColor={hasError ? 'red.500' : 'gray.200'} placeholder={placeholder} autoComplete={autoComplete} {...restProps} fontSize={{ base: '13px', sm: 'sm' }} />
    </FieldRoot>
  );
});
InputWithLocalState.displayName = 'InputWithLocalState';
