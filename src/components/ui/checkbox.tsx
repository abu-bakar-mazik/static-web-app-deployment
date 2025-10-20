'use client';
import { Checkbox as ChakraCheckbox, RecipeVariantProps, useRecipe } from '@chakra-ui/react';
import * as React from 'react';
import { CheckboxRecipe } from '../styling/checkbox.recipe';

type CheckboxVariantProps = RecipeVariantProps<typeof CheckboxRecipe>;
interface CheckboxOtherProps {
  icon?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.Ref<HTMLLabelElement>;
  order?: number;
  indeterminate?: boolean;
  checked?: boolean;
}
export interface CheckboxProps extends Omit<ChakraCheckbox.RootProps, keyof CheckboxOtherProps>, CheckboxOtherProps, CheckboxVariantProps {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const { visual, order, indeterminate, checked, icon, children, inputProps, rootRef, ...rest } = props;
  const recipe = useRecipe({ key: 'checkbox' });
  const styles = recipe({ visual });
  return (
    <ChakraCheckbox.Root css={styles} ref={rootRef} data-state={indeterminate ? "indeterminate" : ''} checked={indeterminate ? 'indeterminate' : checked} {...rest}>
      <ChakraCheckbox.HiddenInput ref={ref} {...inputProps} />
      <ChakraCheckbox.Control order={order} ml={order && order > 1 ? 'auto' : undefined}>{icon || <ChakraCheckbox.Indicator />}</ChakraCheckbox.Control>
      {children != null && <ChakraCheckbox.Label ml={order && order > 1 ? 0 : undefined} mr={order && order < 2 ? 0 : '0.5rem'}>{children}</ChakraCheckbox.Label>}
    </ChakraCheckbox.Root>
  );
});
