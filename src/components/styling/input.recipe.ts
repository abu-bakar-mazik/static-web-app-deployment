import { defineRecipe } from '@chakra-ui/react';
export const InputRecipe = defineRecipe({
  className: 'custom-input',
  base: {
    fontWeight: 400,
    h: '50px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'gray.200',
    _placeholder: { color: 'gray.400' },
    bg: 'white',
    _readOnly: {
      opacity: 0.5,
    },
    _focus: {
      borderColor: 'blue.400',
      outline: 'none'
    },
    _focusVisible: {
      outline: 'none'
    }
  },
  variants: {
    visual: {
      main: {
        color: 'navy.700',
        fontSize: 'sm',
        p: '20px',
      },
      auth: {
        fontWeight: '500',
        color: 'navy.700',
      },
      search: {
        border: 'none',
        py: '11px',
      },
      searchDoc: {
        color: 'navy.700',
        fontSize: 'sm',
        py: '11px',
      },
    },
  },
  defaultVariants: {
    visual: 'main',
  },
});
