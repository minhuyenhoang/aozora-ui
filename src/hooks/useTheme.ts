import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useLocalStorage } from "./useLocalStorage";

/** The theme the user chose. `system` follows the device setting. */
export type Theme = "light" | "dark" | "system";

/** The theme that is shown, once `system` has been worked out. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/** The class on the root element that turns on the dark styles. */
const DARK_CLASS = "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);

  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Reads and changes the color theme of the page.
 *
 * The choice is kept in localStorage, so it is remembered and shared by every
 * component using this hook, including across tabs. The dark styles are turned
 * on by a `dark` class on the root element.
 *
 * @param defaultTheme The theme used until the user chooses one.
 * @returns The chosen theme, the theme that is shown, and a setter.
 */
export function useTheme(defaultTheme: Theme = "system") {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme | null>(
    THEME_STORAGE_KEY,
    null,
  );
  const theme = storedTheme ?? defaultTheme;

  // The server cannot know the device setting, so it renders the light theme.
  const isSystemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (isSystemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle(DARK_CLASS, resolvedTheme === "dark");
    // Makes scrollbars and native form controls match the theme.
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => setStoredTheme(next),
    [setStoredTheme],
  );

  return { theme, resolvedTheme, setTheme };
}
