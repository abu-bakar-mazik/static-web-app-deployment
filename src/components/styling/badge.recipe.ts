import { defineRecipe } from '@chakra-ui/react';
export const BadgeRecipe = defineRecipe({
  className: 'custom-input',
  base: {
    lineHeight: '100%',
    padding: '7px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '6px',
  },
  variants: {
    visual: {
      outline: {
        borderRadius: '6px',
        border: '1px solid',
      },
      brand:{
        borderRadius: '6px',
      },
    },
  },
  defaultVariants: {
    visual: 'brand',
  },
});
