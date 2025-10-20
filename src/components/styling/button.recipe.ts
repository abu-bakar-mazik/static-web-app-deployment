import { defineRecipe } from "@chakra-ui/react";
import { IoColorPalette } from "react-icons/io5";

export const ButtonRecipe = defineRecipe({
  className: "custom-button",
  base: {
    borderRadius: "10px",
    boxShadow: "none",
    transition: ".3s all ease",
    boxSizing: "border-box",
    _focus: {
      boxShadow: "none",
      outline: 'none'
    },
    _focusVisible: {
      outline: 'none'
    },
    _active: {
      boxShadow: "none",
    },
    px: 6,
  },
  variants: {
    visual: {
      transparent: {
        bg: "transparent",
        color: "navy.700",
        boxShadow: "none",
        _focus: {
          bg: "none",
        },
        _active: {
          bg: "gray.200",
        },
        _hover: {
          boxShadow: "unset",
          bg: "gray.100",
        },
        '&[data-expanded]': {
          bg: 'transparent',
        },
        '&[data-state="expanded"]': {
          bg: 'transparent',
        }
      },
      a: {
        bg: "transparent",
        color: "transparent",
        padding: 0,
        _focus: {
          bg: "transparent",
        },
        _active: {
          bg: "transparent",
        },
        _hover: {
          boxShadow: "unset",
          textDecoration: "underline",
          bg: "transparent",
        },
      },
      primary: {
        bg: `gradients.primary`,
        color: "white",
        boxShadow: "none",
        _focus: {
          bg: `gradients.primaryHover`,
          color: "white",
        },
        _active: {
          bg: `gradients.primaryHover`,
          color: "white",
        },
        _hover: {
          boxShadow:
            "0px 21px 27px -10px {colors.blue.500/50}",
          bg: `gradients.primaryHover`,
          color: "white",
        },
        '&[data-expanded]': {
          bg: `gradients.primaryHover`,
        },
        '&[data-state="expanded"]': {
          bg: `gradients.primaryHover`,
        }
      },
      red: {
        bg: "gradients.danger",
        color: "red.50",
        boxShadow: "none",
        _focus: {
          bg: "gradients.dangerHover",
          color: "red.50",
        },
        _active: {
          bg: "gradients.dangerHover",
          color: "red.50",
        },
        _hover: {
          bg: "gradients.dangerHover",
          color: "red.50",
        },
        '&[data-expanded]': {
          bg: `gradients.dangerHover`,
        },
        '&[data-state="expanded"]': {
          bg: `gradients.dangerHover`,
        }
      },
      outlineRed: {
        border: '1px solid',
        borderColor: 'red.600',
        color: "red.600",
        boxShadow: "none",
        bg: 'transparent',
        _focus: {
          bg: "gradients.dangerHover",
          color: 'white',
        },
        _active: {
          bg: "gradients.dangerHover",
          color: 'white',
        },
        _hover: {
          bg: "gradients.dangerHover",
          color: 'white',
          boxShadow:
            "0px 21px 27px -10px {colors.red.600/30}"
        },
      },
      chakraLinear: {
        bg: "linear-gradient(15.46deg, #7BCBD4 0%, #29C6B7 100%)",
        color: "white",
        boxShadow: "none",
        _focus: {
          bg: "linear-gradient(15.46deg, #7BCBD4 0%, #29C6B7 100%)",
          color: "white",
        },
        _active: {
          bg: "linear-gradient(15.46deg, #7BCBD4 0%, #29C6B7 100%)",
          color: "white",
        },
        _hover: {
          boxShadow:
            "0px 21px 27px -10px rgba(67, 200, 192, 0.47)",
          bg: "linear-gradient(15.46deg, #7BCBD4 0%, #29C6B7 100%)",
          color: "white",
        },
      },
      outline: {
        border: "1px solid",
        borderColor: "{colors.blue.500}",
        color: "{colors.blue.500}",
        boxShadow: "none",
        bg: 'transparent',
        _focus: {
          bg: "linear-gradient(15.46deg, {colors.blue.600} 26.3%, {colors.blue.500} 86.4%)",
          color: "white",
        },
        _active: {
          bg: "linear-gradient(15.46deg, {colors.blue.600} 26.3%, {colors.blue.500} 86.4%)",
          color: "white",
        },
        _hover: {
          bg: "linear-gradient(15.46deg, {colors.blue.600} 26.3%, {colors.blue.500} 86.4%)",
          color: "white",
        },
      },
      ghost: {
        border: "none",
        boxShadow: "none",
        bg: 'transparent',
        color: "{colors.gray.600}",
        _focus: {
          bg: "transparent",
          color: "{colors.blue.500}",
          outline: 'none'
        },
        _active: {
          bg: "transparent",
          color: "{colors.blue.500}",
          outline: 'none'
        },
        _hover: {
          bg: "transparent",
          color: "{colors.blue.500}",
          outline: 'none',
          boxShadow: 'none',
        },
        '&[data-expanded]': {
          bg: 'transparent',
        },
        '&[data-state="expanded"]': {
          bg: 'transparent',
        }
      },
      api: {
        bg: "navy.700",
        color: "white",
        _focus: {
          bg: "navy.700",
        },
        _active: {
          bg: "navy.700",
        },
        _hover: {
          bg: "navy.800",
          boxShadow: "unset",
        },
      },
      brand: {
        bg: "brand.500",
        color: "white",
        _focus: {
          bg: "brand.500",
        },
        _active: {
          bg: "brand.500",
        },
        _hover: {
          bg: "brand.600",
          boxShadow: "0px 21px 27px -10px rgba(96, 60, 255, 0.48)",
        },
      },
      darkBrand: {
        bg: "brand.900",
        color: "white",
        _focus: {
          bg: "brand.900",
        },
        _active: {
          bg: "brand.900",
        },
        _hover: {
          bg: "brand.800",
        },
      },
      lightBrand: {
        bg: "#F2EFFF",
        color: "brand.500",
        _focus: {
          bg: "#F2EFFF",
        },
        _active: {
          bg: "secondaryGray.300",
        },
        _hover: {
          bg: "secondaryGray.400",
        },
      },
      light: {
        bg: "secondaryGray.300",
        color: "navy.700",
        _focus: {
          bg: "secondaryGray.300",
        },
        _active: {
          bg: "secondaryGray.300",
        },
        _hover: {
          bg: "secondaryGray.400",
        },
      },
      action: {
        fontWeight: "500",
        borderRadius: "50px",
        bg: "secondaryGray.300",
        color: "brand.500",
        _focus: {
          bg: "secondaryGray.300",
        },
        _active: {
          bg: "secondaryGray.300",
        },
        _hover: {
          bg: "gray.200",
        },
      },
      setup: {
        fontWeight: "500",
        borderRadius: "50px",
        bg: "transparent",
        border: "1px solid",
        borderColor: "secondaryGray.400",
        color: "navy.700",
        _focus: {
          bg: "transparent",
        },
        _active: { bg: "transparent" },
        _hover: {
          bg: "gray.200",
        },
      },
    },
  },
  defaultVariants: {
    visual: "primary",
  },
});
