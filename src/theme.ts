import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    body: {
      fontFamily: "body",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Space Grotesk', Inter, system-ui, sans-serif" },
        body: { value: "Inter, system-ui, sans-serif" },
        mono: { value: "'IBM Plex Mono', 'JetBrains Mono', monospace" },
      },
      colors: {
        brand: {
          50: { value: "#f0fdfa" },
          100: { value: "#ccfbf1" },
          200: { value: "#99f6e4" },
          300: { value: "#5eead4" },
          400: { value: "#2dd4bf" },
          500: { value: "#14b8a6" },
          600: { value: "#0d9488" },
          700: { value: "#0f766e" },
          800: { value: "#115e59" },
          900: { value: "#134e4a" },
          950: { value: "#042f2e" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.50}" },
          emphasized: { value: "{colors.brand.200}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
