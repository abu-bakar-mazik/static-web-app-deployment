import { defineRecipe } from '@chakra-ui/react';
export const CardRecipe = defineRecipe({
  className: 'custom-card',
  base: {
    overflow: 'hidden',
    p: '20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    borderRadius: '14px',
    minWidth: '0px',
    wordWrap: 'break-word',
    bg: '#ffffff',
    boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    backgroundClip: 'border-box',
    // Header styles
    '& [data-part="header"]': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: '20px',
      borderBottom: '1px solid',
      borderColor: 'gray.200',
    },
    // Body styles
    '& [data-part="body"]': {
      p: '20px',
    },
    // Footer styles
    '& [data-part="footer"]': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      p: '20px',
      borderTop: '1px solid',
      borderColor: 'gray.200',
      gap: '12px',
    },
  },
  variants: {
    visual: {
      main: {
        border: 'none',
        boxShadow: 'sm',
        _hover: {
          boxShadow: 'md',
        },
      },
      outline: {
        border: '1px solid',
        borderColor: 'gray.200',
      },
      solid: {
        boxShadow: 'sm',
      },
    },
    size: {
      sm: {
        '& [data-part="header"]': { p: '12px' },
        '& .chakra-card__body': { p: '12px' },
        '& .chakra-card__footer': { p: '12px' },
      },
      md: {
        '& .chakra-card__header': { p: '20px' },
        '& .chakra-card__body': { p: '20px' },
        '& .chakra-card__footer': { p: '20px' },
      },
      lg: {
        '& .chakra-card__header': { p: '24px' },
        '& .chakra-card__body': { p: '24px' },
        '& .chakra-card__footer': { p: '24px' },
      },
    },
    spacing: {
      compact: {
        '& .chakra-card__body': { p: '12px' },
      },
      normal: {
        '& .chakra-card__body': { p: '20px' },
      },
      relaxed: {
        '& .chakra-card__body': { p: '24px' },
      },
    },
    footerAlign: {
      start: {
        '& .chakra-card__footer': { justifyContent: 'flex-start' },
      },
      center: {
        '& .chakra-card__footer': { justifyContent: 'center' },
      },
      end: {
        '& .chakra-card__footer': { justifyContent: 'flex-end' },
      },
      between: {
        '& .chakra-card__footer': { justifyContent: 'space-between' },
      },
    },
  },
  defaultVariants: {
    visual: 'main',
    size: 'md',
    spacing: 'normal',
    footerAlign: 'end',
  },
});
