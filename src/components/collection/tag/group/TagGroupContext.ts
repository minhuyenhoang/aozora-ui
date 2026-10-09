import { createContext } from "react";

export interface TagGroupContextValue {
  selectionMode: "none" | "single" | "multiple";
  size: "sm" | "md" | "lg";
}

export const TagGroupContext = createContext<TagGroupContextValue>({
  selectionMode: "none",
  size: "sm",
});
