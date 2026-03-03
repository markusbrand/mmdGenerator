/**
 * Mermaid theme/template config (~20 options: built-in + base presets). Extensible.
 */
export interface ThemeConfig {
  id: string;
  nameKey: string;
  mermaidTheme: string;
  themeVariables?: Record<string, string>;
}

export const MERMAID_THEMES: ThemeConfig[] = [
  { id: "default", nameKey: "themes.default", mermaidTheme: "default" },
  { id: "dark", nameKey: "themes.dark", mermaidTheme: "dark" },
  { id: "neutral", nameKey: "themes.neutral", mermaidTheme: "neutral" },
  { id: "forest", nameKey: "themes.forest", mermaidTheme: "forest" },
  { id: "base", nameKey: "themes.base", mermaidTheme: "base" },
  {
    id: "ocean",
    nameKey: "themes.ocean",
    mermaidTheme: "base",
    themeVariables: {
      primaryColor: "#1e88e5",
      primaryTextColor: "#fff",
      primaryBorderColor: "#0d47a1",
      lineColor: "#1565c0",
      secondaryColor: "#e3f2fd",
      tertiaryColor: "#bbdefb",
    },
  },
  {
    id: "sunset",
    nameKey: "themes.sunset",
    mermaidTheme: "base",
    themeVariables: {
      primaryColor: "#ff7043",
      primaryTextColor: "#fff",
      primaryBorderColor: "#bf360c",
      lineColor: "#e64a19",
      secondaryColor: "#ffecb3",
      tertiaryColor: "#ffe0b2",
    },
  },
  {
    id: "forest_custom",
    nameKey: "themes.forestGreen",
    mermaidTheme: "base",
    themeVariables: {
      primaryColor: "#2e7d32",
      primaryTextColor: "#fff",
      primaryBorderColor: "#1b5e20",
      lineColor: "#388e3c",
      secondaryColor: "#e8f5e9",
      tertiaryColor: "#c8e6c9",
    },
  },
  {
    id: "monochrome",
    nameKey: "themes.monochrome",
    mermaidTheme: "base",
    themeVariables: {
      primaryColor: "#424242",
      primaryTextColor: "#fff",
      primaryBorderColor: "#212121",
      lineColor: "#616161",
      secondaryColor: "#fafafa",
      tertiaryColor: "#e0e0e0",
    },
  },
  {
    id: "highContrast",
    nameKey: "themes.highContrast",
    mermaidTheme: "base",
    themeVariables: {
      primaryColor: "#000",
      primaryTextColor: "#fff",
      primaryBorderColor: "#000",
      lineColor: "#000",
      secondaryColor: "#fff",
      tertiaryColor: "#f5f5f5",
    },
  },
];
