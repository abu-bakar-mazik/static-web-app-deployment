'use client';
import { useRecipe, Card as ChakraCard, RecipeVariantProps } from '@chakra-ui/react';
import * as React from 'react';
import { CardRecipe } from '../styling/card.recipe';

type CardVariantProps = RecipeVariantProps<typeof CardRecipe>;
type ChakraCardRootProps = React.ComponentProps<typeof ChakraCard.Root>;
export interface CardRootProps extends ChakraCardRootProps, CardVariantProps {}
export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(function CardRoot(props, ref) {
  const { children, visual, size, spacing, footerAlign, ...restProps } = props;
  const recipe = useRecipe({ key: 'card' });
  const styles = recipe({ visual, size, spacing, footerAlign });

  return (
    <ChakraCard.Root ref={ref} css={styles} {...restProps}>
      {children}
    </ChakraCard.Root>
  );
});
