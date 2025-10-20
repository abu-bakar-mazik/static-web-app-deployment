import { defineRecipe } from '@chakra-ui/react'

export const StepsRecipe = defineRecipe({
  className: 'custom-steps',
  base: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  variants: {
    visual: {
      simple: {
        '& ol': {
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          position: 'relative',
        },
        '& li': {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'gray.600',
          fontWeight: 'medium',
          position: 'relative',
          px: '12px',
          
          '& [data-part="trigger"]': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'transparent',
            borderColor: 'gray.200',
            color: 'gray.500',
            fontWeight: 'medium',
          },

          '& [data-part="indicator"]:not([data-current])': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderWidth: '2px',
            borderColor: 'gray.200',
            color: 'gray.500',
            fontWeight: 'medium',
          },
          '&[data-highlighted="true"]': {
            color: 'blue.500',
          },

          '& [data-completed="true"]': {
            color: 'green.500',
          },
        },
        '& .steps-content': {
          py: '4',
          px: '6',
          borderRadius: 'md',
          bg: 'gray.50',
          border: '1px solid',
          borderColor: 'gray.200',
          width: '100%',
          
          '&[hidden]': {
            display: 'none',
          },
        },
        '& .steps-completed-content': {
          textAlign: 'center',
          py: '8',
          fontWeight: 'medium',
          color: 'green.500',
          
          '&[hidden]': {
            display: 'none',
          },
        },
        '& .steps-group': {
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '16px',

          '& button': {
            minWidth: '80px',
          },
        },
      },
      outline: {
        '& .steps-item': {
          '&::before': {
            bg: 'transparent',
            borderWidth: '2px',
          },
          '&[data-highlighted="true"]': {
            '&::before': {
              bg: 'transparent',
              borderColor: 'blue.500',
              color: 'blue.500',
            },
          },
          '&[data-completed="true"]': {
            '&::before': {
              bg: 'transparent',
              borderColor: 'green.500',
              color: 'green.500',
            },
          },
        },
        '& .steps-content': {
          bg: 'white',
        },
      },
      minimal: {
        '& .steps-item': {
          '&::before': {
            bg: 'gray.100',
            border: 'none',
          },
          '&[data-highlighted="true"]': {
            '&::before': {
              bg: 'blue.100',
              color: 'blue.500',
            },
          },
          '&[data-completed="true"]': {
            '&::before': {
              bg: 'green.100',
              color: 'green.500',
            },
            '&::after': {
              bg: 'green.100',
            },
          },
        },
        '& .steps-content': {
          bg: 'transparent',
          border: 'none',
        },
      },
    },
  },
  defaultVariants: {
    visual: 'simple',
  },
})