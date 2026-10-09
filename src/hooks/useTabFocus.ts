import { type FocusEvent, useCallback, useState } from "react";

/** Whether the last thing the user did was press Tab. */
let wasTabPressed = false;
let isListening = false;

/** Starts watching the whole page, the first time the hook is used. */
function listen() {
  if (isListening || typeof window === "undefined") return;

  isListening = true;
  // Capturing, so a handler that stops the event does not hide it from here.
  window.addEventListener(
    "keydown",
    (event) => {
      wasTabPressed = event.key === "Tab";
    },
    true,
  );
  window.addEventListener(
    "pointerdown",
    () => {
      wasTabPressed = false;
    },
    true,
  );
}

/**
 * Tells whether an element was focused with the Tab key.
 *
 * This is stricter than the browser's `:focus-visible`, which also applies
 * when focus is moved for the user after any key press. Here only focus that
 * arrives through Tab or Shift+Tab counts, until the element loses focus.
 *
 * @returns Whether the element is focused by Tab, and the props to spread on it.
 */
export function useTabFocus<T extends Element = Element>() {
  const [isTabFocused, setIsTabFocused] = useState(false);

  listen();

  const onFocus = useCallback((event: FocusEvent<T>) => {
    // Focus moving within the element is not the element being focused.
    if (event.target === event.currentTarget) setIsTabFocused(wasTabPressed);
  }, []);
  const onBlur = useCallback((event: FocusEvent<T>) => {
    if (event.target === event.currentTarget) setIsTabFocused(false);
  }, []);

  return { isTabFocused, focusProps: { onFocus, onBlur } };
}
