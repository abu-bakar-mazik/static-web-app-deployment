import { defineRecipe } from '@chakra-ui/react';
export const CheckboxRecipe = defineRecipe({
  className: 'custom-checkbox',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'top',
    position: 'relative',
    gap: '2',
    '& [data-part="control"]': {
      _focus: {
        outline: 'none'
      },
      _focusVisible: {
        outline: 'none'
      },
    }
  },
  variants: {
    visual: {
      simple: {
        '& [data-part="root"]': {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          _disabled: {
            cursor: 'not-allowed',
            opacity: 0.4,
          },
        },
        '& [data-part="control"]': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          w: '5',
          h: '5',
          borderWidth: '1px',
          cursor: "pointer",
          borderRadius: 'sm',
          borderColor: 'gray.300',
          color: 'white',
          transition: 'all 0.2s',
          background: 'white',
          _hover: {
            borderColor: 'blue.400',
          },
          _checked: {
            bg: 'gradients.primary',
            borderColor: 'blue.400',
            color: 'white',
          },
          _indeterminate: {
            bg: 'gradients.primary',
            borderColor: 'blue.400',
            color: 'white',
          },
          _disabled: {
            bg: 'gray.100',
            borderColor: 'gray.300',
          },
        },
        '&[data-state="indeterminate"]': {
          '& > [data-part="control"]': {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            w: '5',
            h: '5',
            borderWidth: '1px',
            cursor: "pointer",
            borderRadius: 'sm',
            bg: 'gradients.primary',
            borderColor: 'blue.400',
            color: 'white',
            transition: 'all 0.2s',
            _hover: {
              borderColor: 'blue.400',
            },
            _checked: {
              bg: 'gradients.primary',
              borderColor: 'blue.400',
              color: 'white',
            },
            _indeterminate: {
              bg: 'gradients.primary',
              borderColor: 'blue.400',
              color: 'white',
            },
            _disabled: {
              bg: 'gray.100',
              borderColor: 'gray.300',
            },
          },
        },
        '& [data-part="label"]': {
          userSelect: 'none',
          // marginStart: '2',
          fontSize: 'sm',
          color: 'gray.700',
          whiteSpace: 'nowrap',
          width: '100%',
          overflow: 'hidden',
          _disabled: {
            opacity: 0.4,
          },
        },
        '& [data-part="indicator"]': {
          width: '65%',
          height: '65%',
          transition: 'transform 0.2s',
          _checked: {
            transform: 'scale(1)',
          },
          _indeterminate: {
            transform: 'scale(1)',
          },
        },
      },
      primary: {
        '& [data-part="control"]': {
          borderColor: 'gray.400',
          _checked: {
            bg: 'primary.500',
            borderColor: 'primary.500',
          },
          _indeterminate: {
            bg: 'primary.500',
            borderColor: 'primary.500',
          },
          _hover: {
            borderColor: 'primary.600',
          },
        },
      },
      secondary: {
        '& [data-part="control"]': {
          borderColor: 'gray.400',
          _checked: {
            bg: 'secondary.500',
            borderColor: 'secondary.500',
          },
          _indeterminate: {
            bg: 'secondary.500',
            borderColor: 'secondary.500',
          },
          _hover: {
            borderColor: 'secondary.600',
          },
        },
      },
    },
  },
  defaultVariants: {
    visual: 'simple',
  },
});
