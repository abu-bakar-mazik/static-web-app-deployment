import { defineRecipe } from '@chakra-ui/react'

export const TableRecipe = defineRecipe({
  className: 'custom-table',
  base: {
    width: '100%',
    tableLayout: {base: 'fixed', sm: 'auto'},
    borderCollapse: 'collapse',
    border: '1px solid',
    borderColor: 'gray.200'
  },
  variants: {
    visual: {
      simple: {
        '& th': {
          bg: 'transparent',
          color: 'white',
          textAlign: 'left',
          fontWeight: 'semibold',
          px: 6,
          py: 4,
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          position: 'relative',
          cursor: 'default',
        },
        '& td': {
          px: 6,
          py: 4,
          border: '1px solid',
          borderColor: 'gray.200',
          position: 'relative',
        },
        '& tbody': {
          bg: 'white',
          '& tr': {
            _hover: {
              bg: 'gray.50',
            },
            '& td': {
              bg: 'white',
              color: 'gray.600'
            }
          },
        },
        '& thead': {
          bg: 'gradients.tableBg',
          '& tr': {
            bg: 'transparent',
            th: {
              bg: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              boxShadow: 'sm',
            },
          },
        },
      },
    }
  },
  defaultVariants: {
    visual: 'simple',
  },
})
