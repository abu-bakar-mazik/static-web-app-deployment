'use client';
import type { BadgeProps, RecipeVariantProps } from '@chakra-ui/react';
import { useRecipe, Badge as ChakraBadge } from '@chakra-ui/react';
import * as React from 'react';
import { BadgeRecipe } from '../styling/badge.recipe';

type BadgeVariantProps = RecipeVariantProps<typeof BadgeRecipe>
export interface BadgeRootProps extends BadgeProps, BadgeVariantProps {}

export const BadgeRoot = React.forwardRef<HTMLInputElement, BadgeRootProps>(function Input(props, ref) {
  const { visual, ...restProps } = props;
  const recipe = useRecipe({ key: 'badge' });
  const styles = recipe({ visual });

  return <ChakraBadge ref={ref} css={styles} {...restProps} />;
});
