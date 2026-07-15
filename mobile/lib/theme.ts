export type ThemeColors = {
  bg: string;
  card: string;
  cardHover: string;
  border: string;
  borderActive: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  chip: string;
  chipActive: string;
  chipActiveText: string;
  accent: string;
  accentDark: string;
  onAccent: string;
  error: string;
  errorBg: string;
  input: string;
  tabBar: string;
  sidebar: string;
  badgeOverlay: string;
};

export const darkColors: ThemeColors = {
  bg: "#121212",
  card: "#1E1E1E",
  cardHover: "#242424",
  border: "#333333",
  borderActive: "#FFFFFF",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
  chip: "#2A2A2A",
  chipActive: "#FFFFFF",
  chipActiveText: "#121212",
  accent: "#4ADE80",
  accentDark: "#2D6A4F",
  onAccent: "#FFFFFF",
  error: "#F87171",
  errorBg: "#3B1515",
  input: "#1E1E1E",
  tabBar: "#1A1A1A",
  sidebar: "#161616",
  badgeOverlay: "rgba(0,0,0,0.65)",
};

export const lightColors: ThemeColors = {
  bg: "#F8FFF8",
  card: "#FFFFFF",
  cardHover: "#F0F7F2",
  border: "#D8F3DC",
  borderActive: "#2D6A4F",
  text: "#1B4332",
  textSecondary: "#5C6B5F",
  textMuted: "#888888",
  chip: "#E8F5E9",
  chipActive: "#2D6A4F",
  chipActiveText: "#FFFFFF",
  accent: "#2D6A4F",
  accentDark: "#2D6A4F",
  onAccent: "#FFFFFF",
  error: "#B91C1C",
  errorBg: "#FEE2E2",
  input: "#FFFFFF",
  tabBar: "#FFFFFF",
  sidebar: "#FFFFFF",
  badgeOverlay: "rgba(27,67,50,0.75)",
};

/** @deprecated use useTheme().colors */
export const colors = darkColors;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export type ThemeMode = "light" | "dark";
