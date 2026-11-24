const THEME_KEY = "theme";
const LANGUAGE_KEY = "language";

export const getTheme = () => localStorage.getItem(THEME_KEY) || "light";
export const getLanguage = () => localStorage.getItem(LANGUAGE_KEY) || "en";

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function setLanguage(code) {
  localStorage.setItem(LANGUAGE_KEY, code);
}

// Apply the saved theme as soon as the app loads
document.documentElement.setAttribute("data-theme", getTheme());