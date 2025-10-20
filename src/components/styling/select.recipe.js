import { defineRecipe } from '@chakra-ui/react';
export const SelectRecipe = defineRecipe({
  className: 'custom-select',
  base: {
    position: 'relative',
    fontWeight: 400,
    borderRadius: '8px',
    // Root styles
    '& [data-part="root"]': {
      position: 'relative',
      width: 'full',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
      _disabled: {
        cursor: 'not-allowed',
        opacity: 0.6,
        bg: 'gray.50',
      },
    },
    // Label styles
    '& [data-part="label"]': {
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'gray.700',
      _disabled: {
        opacity: 0.6,
      },
    },
    // Trigger styles
    '& [data-part="trigger"]': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'unset',
      width: 'full',
      gap: '2',
      padding: 2,
      border: '1px solid',
      h: '50px',
      borderColor: 'gray.200',
      borderRadius: '10px',
      bg: 'transparent',
      color: 'navy.700',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      _hover: {
        borderColor: 'gray.300',
      },
      _focusWithin: {
        borderColor: 'navy.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-navy-500)',
      },
      _invalid: {
        borderColor: 'red.500',
        _focusWithin: {
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
        },
      },
      _disabled: {
        cursor: 'not-allowed',
      },
    },
    // Value text styles
    '& [data-part="value"]': {
      flex: '1',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      _placeholder: {
        color: 'gray.400',
      },
    },
    // Content styles
    '& [data-part="content"]': {
      bg: 'white',
      borderColor: 'gray.200',
      boxShadow: 'lg',
      maxH: '300px',
      overflowY: 'auto',
      zIndex: 50,
      p: '1',
      borderRadius: 'md',
      mt: '1',
    },
    // Group styles
    '& [data-part="group"]': {
      py: '2',
    },
    // Group label styles
    '& [data-part="group-label"]': {
      px: '3',
      py: '1.5',
      fontSize: 'xs',
      fontWeight: '500',
      color: 'gray.500',
      textTransform: 'uppercase',
      letterSpacing: 'wider',
    },
    // Item styles
    '& [data-part="item"]': {
      px: '3',
      py: '2',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: 'sm',
      color: 'gray.700',
      transition: 'all 0.2s ease-in-out',
      _hover: {
        bg: 'gray.50',
      },
      _selected: {
        bg: 'navy.50',
        color: 'navy.700',
        fontWeight: '500',
      },
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        _hover: {
          bg: 'transparent',
        },
      },
    },
  },
  variants: {
    visual: {
      main: {
        bg: 'transparent',
        border: '1px solid',
        color: 'gray.500',
        borderColor: 'whiteAlpha.100',
        borderRadius: '6px',
        _placeholder: { color: 'navy.700' },
      },
      mini: {
        bg: 'transparent',
        border: '0px solid transparent',
        fontSize: '0px',
        p: '10px',
        _placeholder: { color: 'navy.700' },
      },
      subtle: {
        bg: 'transparent',
        border: '0px solid',
        color: 'gray.500',
        borderColor: 'transparent',
        width: 'max-content',
        _placeholder: { color: 'navy.700' },
      },
      transparent: {
        bg: 'transparent',
        border: '0px solid',
        width: 'min-content',
        color: 'gray.500',
        borderColor: 'transparent',
        padding: '0px',
        paddingLeft: '8px',
        paddingRight: '20px',
        fontWeight: '700',
        fontSize: '14px',
        _placeholder: { color: 'navy.700' },
      },
      auth: {
        bg: 'transparent',
        border: '1px solid',
        borderColor: 'gray.200',
        borderRadius: '12px',
        _placeholder: { color: 'navy.700' },
      },
      authSecondary: {
        bg: 'transparent',
        border: '1px solid',

        borderColor: 'gray.200',
        borderRadius: '12px',
        _placeholder: { color: 'navy.700' },
      },
      search: {
        border: 'none',
        py: '11px',
        borderRadius: 'inherit',
        _placeholder: { color: 'navy.700' },
      },
      outline: {
        '& [data-part="trigger"]': {
          border: '1px solid',
          borderColor: 'gray.200',
          bg: 'white',
        },
      },
      filled: {
        '& [data-part="trigger"]': {
          border: '2px solid',
          borderColor: 'transparent',
          bg: 'gray.100',
          _hover: {
            bg: 'gray.200',
          },
          _focusWithin: {
            bg: 'white',
            borderColor: 'navy.500',
          },
        },
      },
      flushed: {
        '& [data-part="trigger"]': {
          borderRadius: '0',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          px: '0',
          _focusWithin: {
            boxShadow: 'none',
            borderColor: 'navy.500',
          },
        },
      },
    },
  },
  defaultVariants: {
    visual: 'outline',
  },
});
