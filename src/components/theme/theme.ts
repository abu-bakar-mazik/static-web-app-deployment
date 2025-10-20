import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { InputRecipe } from '../styling/input.recipe';
import { TableRecipe } from '../styling/table.recipe';
import { ButtonRecipe } from '../styling/button.recipe';
import { SelectRecipe } from '../styling/select.recipe';
import { FieldRecipe } from '../styling/field.recipe';
import { CardRecipe } from '../styling/card.recipe';
import { StepsRecipe } from '../styling/step.recipe';
import { CheckboxRecipe } from '../styling/checkbox.recipe';
import { BadgeRecipe } from '../styling/badge.recipe';
import { ToastRecipe } from '../styling/toaster.recipe';
export const stylingConfig = defineConfig({
  cssVarsRoot: ":where(html)",
  cssVarsPrefix: "bloomsbury",
  theme: {
    tokens: {
      colors: {
        gradients: {
          card1: {
            value: 'linear-gradient(90deg, #ffbf96, #fe7096)',
          },
          card2: {
            value: 'linear-gradient(90deg,#90caf9,#047edf 99%)',
          },
          card3: { value: 'linear-gradient(90deg,#84d9d2,#07cdae)' },
          mainBg: { value: 'linear-gradient(360deg,#171215 0%,#000938 100%)' },
          tableBg: { value: 'linear-gradient(280deg,#171215 0%,#000938 100%)' },
          primary: { value: 'linear-gradient(15.46deg, {colors.blue.400} 26.3%, {colors.blue.300} 86.4%)' },
          primaryHover: { value: 'linear-gradient(15.46deg, {colors.blue.600} 26.3%, {colors.blue.400} 86.4%)' },
          danger: { value: 'linear-gradient(15.46deg, {colors.red.600} 26.3%, {colors.red.500} 86.4%)' },
          dangerHover: { value: 'linear-gradient(15.46deg, {colors.red.700} 26.3%, {colors.red.600} 86.4%)' },
        },
        brand: {
          100: { value: '#E9E3FF' },
          200: { value: '#422AFB' },
          300: { value: '#422AFB' },
          400: { value: '#7551FF' },
          500: { value: '#422AFB' },
          600: { value: '#3311DB' },
          700: { value: '#02044A' },
          800: { value: '#190793' },
          900: { value: '#11047A' },
        },
        brandScheme: {
          100: { value: '#E9E3FF' },
          200: { value: '#7551FF' },
          300: { value: '#7551FF' },
          400: { value: '#7551FF' },
          500: { value: '#422AFB' },
          600: { value: '#3311DB' },
          700: { value: '#02044A' },
          800: { value: '#190793' },
          900: { value: '#02044A' },
        },
        brandTabs: {
          100: { value: '#E9E3FF' },
          200: { value: '#422AFB' },
          300: { value: '#422AFB' },
          400: { value: '#422AFB' },
          500: { value: '#422AFB' },
          600: { value: '#3311DB' },
          700: { value: '#02044A' },
          800: { value: '#190793' },
          900: { value: '#02044A' },
        },
        secondaryGray: {
          100: { value: '#E0E5F2' },
          200: { value: '#E2E8F0' },
          300: { value: '#F4F7FE' },
          400: { value: '#E9EDF7' },
          500: { value: '#718096' },
          600: { value: '#A3AED0' },
          700: { value: '#707EAE' },
          800: { value: '#707EAE' },
          900: { value: '#1B2559' },
        },
        red: {
          50: { value: '#FFF5F5' },
          100: { value: '#FED7D7' },
          200: { value: '#FEB2B2' },
          300: { value: '#FC8181' },
          400: { value: '#F56565' },
          500: { value: '#E53E3E' },
          600: { value: '#E31A1A' },
          700: { value: '#C41616' },
          800: { value: '#A21212' },
          900: { value: '#810E0E' },
          950: { value: '#5C0A0A' },
        },
        blue: {
          50: { value: '#F0F9FF' },
          100: { value: '#C6E2F7' },
          200: { value: '#95CAF2' },
          300: { value: '#63B3ED' },
          400: { value: '#4299E1' },
          500: { value: '#3182CE' },
          600: { value: '#2b6cb0' },
          700: { value: '#2C5282' },
          800: { value: '#2A4365' },
          900: { value: '#1A365D' },
          950: { value: '#0F2942' },
        },
        orange: {
          100: { value: '#FFF6DA' },
          500: { value: '#FFB547' },
        },
        green: {
          100: { value: '#E6FAF5' },
          500: { value: '#01B574' },
        },
        white: {
          50: { value: '#ffffff' },
          100: { value: '#ffffff' },
          200: { value: '#ffffff' },
          300: { value: '#ffffff' },
          400: { value: '#ffffff' },
          500: { value: '#ffffff' },
          600: { value: '#ffffff' },
          700: { value: '#ffffff' },
          800: { value: '#ffffff' },
          900: { value: '#ffffff' },
        },
        navy: {
          50: { value: '#d0dcfb' },
          100: { value: '#aac0fe' },
          200: { value: '#a3b9f8' },
          300: { value: '#728fea' },
          400: { value: '#3652ba' },
          500: { value: '#1b3bbb' },
          600: { value: '#24388a' },
          700: { value: '#1B254B' },
          800: { value: '#111c44' },
          900: { value: '#0b1437' },
        },
        gray: {
          100: { value: '#F7F7F7' },
        },
      },
      fonts: {
        heading: { value: "'Poppins', serif" },
        body: { value: "'Poppins', serif" },
        mono: { value: "'Courier New', monospace" },
      },
    },
    breakpoints: {
      base: '300px',
      sm: '575px',
      md: "992px",
      lg: "1200px",
      xl: "1400px",
    },
    semanticTokens: {
      colors: {
        cyan: {
          solid: { value: "{colors.blue.300}" },
          contrast: { value: "{colors.blue.100}" },
          fg: { value: "{colors.blue.400}" },
          muted: { value: "{colors.blue.100}" },
          subtle: { value: "{colors.blue.200}" },
          emphasized: { value: "{colors.blue.300}" },
          focusRing: { value: "{colors.blue.300}" },
        },
      },
    },
    recipes: {
      checkbox: CheckboxRecipe,
      input: InputRecipe,
      button: ButtonRecipe,
      table: TableRecipe,
      select: SelectRecipe,
      field: FieldRecipe,
      card: CardRecipe,
      step: StepsRecipe,
      badge: BadgeRecipe,
      toast: ToastRecipe,
    },
  },
  globalCss: {
    html: {
      colorPalette: 'blue',
    },
    body: {
      overflowX: 'hidden',
      bg: '#fdfeff',
      backgroundImage: 'linear-gradient(to top, #bee3f8 0%, #f7fafc 100%)',
      backgroundBlendMode: 'luminosity',
      fontFamily: 'Poppins, serif',
      color: 'gray.600',
    },
    input: {
      color: 'gray.700',
    },
    'img': {
      userSelect: 'none',
    },
    'input, textarea': {
      userSelect: 'text',
    },
    a: {
      fontSize: '14px',
      '&:hover': {
        color: 'blue.400',
      },
    },
    '&::-moz-selection': {
      color: 'white',
      background: 'blue.500'
    },
    '&::selection': {
      color: 'white',
      background: 'blue.500'
    },
  },
});

export const theme = createSystem(defaultConfig, stylingConfig);


export default theme;