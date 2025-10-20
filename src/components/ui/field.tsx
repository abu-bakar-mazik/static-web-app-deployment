'use client';
import { Field as ChakraField, FieldRootProps, RecipeVariantProps, useRecipe } from '@chakra-ui/react';
import * as React from 'react';
import { FieldRecipe } from '../styling/field.recipe';

type FieldVariantProps = RecipeVariantProps<typeof FieldRecipe>;
interface FieldOtherProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  optionalText?: React.ReactNode;
}
interface FieldProps extends FieldRootProps, FieldOtherProps, FieldVariantProps {}

export const FieldRoot = React.forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
  const { visual, label, children, helperText, errorText, optionalText, id, ...rest } = props;
  const recipe = useRecipe({ key: 'field' });
  const styles = recipe({ visual });
  return (
    <ChakraField.Root css={styles} ref={ref} id={id} {...rest}>
      {label && (
        <ChakraField.Label>
          {label}
          <ChakraField.RequiredIndicator fallback={optionalText} />
        </ChakraField.Label>
      )}
      {children}
      {helperText && <ChakraField.HelperText>{helperText}</ChakraField.HelperText>}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
});
