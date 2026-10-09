import { createContext } from "react";

export const SelectContext = createContext<{ size: "sm" | "md" | "lg" }>({
  size: "md",
});
