import { defineRecipe } from "@chakra-ui/react";
export const FieldRecipe = defineRecipe({
    className: "custom-field",
    base: {
        position: "relative",
        width: "full",
        fontWeight: 400,
        borderRadius: "8px",
        '& [data-part="root"]': {
            display: "flex",
            flexDirection: "column",
            gap: "4px",
        },
        '& [data-part="label"]': {
            fontSize: "sm",
            fontWeight: "semibold",
            color: "gray.700",
            mb: 1,
            // _invalid: {
            //     color: "red.600",
            // },
        },
        '& [data-part="input"]': {
            bg: 'transparent',
            width: "full",
            px: "12px",
            py: "8px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: "gray.200",
            color: "navy.700",
            _placeholder: { color: "gray.400" },
            _hover: {
                borderColor: "gray.300",
            },
            _focus: {
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
            },
            _invalid: {
                // borderColor: "red.500",
                _hover: {
                    // borderColor: "red.600",
                },
                _focus: {
                    // borderColor: "red.500",
                    // boxShadow: "0 0 0 1px var(--chakra-colors-red-500)",
                },
            },
        },
        // Error text styles
        '& [data-part="error"]': {
            fontSize: "sm",
            color: "red.600",
            mt: "2px",
        },
    },
    variants: {
        size: {
            sm: {
                '& [data-part="label"]': { fontSize: "xs" },
                '& [data-part="input"]': {
                    px: "8px",
                    py: "6px",
                    fontSize: "sm",
                },
                '& [data-part="error"]': { fontSize: "xs" },
            },
            md: {
                '& [data-part="label"]': { fontSize: "sm" },
                '& [data-part="input"]': {
                    px: "12px",
                    py: "8px",
                    fontSize: "md",
                },
                '& [data-part="error"]': { fontSize: "sm" },
            },
            lg: {
                '& [data-part="label"]': { fontSize: "md" },
                '& [data-part="input"]': {
                    px: "16px",
                    py: "10px",
                    fontSize: "lg",
                },
                '& [data-part="error"]': { fontSize: "md" },
            },
        },
        visual: {
            outline: {
                '& .custom-input': {
                    border: "1px solid",
                    borderColor: "gray.200",
                    bg: 'rgba(255,255,255,0.5)',
                    h: '50px',
                    fontSize: 'sm',
                },
            },
            filled: {
                '& .custom-input': {
                    border: "2px solid",
                    borderColor: "transparent",
                    bg: "gray.100",
                    h: '50px',
                    fontSize: 'sm',
                    _hover: {
                        bg: "gray.200",
                    },
                    _focus: {
                        bg: "white",
                        borderColor: "blue.500",
                    },
                    _invalid: {
                        bg: "red.50",
                        _hover: {
                            bg: "red.100",
                        },
                        _focus: {
                            bg: "white",
                            borderColor: "red.500",
                        },
                    },
                },
            },
            flushed: {
                '& [data-part="input"]': {
                    borderRadius: "0",
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "1px solid",
                    borderColor: "gray.200",
                    px: "0",
                    _focus: {
                        boxShadow: "none",
                        borderColor: "blue.500",
                    },
                    _invalid: {
                        borderColor: "red.500",
                    },
                },
            },
        },
        isRequired: {
            true: {
                '& [data-part="label"]': {
                    _after: {
                        content: '" *"',
                        color: "red.500",
                    },
                },
            },
        },
    },
    defaultVariants: {
        size: "md",
        visual: "outline",
        isRequired: false,
    },
});
