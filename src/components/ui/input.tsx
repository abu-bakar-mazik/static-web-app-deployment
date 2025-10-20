'use client';
import type { InputProps, RecipeVariantProps } from '@chakra-ui/react';
import { useRecipe, Input as ChakraInput } from '@chakra-ui/react';
import * as React from 'react';
import { InputRecipe } from '../styling/input.recipe';

type InputVariantProps = RecipeVariantProps<typeof InputRecipe>
export interface InputRootProps extends InputProps, InputVariantProps {}

export const InputRoot = React.forwardRef<HTMLInputElement, InputRootProps>(function Input(props, ref) {
  const { visual, ...rest } = props;
  const recipe = useRecipe({ key: 'input' });
  const styles = recipe({ visual });

  return <ChakraInput ref={ref} css={styles} {...rest} />;
});
