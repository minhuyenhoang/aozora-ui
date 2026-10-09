import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

/** Fired on the window when this hook writes, so other users of a key update. */
const CHANGE_EVENT = "local-storage-change";

type SetValue<T> = (value: T | ((previous: T) => T)) => void;

/** Reads the raw text stored under a key. Returns null when there is none. */
function readRaw(key: string | undefined) {
  if (key === undefined) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage is blocked, for example in some private browsing modes.
    return null;
  }
}

/** Turns stored text back into a value, or the fallback when it is unusable. */
function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Listens for changes from this tab and from other tabs. */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Keeps a value in localStorage, stored as JSON.
 *
 * Works like `useState`, and also returns a function that removes the value.
 * Every component using the same key stays in sync, including across tabs.
 * Without a key, the value is only kept in memory.
 *
 * @param key The localStorage key, or undefined to skip storage.
 * @param initialValue The value used while nothing is stored.
 * @returns The value, a setter and a remover.
 */
export function useLocalStorage<T>(key: string | undefined, initialValue: T) {
  // Only used when there is no key.
  const [memoryValue, setMemoryValue] = useState(initialValue);

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
  const storedValue = useMemo(
    () => parse(raw, initialValue),
    // The initial value is only a fallback, so a new one does not re-parse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [raw],
  );
  const value = key === undefined ? memoryValue : storedValue;

  const setValue: SetValue<T> = useCallback(
    (next) => {
      if (key === undefined) {
        setMemoryValue(next);
        return;
      }

      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(parse(readRaw(key), initialValue))
          : next;

      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(new Event(CHANGE_EVENT));
      } catch {
        // Storage is full or blocked, so the value is not saved.
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const removeValue = useCallback(() => {
    if (key === undefined) {
      setMemoryValue(initialValue);
      return;
    }

    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      // Storage is blocked, so there is nothing to remove.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, removeValue] as const;
}
