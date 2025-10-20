import { defineRecipe } from "@chakra-ui/react";

export const ToastRecipe = defineRecipe({
  className: "custom-toast",
  base: {
    borderRadius: "10px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    transition: ".3s all ease",
    boxSizing: "border-box",
    p: 4,
    gap: 3,
    bg: "white",
    "&[data-type]": {
      color: 'gray.600',
      "& svg": {
        width: 6,
        height: 6
      },
      "& [data-part=title]": {
        fontWeight: 'bold',
        fontSize: 16
      },
      "& [data-part=description]": {
        color: 'gray.600'
      }
    }
  },
  variants: {
    type: {
      success: {
        bg: "green.50",
        borderLeft: "4px solid",
        borderLeftColor: "green.500",
        "& .chakra-toast-indicator": {
          color: "green.500",
        },
      },
      error: {
        bg: "red.50",
        borderLeft: "4px solid",
        borderLeftColor: "red.500",
        "& .chakra-toast-indicator": {
          color: "red.500",
        },
      },
      warning: {
        bg: "orange.50",
        borderLeft: "4px solid",
        borderLeftColor: "orange.500",
        "& .chakra-toast-indicator": {
          color: "orange.500",
        },
      },
      info: {
        bg: "blue.50",
        borderLeft: "4px solid",
        borderLeftColor: "blue.500",
        "& .chakra-toast-indicator": {
          color: "blue.500",
        },
      },
      loading: {
        bg: "gray.50",
        borderLeft: "4px solid",
        borderLeftColor: "gray.500",
        "& .chakra-spinner": {
          color: "blue.500",
        },
      },
    },
    visual: {
      solid: {
        "& .chakra-toast-title": {
          fontWeight: "600",
          color: "gray.800",
        },
        "& .chakra-toast-description": {
          color: "gray.600",
        },
        "& .chakra-toast-action-trigger": {
          fontWeight: "500",
          color: "blue.600",
          _hover: {
            color: "blue.700",
            textDecoration: "underline",
          },
        },
        "& .chakra-toast-close-trigger": {
          color: "gray.500",
          _hover: {
            color: "gray.700",
          },
        },
      },
      subtle: {
        boxShadow: "none",
        bg: "transparent",
        borderLeft: "4px solid",
        "&[data-type=success]": {
          bg: 'green.50',
          borderLeftColor: 'green.600',
          "& svg": {
            color: 'green.600',
          },
        },
        "&[data-type=error]": {
          bg: 'red.50',
          borderLeftColor: 'red.600',
          "& svg": {
            color: 'red.600',
          },
        },
        "&[data-type=warning]": {
          bg: 'orange.50',
          borderLeftColor: 'orange.500',
          "& svg": {
            color: 'orange.500',
          },
        },
        "&[data-type=info]": {
          bg: 'blue.50',
          borderLeftColor: 'blue.600',
          "& svg": {
            color: 'blue.600',
          },
        },
        "&[data-type=loading]": {
          bg: 'gray.50',
          borderLeftColor: 'gray.500',
          "& svg": {
            color: 'blue.500',
          },
        }
      },
      floating: {
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
        borderRadius: "12px",
        borderLeft: "none",
        "& .chakra-toast-title": {
          fontWeight: "700",
        },
      },
      minimal: {
        boxShadow: "none",
        bg: "white",
        border: "1px solid",
        borderColor: "gray.200",
        borderRadius: "6px",
        p: 3,
        "& .chakra-toast-title": {
          fontSize: "sm",
        },
        "& .chakra-toast-description": {
          fontSize: "xs",
        },
      },
    },
  },
  defaultVariants: {
    type: "info",
    visual: "solid",
  },
});