'use client';
import type { ButtonProps as ChakraButtonProps, RecipeVariantProps } from '@chakra-ui/react';
import { AbsoluteCenter, Button as ChakraButton, Span, Spinner, useRecipe } from '@chakra-ui/react';
import * as React from 'react';
import { ButtonRecipe } from '../styling/button.recipe';

type ButtonVariantProps = RecipeVariantProps<typeof ButtonRecipe>
interface ButtonLoadingProps {
  loading?: boolean;
  loadingText?: React.ReactNode;
}
export interface ButtonProps extends ChakraButtonProps, ButtonLoadingProps, ButtonVariantProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { visual, loading, disabled, loadingText, children, ...rest } = props;
  const recipe = useRecipe({ key: 'button' });
  const styles = recipe({ visual });
  return (
    <ChakraButton css={styles} disabled={loading || disabled} ref={ref} {...rest}>
      {loading && !loadingText ? (
        <>
          <AbsoluteCenter display="inline-flex">
            <Spinner size="inherit" color="inherit" />
          </AbsoluteCenter>
          <Span opacity={0}>{children}</Span>
        </>
      ) : loading && loadingText ? (
        <>
          <Spinner size="inherit" color="inherit" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </ChakraButton>
  );
});
